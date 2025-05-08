
import type { Category, LinkItem } from '@/types';
import type { IDataService } from './data-service-interface';
import { Pool, type PoolClient } from 'pg';

// Database table names
const CATEGORIES_TABLE = 'categories';
const LINKS_TABLE = 'links';

export class PostgresDataService implements IDataService {
  private pool: Pool | null = null;

  constructor() {
    try {
      const connectionString = process.env.POSTGRES_CONNECTION_STRING;
      if (connectionString) {
        this.pool = new Pool({ connectionString });
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
      } else {
        throw new Error("PostgreSQL connection details not found in environment variables.");
      }
      console.log("PostgresDataService initialized and pool configured.");
      this.testConnection();
    } catch (error) {
      console.error("Failed to initialize PostgreSQL pool:", error);
      this.pool = null; // Ensure pool is null if initialization fails
      throw error; // Re-throw to be caught by the main data-service logic
    }
  }

  private async testConnection() {
    if (!this.pool) return;
    let client: PoolClient | undefined;
    try {
      client = await this.pool.connect();
      console.log("Successfully connected to PostgreSQL.");
    } catch (error) {
      console.error("Failed to connect to PostgreSQL:", error);
    } finally {
      client?.release();
    }
  }

  private async executeQuery<T>(queryText: string, values?: any[]): Promise<T[]> {
    if (!this.pool) {
      console.error("PostgreSQL pool not initialized. Cannot execute query.");
      // Fallback or throw error, for now returning empty array for stubs
      return [];
    }
    let client: PoolClient | undefined;
    try {
      client = await this.pool.connect();
      const result = await client.query(queryText, values);
      return result.rows as T[];
    } catch (error) {
      console.error(`Error executing query "${queryText.substring(0,100)}...":`, error);
      return []; // Or throw error
    } finally {
      client?.release();
    }
  }


  async getCategories(): Promise<Category[]> {
    console.warn("PostgresDataService.getCategories() called. Ensure your 'categories' table (id, name, description, icon) is set up.");
    // Actual implementation:
    // const query = `SELECT id, name, description, icon FROM ${CATEGORIES_TABLE}`;
    // return this.executeQuery<Category>(query);
    return Promise.resolve([]); // Placeholder
  }

  async getCategory(id: string): Promise<Category | undefined> {
    console.warn(`PostgresDataService.getCategory(${id}) called. Ensure your 'categories' table is set up.`);
    // const query = `SELECT id, name, description, icon FROM ${CATEGORIES_TABLE} WHERE id = $1`;
    // const categories = await this.executeQuery<Category>(query, [id]);
    // return categories[0];
    return Promise.resolve(undefined); // Placeholder
  }

  async addCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    console.warn("PostgresDataService.addCategory() called. Ensure your 'categories' table is set up.");
    // const { name, description, icon } = categoryData;
    // const query = `INSERT INTO ${CATEGORIES_TABLE} (name, description, icon) VALUES ($1, $2, $3) RETURNING id, name, description, icon`;
    // const result = await this.executeQuery<Category>(query, [name, description || null, icon || null]);
    // return result[0];
    // Placeholder for now, as this requires a real DB insert to get an ID.
    const newCategory: Category = { id: Date.now().toString(), ...categoryData };
    return Promise.resolve(newCategory);
  }

  async updateCategory(updatedCategory: Category): Promise<Category | null> {
    console.warn(`PostgresDataService.updateCategory(${updatedCategory.id}) called. Ensure your 'categories' table is set up.`);
    // const { id, name, description, icon } = updatedCategory;
    // const query = `UPDATE ${CATEGORIES_TABLE} SET name = $1, description = $2, icon = $3 WHERE id = $4 RETURNING id, name, description, icon`;
    // const result = await this.executeQuery<Category>(query, [name, description || null, icon || null, id]);
    // return result[0] || null;
    return Promise.resolve(updatedCategory); // Placeholder
  }

  async deleteCategory(id: string): Promise<boolean> {
    console.warn(`PostgresDataService.deleteCategory(${id}) called. Ensure cascading deletes or manual deletion of associated links.`);
    // if (!this.pool) return false;
    // const client = await this.pool.connect();
    // try {
    //   await client.query('BEGIN');
    //   // Delete associated links first
    //   await client.query(`DELETE FROM ${LINKS_TABLE} WHERE "categoryId" = $1`, [id]);
    //   // Delete the category
    //   const result = await client.query(`DELETE FROM ${CATEGORIES_TABLE} WHERE id = $1`, [id]);
    //   await client.query('COMMIT');
    //   return result.rowCount > 0;
    // } catch (error) {
    //   await client.query('ROLLBACK');
    //   console.error('Error deleting category or its links from Postgres:', error);
    //   return false;
    // } finally {
    //   client.release();
    // }
    return Promise.resolve(true); // Placeholder
  }

  async getLinks(): Promise<LinkItem[]> {
    console.warn("PostgresDataService.getLinks() called. Ensure your 'links' table (id, title, url, description, \"categoryId\", icon) is set up.");
    // const query = `SELECT id, title, url, description, "categoryId", icon FROM ${LINKS_TABLE}`;
    // return this.executeQuery<LinkItem>(query);
    return Promise.resolve([]); // Placeholder
  }

  async getLinksByCategoryId(categoryId: string): Promise<LinkItem[]> {
    console.warn(`PostgresDataService.getLinksByCategoryId(${categoryId}) called. Ensure your 'links' table is set up.`);
    // const query = `SELECT id, title, url, description, "categoryId", icon FROM ${LINKS_TABLE} WHERE "categoryId" = $1`;
    // return this.executeQuery<LinkItem>(query, [categoryId]);
    return Promise.resolve([]); // Placeholder
  }

  async getLink(id: string): Promise<LinkItem | undefined> {
    console.warn(`PostgresDataService.getLink(${id}) called. Ensure your 'links' table is set up.`);
    // const query = `SELECT id, title, url, description, "categoryId", icon FROM ${LINKS_TABLE} WHERE id = $1`;
    // const links = await this.executeQuery<LinkItem>(query, [id]);
    // return links[0];
    return Promise.resolve(undefined); // Placeholder
  }

  async addLink(linkData: Omit<LinkItem, 'id'>): Promise<LinkItem> {
    console.warn("PostgresDataService.addLink() called. Ensure your 'links' table is set up.");
    // const { title, url, description, categoryId, icon } = linkData;
    // const query = `INSERT INTO ${LINKS_TABLE} (title, url, description, "categoryId", icon) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, url, description, "categoryId", icon`;
    // const result = await this.executeQuery<LinkItem>(query, [title, url, description || null, categoryId, icon || null]);
    // return result[0];
    const newLink: LinkItem = { id: Date.now().toString(), ...linkData };
    return Promise.resolve(newLink);
  }

  async updateLink(updatedLink: LinkItem): Promise<LinkItem | null> {
    console.warn(`PostgresDataService.updateLink(${updatedLink.id}) called. Ensure your 'links' table is set up.`);
    // const { id, title, url, description, categoryId, icon } = updatedLink;
    // const query = `UPDATE ${LINKS_TABLE} SET title = $1, url = $2, description = $3, "categoryId" = $4, icon = $5 WHERE id = $6 RETURNING id, title, url, description, "categoryId", icon`;
    // const result = await this.executeQuery<LinkItem>(query, [title, url, description || null, categoryId, icon || null, id]);
    // return result[0] || null;
    return Promise.resolve(updatedLink); // Placeholder
  }

  async deleteLink(id: string): Promise<boolean> {
    console.warn(`PostgresDataService.deleteLink(${id}) called. Ensure your 'links' table is set up.`);
    // const query = `DELETE FROM ${LINKS_TABLE} WHERE id = $1`;
    // const result = await this.executeQuery<{rowCount: number}>(query, [id]); // This is a simplified check
    // return result.length > 0 && result[0].rowCount > 0; // Adjust based on actual query result structure for delete
    return Promise.resolve(true); // Placeholder
  }
}
