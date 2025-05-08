
import type { Category, LinkItem } from "@/types";
import type { IDataService } from './data-service-interface';

// Conditional imports for server-side services. These will be dynamically imported.
let PostgresDataServiceModule: typeof import('./postgres-data-service');
let MongoDataServiceModule: typeof import('./mongo-data-service');
let LocalDataServiceModule: typeof import('./local-data-service'); // For server-side local

const dataSourceType = process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE || 'local';

// Cache for server-side service instances to avoid re-initializing on every call within the same request lifecycle (if applicable)
// Note: In a serverless environment, each invocation might be independent anyway.
let serverServiceInstance: IDataService | null = null; 

async function getServiceInstance(): Promise<IDataService> {
  if (typeof window !== 'undefined') {
    // This path is for client-side direct calls.
    // Admin pages and public page use server actions when not in 'local' mode,
    // so they won't hit this for Postgres/Mongo.
    // If 'local' mode, client-local-data-service is used by components directly.
    console.warn("getServiceInstance called directly on client. This should ideally be for 'local' mode via getClientLocalDataService or through server actions.");
    const { getClientLocalDataService } = await import('./client-local-data-service');
    return getClientLocalDataService();
  }

  // Server-side logic
  if (serverServiceInstance && 
      ((dataSourceType === 'postgres' && serverServiceInstance instanceof PostgresDataServiceModule?.PostgresDataService) ||
       (dataSourceType === 'mongodb' && serverServiceInstance instanceof MongoDataServiceModule?.MongoDataService) ||
       (dataSourceType === 'local' && serverServiceInstance instanceof LocalDataServiceModule?.LocalDataService))
     ) {
    // Basic check to see if cached instance matches current dataSourceType.
    // More robust caching might be needed if dataSourceType could change during server lifetime (not typical).
    return serverServiceInstance;
  }
  
  console.log(`Server-side: Initializing data service for type: ${dataSourceType}`);

  if (dataSourceType === 'postgres') {
    try {
      PostgresDataServiceModule = await import('./postgres-data-service');
      if (
        (process.env.POSTGRES_HOST && process.env.POSTGRES_PORT && process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD && process.env.POSTGRES_DB) ||
        process.env.POSTGRES_CONNECTION_STRING
      ) {
        console.log("Server-side: Using PostgresDataService.");
        serverServiceInstance = new PostgresDataServiceModule.PostgresDataService();
      } else {
        console.warn("Server-side: PostgreSQL environment variables not fully set. Falling back to LocalDataService for server operations.");
        LocalDataServiceModule = await import('./local-data-service');
        serverServiceInstance = new LocalDataServiceModule.LocalDataService();
      }
    } catch (error) {
      console.error("Server-side: Failed to initialize PostgresDataService, falling back to LocalDataService:", error);
      LocalDataServiceModule = await import('./local-data-service');
      serverServiceInstance = new LocalDataServiceModule.LocalDataService();
    }
  } else if (dataSourceType === 'mongodb') {
    try {
      MongoDataServiceModule = await import('./mongo-data-service');
      if (process.env.MONGODB_URI && process.env.MONGODB_DB_NAME) {
        console.log("Server-side: Using MongoDataService.");
        serverServiceInstance = new MongoDataServiceModule.MongoDataService();
      } else {
        console.warn("Server-side: MongoDB environment variables not fully set. Falling back to LocalDataService for server operations.");
        LocalDataServiceModule = await import('./local-data-service');
        serverServiceInstance = new LocalDataServiceModule.LocalDataService();
      }
    } catch (error) {
      console.error("Server-side: Failed to initialize MongoDataService, falling back to LocalDataService:", error);
      LocalDataServiceModule = await import('./local-data-service');
      serverServiceInstance = new LocalDataServiceModule.LocalDataService();
    }
  } else { // 'local' or undefined
    console.log("Server-side: Using LocalDataService.");
    LocalDataServiceModule = await import('./local-data-service');
    serverServiceInstance = new LocalDataServiceModule.LocalDataService();
  }
  return serverServiceInstance;
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
