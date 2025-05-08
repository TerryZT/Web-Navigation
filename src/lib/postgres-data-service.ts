
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
    console.log("PostgresDataService: Constructor called.");
    try {
      const connectionString = process.env.POSTGRES_CONNECTION_STRING;
      if (connectionString) {
        this.pool = new Pool({ connectionString });
        console.log("PostgresDataService: Pool configured using POSTGRES_CONNECTION_STRING.");
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
        console.log("PostgresDataService: Pool configured using individual POSTGRES_ variables.");
      } else {
        console.error("PostgresDataService Error: PostgreSQL connection details not found in environment variables.");
        throw new Error("PostgreSQL connection details not found in environment variables. Set POSTGRES_CONNECTION_STRING or individual POSTGRES_ variables.");
      }
      
      console.log("PostgresDataService: Pool object created. Attempting initial test query...");
      this.pool.query('SELECT NOW()')
        .then((result) => console.log("PostgresDataService: Initial test query successful. Current DB time:", result.rows[0].now))
        .catch(err => {
          console.error("PostgresDataService CRITICAL: Initial test query FAILED. This indicates a problem connecting to or querying the database. Check connection string, credentials, network access (firewalls), and database status.", err);
          // Depending on the error, the pool might still be created but subsequent queries will likely fail.
          // For persistent errors here, the application won't function correctly with Postgres.
        });

    } catch (error) {
      console.error("PostgresDataService CRITICAL: Failed to initialize PostgreSQL pool during constructor. This might be due to invalid configuration format or missing 'pg' module.", error);
      this.pool = null; 
      throw error; 
    }
  }

  private async executeQuery<T>(queryText: string, values?: any[]): Promise<T[]> {
    console.log(`PostgresDataService: Attempting to execute query: ${queryText.substring(0,150)}... Values: ${values ? JSON.stringify(values) : 'None'}`);
    if (!this.pool) {
      console.error("PostgresDataService Error: PostgreSQL pool is not initialized. Cannot execute query. This often means the constructor failed, possibly due to invalid connection string, missing environment variables, or database inaccessibility.");
      throw new Error("PostgreSQL pool not initialized. Database connection failed during setup.");
    }
    
    let client: PoolClient | undefined;
    try {
      console.log("PostgresDataService: Acquiring client from pool...");
      client = await this.pool.connect();
      console.log("PostgresDataService: Client acquired. Executing query.");
      const result = await client.query(queryText, values);
      console.log(`PostgresDataService: Query executed successfully. Rows affected/returned: ${result.rowCount}`);
      return result.rows as T[];
    } catch (error) {
      console.error(`PostgresDataService Error: Failed during query execution for "${queryText.substring(0,150)}...":`, error);
      if (error && typeof error === 'object' && 'code' in error) {
        console.error(`PostgresDataService Error Details: PG Code: ${(error as any).code}, Message: ${(error as Error).message}`);
      }
      throw error; // Re-throw the error to be handled by the caller (Server Action)
    } finally {
      if (client) {
        client.release();
        console.log("PostgresDataService: Client released back to pool.");
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
        console.error("PostgresDataService Error: Failed to add category, no data returned from insert operation for query:", query);
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
      console.log(`PostgresDataService: Starting transaction to delete category ${id} and its links.`);
      await client.query('BEGIN');
      const deleteLinksQuery = `DELETE FROM ${LINKS_TABLE} WHERE "categoryId" = $1`;
      console.log(`PostgresDataService: Deleting links for category ${id} with query: ${deleteLinksQuery}`);
      await client.query(deleteLinksQuery, [id]);
      const deleteCategoryQuery = `DELETE FROM ${CATEGORIES_TABLE} WHERE id = $1`;
      console.log(`PostgresDataService: Deleting category ${id} with query: ${deleteCategoryQuery}`);
      const result = await client.query(deleteCategoryQuery, [id]);
      await client.query('COMMIT');
      console.log(`PostgresDataService: Category ${id} and associated links deleted successfully. Rows affected for category deletion: ${result.rowCount}`);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`PostgresDataService Error: Error deleting category ${id} or its links from Postgres. Rolled back transaction.`, error);
      if (error && typeof error === 'object' && 'code' in error) {
        console.error(`PostgresDataService Error Details: PG Code: ${(error as any).code}, Message: ${(error as Error).message}`);
      }
      throw error; 
    } finally {
      client.release();
      console.log("PostgresDataService: Client released after deleteCategory operation.");
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
        console.error("PostgresDataService Error: Failed to add link, no data returned from insert operation for query:", query);
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
    // Directly use executeQuery which handles pool and client
    const result = await this.executeQuery<{rowCount?: number}>(query, [id]);
    // Note: DELETE RETURNING * would give back rows, but without it, check rowCount from the result object passed by pg driver.
    // The `executeQuery` returns `result.rows`. For DELETE, `rows` is empty. We need to adapt.
    // This is a bit tricky as `executeQuery` is generic. We'll assume if no error, it worked if `rowCount` was expected.
    // Better: Modify executeQuery to return the raw result object or specifically handle DML.
    // For now, if it doesn't throw, and if pg driver sets a rowCount on the result object (which it does, but not on result.rows)
    // This will need adjustment. A simple way is to have `executeQuery` return `result` itself not `result.rows`.
    // Let's make a small adjustment for this typical case or rely on error throwing.
    // A more robust check would be to modify executeQuery or have a specific executeDML.
    // Given current executeQuery, we can't reliably get rowCount. We'll assume success if no error.
    // Let's assume an error will be thrown if the deletion fails for reasons like FK constraints (though not on this table directly).
    // The original implementation was:
    // const result = await client.query(query, [id]); return result.rowCount !== null && result.rowCount > 0;
    // We need to replicate that. This means `executeQuery` needs to return more info.
    // For now, let's return true if it doesn't throw, which is a simplification.
    // To be correct, `executeQuery` should probably return `QueryResult<any>` from `pg`.

    // Re-simplifying to match previous direct client usage for rowCount:
    if (!this.pool) {
        console.error("PostgresDataService Error: PostgreSQL pool not initialized. Cannot delete link.");
        throw new Error("PostgreSQL pool not initialized for deleteLink.");
    }
    let client: PoolClient | undefined;
    try {
        client = await this.pool.connect();
        const pgResult = await client.query(query, [id]);
        console.log(`PostgresDataService: Link ${id} delete attempt. Rows affected: ${pgResult.rowCount}`);
        return pgResult.rowCount !== null && pgResult.rowCount > 0;
    } catch (error) {
        console.error(`PostgresDataService Error: Failed during link deletion for ID "${id}":`, error);
        if (error && typeof error === 'object' && 'code' in error) {
           console.error(`PostgresDataService Error Details: PG Code: ${(error as any).code}, Message: ${(error as Error).message}`);
        }
        throw error;
    } finally {
        if (client) {
            client.release();
            console.log("PostgresDataService: Client released after deleteLink operation.");
        }
    }
  }
}
