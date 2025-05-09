
import type { Category, LinkItem } from '@/types';
import type { IDataService } from './data-service-interface';
import { Pool, type PoolClient } from 'pg';
import crypto from 'crypto';

// Database table names
const CATEGORIES_TABLE = 'categories';
const LINKS_TABLE = 'links';

export class PostgresDataService implements IDataService {
  private pool: Pool | null = null;

  constructor() {
    // console.log("PostgresDataService: Constructor called.");
    try {
      const connectionString = process.env.POSTGRES_CONNECTION_STRING;
      if (connectionString) {
        this.pool = new Pool({ connectionString });
        // console.log("PostgresDataService: Pool configured using POSTGRES_CONNECTION_STRING.");
      } else if (
        process.env.POSTGRES_HOST &&
        process.env.POSTGRES_PORT &&
        process.env.POSTGRES_USER &&
        process.env.POSTGRES_PASSWORD &&
        process.env.POSTGRES_DB
      ) {
        this.pool = new Pool({
          host: process.env.POSTGRES_HOST,
          port: parseInt(process.env.POSTGRES_PORT, 10),
          user: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
        });
        // console.log("PostgresDataService: Pool configured using individual POSTGRES_ variables.");
      } else {
        const errMsg = "PostgresDataService CRITICAL Error: PostgreSQL connection details NOT FOUND in environment variables. Set POSTGRES_CONNECTION_STRING or individual POSTGRES_ variables.";
        console.error("CRITICAL_ERROR_TRACE: PostgresConfigMissingInConstructor", { errMsg });
        throw new Error(errMsg);
      }
      
      if (!this.pool) {
         const errMsg = "PostgresDataService CRITICAL: Pool object is NULL after initialization attempt, though no error was thrown by Pool constructor. This is unexpected.";
         console.error("CRITICAL_ERROR_TRACE: PoolObjectNullAfterInit", { errMsg });
         throw new Error(errMsg);
      }
      // console.log("PostgresDataService: Pool object successfully created. Health check will be performed separately.");
    } catch (error: any) {
      console.error("PostgresDataService CRITICAL: Failed to initialize PostgreSQL pool during constructor.", {
        errorMessage: error.message,
        errorStack: error.stack?.substring(0, 700) // Increased stack trace length
      });
      this.pool = null; 
      throw error; 
    }
  }

  async healthCheck(): Promise<void> {
    // console.log("PostgresDataService: healthCheck() called.");
    if (!this.pool) {
       console.error("CRITICAL_ERROR_TRACE: PoolNotInitializedForHealthCheck");
      throw new Error("PostgresDataService: Pool is not initialized. Health check failed.");
    }
    let client: PoolClient | undefined;
    try {
      // console.log("PostgresDataService: Acquiring client for health check ping.");
      client = await this.pool.connect(); // Acquire a client to ensure the pool can provide one
      // console.log("PostgresDataService: Client acquired for health check. Pinging (SELECT 1).");
      await client.query('SELECT 1');
      // console.log("PostgresDataService: Health check (SELECT 1) successful.");
    } catch (error: any) {
      console.error("PostgresDataService: Health check FAILED.", { 
        errorMessage: error.message, 
        errorCode: error.code,
        errorStack: error.stack?.substring(0, 700) // Increased stack trace length
      });
      // Specific Vercel/Neon hints (from original README)
      if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
          console.error("Hint: Timeout or connection refused errors often indicate network connectivity issues (e.g., firewall, incorrect host/port) or that the database server is not running/accessible.");
      }
      if (error.message.includes('authentication') || (error.code && error.code.startsWith('28'))) {
          console.error("Hint: Authentication errors (like invalid password) mean the database server is reachable, but credentials are wrong.");
      }
      if (error.message.includes('database') && error.message.includes('does not exist') || (error.code && error.code.startsWith('3D'))) {
          console.error("Hint: 'Database does not exist' errors mean the server is reachable but the specified database name is incorrect or not created.");
      }
      throw new Error(`PostgresDataService: Health check failed. Unable to connect or query database. Original error: ${error.message}`);
    } finally {
      if (client) {
        client.release();
        // console.log("PostgresDataService: Health check client released.");
      }
    }
  }


  private async executeQuery<T>(queryText: string, values?: any[]): Promise<T[]> {
    const querySnippet = queryText.substring(0,150);
    // console.log(`PostgresDataService: Attempting to execute query: ${querySnippet}... Values: ${values ? JSON.stringify(values) : 'None'}`);
    if (!this.pool) {
      console.error("PostgresDataService Error: PostgreSQL pool is not initialized. Cannot execute query. This indicates a failure during constructor or that connection details are missing/invalid.");
      throw new Error("PostgreSQL pool not initialized. Database connection failed during setup.");
    }
    
    let client: PoolClient | undefined;
    try {
      // console.log(`PostgresDataService: Acquiring client from pool for query: ${querySnippet}`);
      client = await this.pool.connect();
      // console.log(`PostgresDataService: Client acquired. Executing query: ${querySnippet}`);
      const result = await client.query(queryText, values);
      // console.log(`PostgresDataService: Query executed successfully for: ${querySnippet}. Rows affected/returned: ${result.rowCount}`);
      return result.rows as T[];
    } catch (error: any) {
      console.error(`PostgresDataService Error: Failed during query execution for "${querySnippet}". Values: ${values ? JSON.stringify(values).substring(0,200) : 'None'}`, { // Truncate long values
        errorMessage: error.message,
        errorCode: error.code,
        errorDetail: error.detail, 
        errorHint: error.hint,     
        errorStack: error.stack?.substring(0, 700) 
      });
      throw error; 
    } finally {
      if (client) {
        client.release();
        // console.log(`PostgresDataService: Client released back to pool after query: ${querySnippet}`);
      }
    }
  }


  async getCategories(): Promise<Category[]> {
    const query = `SELECT id, name, description, icon FROM ${CATEGORIES_TABLE}`;
    return this.executeQuery<Category>(query);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const query = `SELECT id, name, description, icon FROM ${CATEGORIES_TABLE} WHERE id = $1`;
    const categories = await this.executeQuery<Category>(query, [id]);
    return categories[0];
  }

  async addCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    const { name, description, icon } = categoryData;
    const newId = crypto.randomUUID();
    const query = `INSERT INTO ${CATEGORIES_TABLE} (id, name, description, icon) VALUES ($1, $2, $3, $4) RETURNING id, name, description, icon`;
    const result = await this.executeQuery<Category>(query, [newId, name, description || null, icon || null]);
    if (result.length === 0) {
        console.error("PostgresDataService Error: Failed to add category, no data returned from insert operation for query:", query.substring(0,150));
        throw new Error("PostgresDataService: Failed to add category, INSERT operation did not return the new record.");
    }
    return result[0];
  }

  async updateCategory(updatedCategory: Category): Promise<Category | null> {
    const { id, name, description, icon } = updatedCategory;
    const query = `UPDATE ${CATEGORIES_TABLE} SET name = $1, description = $2, icon = $3 WHERE id = $4 RETURNING id, name, description, icon`;
    const result = await this.executeQuery<Category>(query, [name, description || null, icon || null, id]);
    return result[0] || null;
  }

  async deleteCategory(id: string): Promise<boolean> {
    if (!this.pool) {
      console.error("PostgresDataService Error: PostgreSQL pool not initialized. Cannot delete category.");
      throw new Error("PostgreSQL pool not initialized for deleteCategory.");
    }
    const client: PoolClient = await this.pool.connect();
    try {
      // console.log(`PostgresDataService: Starting transaction to delete category ${id} and its links.`);
      await client.query('BEGIN');
      const deleteLinksQuery = `DELETE FROM ${LINKS_TABLE} WHERE "categoryId" = $1`;
      // console.log(`PostgresDataService: Deleting links for category ${id} with query: ${deleteLinksQuery.substring(0,150)}`);
      await client.query(deleteLinksQuery, [id]);
      const deleteCategoryQuery = `DELETE FROM ${CATEGORIES_TABLE} WHERE id = $1`;
      // console.log(`PostgresDataService: Deleting category ${id} with query: ${deleteCategoryQuery.substring(0,150)}`);
      const result = await client.query(deleteCategoryQuery, [id]);
      await client.query('COMMIT');
      // console.log(`PostgresDataService: Category ${id} and associated links deleted successfully. Rows affected for category deletion: ${result.rowCount}`);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error(`PostgresDataService Error: Error deleting category ${id} or its links from Postgres. Rolled back transaction.`, {
        errorMessage: error.message,
        errorCode: error.code,
        errorDetail: error.detail,
        errorHint: error.hint,
        errorStack: error.stack?.substring(0, 700)
      });
      throw error; 
    } finally {
      client.release();
      // console.log("PostgresDataService: Client released after deleteCategory transaction.");
    }
  }

  async getLinks(): Promise<LinkItem[]> {
    const query = `SELECT id, title, url, description, "categoryId", icon, "iconSource" FROM ${LINKS_TABLE}`;
    return this.executeQuery<LinkItem>(query);
  }

  async getLinksByCategoryId(categoryId: string): Promise<LinkItem[]> {
    const query = `SELECT id, title, url, description, "categoryId", icon, "iconSource" FROM ${LINKS_TABLE} WHERE "categoryId" = $1`;
    return this.executeQuery<LinkItem>(query, [categoryId]);
  }

  async getLink(id: string): Promise<LinkItem | undefined> {
    const query = `SELECT id, title, url, description, "categoryId", icon, "iconSource" FROM ${LINKS_TABLE} WHERE id = $1`;
    const links = await this.executeQuery<LinkItem>(query, [id]);
    return links[0];
  }

  async addLink(linkData: Omit<LinkItem, 'id'>): Promise<LinkItem> {
    const { title, url, description, categoryId, icon, iconSource } = linkData;
    const newId = crypto.randomUUID();
    const query = `INSERT INTO ${LINKS_TABLE} (id, title, url, description, "categoryId", icon, "iconSource") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, title, url, description, "categoryId", icon, "iconSource"`;
    const result = await this.executeQuery<LinkItem>(query, [newId, title, url, description || null, categoryId, icon || null, iconSource || 'none']);
    if (result.length === 0) {
        console.error("PostgresDataService Error: Failed to add link, no data returned from insert operation for query:", query.substring(0,150));
        throw new Error("PostgresDataService: Failed to add link, INSERT operation did not return the new record.");
    }
    return result[0];
  }

  async updateLink(updatedLink: LinkItem): Promise<LinkItem | null> {
    const { id, title, url, description, categoryId, icon, iconSource } = updatedLink;
    const query = `UPDATE ${LINKS_TABLE} SET title = $1, url = $2, description = $3, "categoryId" = $4, icon = $5, "iconSource" = $6 WHERE id = $7 RETURNING id, title, url, description, "categoryId", icon, "iconSource"`;
    const result = await this.executeQuery<LinkItem>(query, [title, url, description || null, categoryId, icon || null, iconSource || 'none', id]);
    return result[0] || null;
  }

  async deleteLink(id: string): Promise<boolean> {
    const query = `DELETE FROM ${LINKS_TABLE} WHERE id = $1`;
    if (!this.pool) {
        console.error("PostgresDataService Error: PostgreSQL pool not initialized. Cannot delete link.");
        throw new Error("PostgreSQL pool not initialized for deleteLink.");
    }
    let client: PoolClient | undefined;
    try {
        client = await this.pool.connect();
        const pgResult = await client.query(query, [id]);
        // console.log(`PostgresDataService: Link ${id} delete attempt. Rows affected: ${pgResult.rowCount}`);
        return pgResult.rowCount !== null && pgResult.rowCount > 0;
    } catch (error: any) {
        console.error(`PostgresDataService Error: Failed during link deletion for ID "${id}":`, {
           errorMessage: error.message,
           errorCode: error.code,
           errorDetail: error.detail,
           errorHint: error.hint,
           errorStack: error.stack?.substring(0, 700)
        });
        throw error;
    } finally {
        if (client) {
            client.release();
            // console.log("PostgresDataService: Client released after deleteLink operation.");
        }
    }
  }
}
