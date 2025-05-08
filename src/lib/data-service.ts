
import type { Category, LinkItem } from "@/types";
import type { IDataService } from './data-service-interface';

// Conditional imports for server-side services. These will be dynamically imported.
let PostgresDataServiceModule: typeof import('./postgres-data-service');
let MongoDataServiceModule: typeof import('./mongo-data-service');
let LocalDataServiceModule: typeof import('./local-data-service'); // For server-side local

const dataSourceType = process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE || 'local';

async function getServiceInstance(): Promise<IDataService> {
  if (typeof window !== 'undefined') {
    // Client-side: ONLY LocalDataService should be directly instantiated here via getClientLocalDataService.
    // Other modes must use server actions.
    if (dataSourceType === 'local' || !dataSourceType) {
      const { getClientLocalDataService } = await import('./client-local-data-service');
      return getClientLocalDataService();
    } else {
      // This case should not be hit if pages correctly use server actions for non-local data sources.
      console.error(`Client-side attempt to getServiceInstance for non-local dataSourceType ('${dataSourceType}'). This is not supported. Use Server Actions.`);
      throw new Error(`Client-side direct data access for non-local data source type ('${dataSourceType}') is prohibited. Use Server Actions.`);
    }
  }

  // Server-side logic:
  // No caching of serverServiceInstance for now, to ensure env vars are read freshly.
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
      const errorMessage = "Server-side: dataSourceType is 'postgres', but PostgreSQL environment variables (POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB) or POSTGRES_CONNECTION_STRING are not fully set. Halting.";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    try {
      PostgresDataServiceModule = await import('./postgres-data-service');
      console.log("Server-side: Using PostgresDataService.");
      return new PostgresDataServiceModule.PostgresDataService();
    } catch (error) {
      console.error("Server-side: Failed to initialize PostgresDataService:", error);
      throw error; // Propagate error
    }
  } else if (dataSourceType === 'mongodb') {
    const hasFullMongoConfig = process.env.MONGODB_URI && process.env.MONGODB_DB_NAME;
    if (!hasFullMongoConfig) {
      const errorMessage = "Server-side: dataSourceType is 'mongodb', but MongoDB environment variables (MONGODB_URI, MONGODB_DB_NAME) are not fully set. Halting.";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    try {
      MongoDataServiceModule = await import('./mongo-data-service');
      console.log("Server-side: Using MongoDataService.");
      return new MongoDataServiceModule.MongoDataService();
    } catch (error) {
      console.error("Server-side: Failed to initialize MongoDataService:", error);
      throw error; // Propagate error
    }
  } else { // 'local' or if dataSourceType is explicitly 'local'
    console.log("Server-side: Using LocalDataService (for server-side operations in local mode).");
    LocalDataServiceModule = await import('./local-data-service');
    // This LocalDataService instance will use in-memory initial data on the server.
    return new LocalDataServiceModule.LocalDataService();
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

