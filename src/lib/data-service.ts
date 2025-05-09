
import type { Category, LinkItem } from "@/types";
import type { IDataService } from './data-service-interface';

const dataSourceType = process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE || 'local';

// Import ServerLocalDataService statically as it's simple.
// This service is used if NEXT_PUBLIC_DATA_SOURCE_TYPE is 'local' when running on the server.
import { LocalDataService as ServerLocalDataService } from './local-data-service';

// Cache for server-side service instances.
// We want to reuse the same PostgresDataService or MongoDataService instance
// (and thus its pool/client) across multiple operations within the same serverless function invocation,
// and potentially across invocations if the Vercel environment allows.
// The healthCheck within these services should ensure connections are live.
let postgresServiceInstance: IDataService | null = null;
let mongoServiceInstance: IDataService | null = null;
let serverLocalServiceInstance: IDataService | null = null;

async function initializeServiceInstance(): Promise<IDataService> {
  if (typeof window !== 'undefined') {
    // CLIENT-SIDE LOGIC
    if (dataSourceType === 'local' || !dataSourceType) {
      // console.log("Client-side: Using ClientLocalDataService via getClientLocalDataService.");
      // Dynamically import client-local-data-service to avoid server-side bundling of client code.
      const { getClientLocalDataService } = await import('./client-local-data-service');
      return getClientLocalDataService();
    } else {
      const errorMessage = `Client-side direct data access for non-local data source type ('${dataSourceType}') is prohibited. Use Server Actions.`;
      console.error("CRITICAL_ERROR_TRACE: ClientDataServiceProhibited", { dataSourceType });
      throw new Error(errorMessage);
    }
  }

  // SERVER-SIDE LOGIC
  // console.log(`Server-side: initializeServiceInstance called. dataSourceType: "${dataSourceType}"`);

  if (dataSourceType === 'postgres') {
    const pgConnectionString = process.env.POSTGRES_CONNECTION_STRING;
    const pgHost = process.env.POSTGRES_HOST;
    const hasFullPostgresConfig =
      (pgHost && process.env.POSTGRES_PORT && process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD && process.env.POSTGRES_DB) || pgConnectionString;

    if (!hasFullPostgresConfig) {
      const errorMessage = "Server-side CRITICAL Error: dataSourceType is 'postgres', but PostgreSQL environment variables (POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB) or POSTGRES_CONNECTION_STRING are not fully set.";
      console.error("CRITICAL_ERROR_TRACE: PostgresConfigMissing", { hasConnectionString: !!pgConnectionString, hasHost: !!pgHost });
      throw new Error(errorMessage);
    }

    if (postgresServiceInstance) {
      // console.log("Server-side: Reusing existing PostgresDataService instance. Performing health check.");
      try {
        if (typeof postgresServiceInstance.healthCheck !== 'function') {
          console.warn("Server-side: Cached postgresServiceInstance does not have a healthCheck method. Re-creating.");
          postgresServiceInstance = null; // Force re-creation
        } else {
          await postgresServiceInstance.healthCheck();
          // console.log("Server-side: Existing PostgresDataService instance health check OK.");
          return postgresServiceInstance;
        }
      } catch (e: any) {
        console.warn("Server-side: Health check failed for existing PostgresDataService instance, will create a new one.", { message: e.message, stack: e.stack?.substring(0,300) });
        postgresServiceInstance = null; // Force re-creation
      }
    }
    // console.log("Server-side: Attempting to create a new PostgresDataService instance.");
    try {
      // console.log("Server-side: Dynamically importing PostgresDataService module...");
      const { PostgresDataService } = await import('./postgres-data-service');
      // console.log("Server-side: PostgresDataService module imported. Instantiating...");
      if (typeof PostgresDataService !== 'function' || !PostgresDataService.prototype) {
         const errorMsg = `Server-side CRITICAL: Imported PostgresDataService is not a constructor. Type: ${typeof PostgresDataService}.`;
         console.error("CRITICAL_ERROR_TRACE: PostgresNotConstructor", { type: typeof PostgresDataService });
        throw new Error(errorMsg);
      }
      const service = new PostgresDataService();
      // console.log("Server-side: PostgresDataService instantiated. Performing initial health check...");
      if (typeof service.healthCheck !== 'function') {
        throw new Error("Newly created PostgresDataService instance does not have a healthCheck method.");
      }
      await service.healthCheck();
      // console.log("Server-side: PostgresDataService initial health check successful. Caching instance.");
      postgresServiceInstance = service;
      return postgresServiceInstance;
    } catch (error: any) {
      console.error("Server-side CRITICAL: Failed to initialize or healthCheck PostgresDataService.", {
        errorMessage: error.message,
        errorStack: error.stack?.substring(0, 1000)
      });
      postgresServiceInstance = null;
      throw error;
    }
  } else if (dataSourceType === 'mongodb') {
    const mongoUri = process.env.MONGODB_URI;
    const mongoDbName = process.env.MONGODB_DB_NAME;
    const hasFullMongoConfig = mongoUri && mongoDbName;

    if (!hasFullMongoConfig) {
      const errorMessage = "Server-side CRITICAL Error: dataSourceType is 'mongodb', but MongoDB environment variables (MONGODB_URI, MONGODB_DB_NAME) are not fully set.";
      console.error("CRITICAL_ERROR_TRACE: MongoConfigMissing", { hasUri: !!mongoUri, hasDbName: !!mongoDbName });
      throw new Error(errorMessage);
    }
    
    if (mongoServiceInstance) {
      // console.log("Server-side: Reusing existing MongoDataService instance. Performing health check.");
      try {
        if (typeof mongoServiceInstance.healthCheck !== 'function') {
           console.warn("Server-side: Cached mongoServiceInstance does not have a healthCheck method. Re-creating.");
           mongoServiceInstance = null; // Force re-creation
        } else {
          await mongoServiceInstance.healthCheck();
          // console.log("Server-side: Existing MongoDataService instance health check OK.");
          return mongoServiceInstance;
        }
      } catch (e: any) {
        console.warn("Server-side: Health check failed for existing MongoDataService instance, will create a new one.", { message: e.message, stack: e.stack?.substring(0,300) });
        mongoServiceInstance = null;
      }
    }
    // console.log("Server-side: Attempting to create a new MongoDataService instance.");
    try {
      // console.log("Server-side: Dynamically importing MongoDataService module...");
      const { MongoDataService } = await import('./mongo-data-service');
      // console.log("Server-side: MongoDataService module imported. Instantiating...");
      if (typeof MongoDataService !== 'function' || !MongoDataService.prototype) {
        const errorMsg = `Server-side CRITICAL: Imported MongoDataService is not a constructor. Type: ${typeof MongoDataService}.`;
        console.error("CRITICAL_ERROR_TRACE: MongoNotConstructor", { type: typeof MongoDataService });
        throw new Error(errorMsg);
      }
      const service = new MongoDataService();
      // console.log("Server-side: MongoDataService instantiated. Performing initial health check...");
       if (typeof service.healthCheck !== 'function') {
        throw new Error("Newly created MongoDataService instance does not have a healthCheck method.");
      }
      await service.healthCheck();
      // console.log("Server-side: MongoDataService initial health check successful. Caching instance.");
      mongoServiceInstance = service;
      return mongoServiceInstance;
    } catch (error: any) {
      console.error("Server-side CRITICAL: Failed to initialize or healthCheck MongoDataService.", {
        errorMessage: error.message,
        errorStack: error.stack?.substring(0, 1000)
      });
      mongoServiceInstance = null;
      throw error;
    }
  } else { // 'local' or undefined on server
    // console.log("Server-side: Using ServerLocalDataService.");
    if (!serverLocalServiceInstance) {
      // console.log("Server-side: Creating new ServerLocalDataService instance.");
      serverLocalServiceInstance = new ServerLocalDataService();
      // LocalDataService healthCheck is a no-op, but if it needed one, it would be here.
      if (serverLocalServiceInstance.healthCheck) {
        await serverLocalServiceInstance.healthCheck();
      }
    }
    return serverLocalServiceInstance;
  }
}

// Wrapper to ensure that the service instance is initialized.
// This is the main entry point for data operations.
function getServiceInstance(): Promise<IDataService> {
  // initializeServiceInstance now handles client/server logic and caching internally.
  return initializeServiceInstance();
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
