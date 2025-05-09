
import type { Category, LinkItem } from "@/types";
import type { IDataService } from './data-service-interface';

// Conditional imports for server-side services.
const dataSourceType = process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE || 'local';

// Static import for ServerLocalDataService as it's simple and unlikely to cause bundling issues.
import { LocalDataService as ServerLocalDataService } from './local-data-service'; 

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
  console.log(`Server-side: Initializing data service. dataSourceType: "${dataSourceType}"`);
  console.log(`Server-side: NEXT_PUBLIC_DATA_SOURCE_TYPE: "${process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE}"`);
  
  const pgConnectionString = process.env.POSTGRES_CONNECTION_STRING;
  const pgHost = process.env.POSTGRES_HOST;
  console.log(`Server-side: POSTGRES_CONNECTION_STRING is set: ${!!pgConnectionString}`);
  if (pgConnectionString) {
    const safeCsSnippet = pgConnectionString.substring(0, pgConnectionString.indexOf('@') > 0 ? pgConnectionString.indexOf('@') : 30);
    console.log(`Server-side: POSTGRES_CONNECTION_STRING snippet: "${safeCsSnippet}..."`);
  } else {
    console.log(`Server-side: Individual PG vars - HOST: ${!!pgHost}, PORT: ${!!process.env.POSTGRES_PORT}, USER: ${!!process.env.POSTGRES_USER}, DB: ${!!process.env.POSTGRES_DB}, PASS_SET: ${!!process.env.POSTGRES_PASSWORD}`);
  }
  
  const mongoUri = process.env.MONGODB_URI;
  const mongoDbName = process.env.MONGODB_DB_NAME;
  console.log(`Server-side: MONGODB_URI is set: ${!!mongoUri}`);
  console.log(`Server-side: MONGODB_DB_NAME is set: ${!!mongoDbName}`);


  if (dataSourceType === 'postgres') {
    const hasFullPostgresConfig = 
      (pgHost && 
       process.env.POSTGRES_PORT && 
       process.env.POSTGRES_USER && 
       process.env.POSTGRES_PASSWORD && 
       process.env.POSTGRES_DB) || 
      pgConnectionString;

    if (!hasFullPostgresConfig) {
      const errorMessage = "Server-side Error: dataSourceType is 'postgres', but PostgreSQL environment variables (POSTGRES_HOST, etc.) or POSTGRES_CONNECTION_STRING are not fully set. Halting application startup for this data path.";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    try {
      console.log("Server-side: Attempting to dynamically import PostgresDataService...");
      const { PostgresDataService } = await import('./postgres-data-service');
      console.log("Server-side: PostgresDataService module imported.");
      if (typeof PostgresDataService !== 'function' || !PostgresDataService.prototype) {
         const errorMsg = `Server-side CRITICAL: Imported PostgresDataService is not a constructor. Type: ${typeof PostgresDataService}. This usually indicates a problem with the export from postgres-data-service.ts or a build/bundling issue.`;
         console.error(errorMsg);
        throw new Error(errorMsg);
      }
      console.log("Server-side: PostgresDataService appears valid. Instantiating PostgresDataService...");
      const serviceInstance = new PostgresDataService();
      console.log("Server-side: PostgresDataService instantiated successfully.");
      return serviceInstance;
    } catch (error: any) {
      console.error("Server-side CRITICAL: Failed to dynamically import or instantiate PostgresDataService. This is a fatal error for Postgres mode.", {
        errorMessage: error.message,
        errorStack: error.stack?.substring(0,1000) // Log more of the stack
      });
      throw error; 
    }
  } else if (dataSourceType === 'mongodb') {
    const hasFullMongoConfig = mongoUri && mongoDbName;
    if (!hasFullMongoConfig) {
      const errorMessage = "Server-side Error: dataSourceType is 'mongodb', but MongoDB environment variables (MONGODB_URI, MONGODB_DB_NAME) are not fully set. Halting application startup for this data path.";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    try {
      console.log("Server-side: Attempting to dynamically import MongoDataService...");
      const { MongoDataService } = await import('./mongo-data-service');
      console.log("Server-side: MongoDataService module imported.");
       if (typeof MongoDataService !== 'function' || !MongoDataService.prototype) {
         const errorMsg = `Server-side CRITICAL: Imported MongoDataService is not a constructor. Type: ${typeof MongoDataService}. This usually indicates a problem with the export from mongo-data-service.ts or a build/bundling issue.`;
         console.error(errorMsg);
        throw new Error(errorMsg);
      }
      console.log("Server-side: MongoDataService appears valid. Instantiating MongoDataService...");
      const serviceInstance = new MongoDataService();
      console.log("Server-side: MongoDataService instantiated successfully.");
      return serviceInstance;
    } catch (error: any) {
       console.error("Server-side CRITICAL: Failed to dynamically import or instantiate MongoDataService. This is a fatal error for MongoDB mode.", {
         errorMessage: error.message,
         errorStack: error.stack?.substring(0,1000)
       });
      throw error; 
    }
  } else { 
    // 'local' or undefined on server
    console.log("Server-side: Using ServerLocalDataService (for server-side operations in local mode).");
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

