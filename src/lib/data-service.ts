
import type { Category, LinkItem } from "@/types";
import type { IDataService } from './data-service-interface';

// Conditional imports for server-side services.
const dataSourceType = process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE || 'local';

// Static imports for server-side services
import { LocalDataService as ServerLocalDataService } from './local-data-service'; // For server-side 'local' mode
import { PostgresDataService } from './postgres-data-service';
import { MongoDataService } from './mongo-data-service';

async function getServiceInstance(): Promise<IDataService> {
  if (typeof window !== 'undefined') {
    // Client-side:
    if (dataSourceType === 'local' || !dataSourceType) {
      // console.log("Client-side: Using ClientLocalDataService");
      const { getClientLocalDataService } = await import('./client-local-data-service');
      return getClientLocalDataService();
    } else {
      const errorMessage = `Client-side direct data access for non-local data source type ('${dataSourceType}') is prohibited. Use Server Actions.`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Server-side logic:
  console.log(`Server-side: Initializing data service for type: ${dataSourceType}`);

  if (dataSourceType === 'postgres') {
    const hasFullPostgresConfig = 
      (process.env.POSTGRES_HOST && 
       process.env.POSTGRES_PORT && 
       process.env.POSTGRES_USER && 
       process.env.POSTGRES_PASSWORD && 
       process.env.POSTGRES_DB) || 
      process.env.POSTGRES_CONNECTION_STRING;

    if (!hasFullPostgresConfig) {
      const errorMessage = "Server-side Error: dataSourceType is 'postgres', but PostgreSQL environment variables (POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB) or POSTGRES_CONNECTION_STRING are not fully set. Halting.";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    try {
      console.log("Server-side: Instantiating PostgresDataService (statically imported).");
      const serviceInstance = new PostgresDataService();
      console.log("Server-side: PostgresDataService instantiated successfully.");
      return serviceInstance;
    } catch (error) {
      console.error("Server-side CRITICAL: Failed to initialize or instantiate PostgresDataService. This could be due to issues with the class definition, constructor errors (e.g., connection issues, missing 'pg' driver), or other runtime problems. Please verify your Vercel environment variables, database setup, and check server logs for details from PostgresDataService constructor. Original error:", error);
      throw error; 
    }
  } else if (dataSourceType === 'mongodb') {
    const hasFullMongoConfig = process.env.MONGODB_URI && process.env.MONGODB_DB_NAME;
    if (!hasFullMongoConfig) {
      const errorMessage = "Server-side: dataSourceType is 'mongodb', but MongoDB environment variables (MONGODB_URI, MONGODB_DB_NAME) are not fully set. Halting.";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    try {
      console.log("Server-side: Instantiating MongoDataService (statically imported).");
      const serviceInstance = new MongoDataService();
      console.log("Server-side: MongoDataService instantiated successfully.");
      return serviceInstance;
    } catch (error) {
       console.error("Server-side CRITICAL: Failed to initialize or instantiate MongoDataService. Original error:", error);
      throw error; 
    }
  } else { 
    console.log("Server-side: Using ServerLocalDataService (for server-side operations in local mode).");
    // Uses the statically imported and aliased ServerLocalDataService
    return new ServerLocalDataService();
  }
}

// Categories CRUD
export const getCategories = async (): Promise<Category[]> => {
  const service = await getServiceInstance();
  return service.getCategories();
};
export const getCategory = async (id: string): Promise<Category | undefined> => {
  const service = await getServiceInstance();
  return service.getCategory(id);
};
export const addCategory = async (category: Omit<Category, "id">): Promise<Category> => {
  const service = await getServiceInstance();
  return service.addCategory(category);
};
export const updateCategory = async (updatedCategory: Category): Promise<Category | null> => {
  const service = await getServiceInstance();
  return service.updateCategory(updatedCategory);
};
export const deleteCategory = async (id: string): Promise<boolean> => {
  const service = await getServiceInstance();
  return service.deleteCategory(id);
};

// Links CRUD
export const getLinks = async (): Promise<LinkItem[]> => {
  const service = await getServiceInstance();
  return service.getLinks();
};
export const getLinksByCategoryId = async (categoryId: string): Promise<LinkItem[]> => {
  const service = await getServiceInstance();
  return service.getLinksByCategoryId(categoryId);
};
export const getLink = async (id: string): Promise<LinkItem | undefined> => {
  const service = await getServiceInstance();
  return service.getLink(id);
};
export const addLink = async (link: Omit<LinkItem, "id">): Promise<LinkItem> => {
  const service = await getServiceInstance();
  return service.addLink(link);
};
export const updateLink = async (updatedLink: LinkItem): Promise<LinkItem | null> => {
  const service = await getServiceInstance();
  return service.updateLink(updatedLink);
};
export const deleteLink = async (id: string): Promise<boolean> => {
  const service = await getServiceInstance();
  return service.deleteLink(id);
};

// Core functions for server actions (previously suffixed with Core)
// These are now the same as the public exports, but kept for potential internal distinction if needed later.
export { 
    getCategories as getCategoriesCore, 
    getLinksByCategoryId as getLinksByCategoryIdCore 
};
