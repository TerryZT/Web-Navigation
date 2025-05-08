
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
      this.pool = null; 
      throw error; 
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
      throw new Error("PostgreSQL pool not initialized.");
    }
    let client: PoolClient | undefined;
    try {
      client = await this.pool.connect();
      const result = await client.query(queryText, values);
      return result.rows as T[];
    } catch (error) {
      console.error(`Error executing query "${queryText.substring(0,100)}...":`, error);
      throw error; 
    } finally {
      client?.release();
    }
  }


  async getCategories(): Promise<Category[]> {
    // Assumes table 'categories' with columns: id (TEXT), name (TEXT), description (TEXT), icon (TEXT)
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
        throw new Error("Failed to add category, no data returned.");
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
      console.error("PostgreSQL pool not initialized. Cannot delete category.");
      return false;
    }
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Assuming links table has a "categoryId" column referencing categories.id
      // Use "categoryId" to match the LinkItem type property. Adjust if your DB column name is different (e.g., category_id)
      await client.query(`DELETE FROM ${LINKS_TABLE} WHERE "categoryId" = $1`, [id]);
      const result = await client.query(`DELETE FROM ${CATEGORIES_TABLE} WHERE id = $1`, [id]);
      await client.query('COMMIT');
      return result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting category or its links from Postgres:', error);
      return false;
    } finally {
      client.release();
    }
  }

  async getLinks(): Promise<LinkItem[]> {
    // Assumes table 'links' with columns: id (TEXT), title (TEXT), url (TEXT), description (TEXT), 
    // "categoryId" (TEXT), icon (TEXT), "iconSource" (TEXT)
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
        throw new Error("Failed to add link, no data returned.");
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
    // executeQuery returns rows, for DELETE, rowCount is on the result object itself, not in rows.
    // Modify executeQuery or handle differently for rowCount actions.
    // For simplicity, we'll connect and query directly here to get rowCount.
    if (!this.pool) {
        console.error("PostgreSQL pool not initialized. Cannot delete link.");
        return false;
    }
    let client: PoolClient | undefined;
    try {
        client = await this.pool.connect();
        const result = await client.query(query, [id]);
        return result.rowCount > 0;
    } catch (error) {
        console.error(`Error executing query "DELETE FROM ${LINKS_TABLE} WHERE id = $1":`, error);
        return false;
    } finally {
        client?.release();
    }
  }
}
