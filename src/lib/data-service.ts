
import type { Category, LinkItem } from "@/types";
import type { IDataService } from './data-service-interface';

// Conditional imports for server-side services.
const dataSourceType = process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE || 'local';

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
      const errorMessage = "Server-side: dataSourceType is 'postgres', but PostgreSQL environment variables (POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB) or POSTGRES_CONNECTION_STRING are not fully set. Halting.";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    try {
      const PgModule = await import('./postgres-data-service');
      const PostgresDataServiceClass = PgModule.PostgresDataService; // Simplified
      if (!PostgresDataServiceClass || typeof PostgresDataServiceClass !== 'function') {
        console.error("Failed to resolve PostgresDataService class from module. Expected a named export 'PostgresDataService'. Module content:", PgModule);
        throw new Error("PostgresDataService class not found or is not a constructor in module.");
      }
      console.log("Server-side: Using PostgresDataService.");
      return new PostgresDataServiceClass();
    } catch (error) {
      console.error("Server-side: Failed to initialize PostgresDataService. This could be due to incorrect connection details, database accessibility (firewall, network), missing schema (tables 'categories', 'links'), or an issue with the 'pg' driver in the Vercel environment. Please verify your Vercel environment variables and database setup. Original error:", error);
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
      const MongoModule = await import('./mongo-data-service');
      const MongoDataServiceClass = MongoModule.MongoDataService; // Simplified
       if (!MongoDataServiceClass || typeof MongoDataServiceClass !== 'function') {
        console.error("Failed to resolve MongoDataService class from module. Expected a named export 'MongoDataService'. Module content:", MongoModule);
        throw new Error("MongoDataService class not found or is not a constructor in module.");
      }
      console.log("Server-side: Using MongoDataService.");
      return new MongoDataServiceClass();
    } catch (error) {
      console.error("Server-side: Failed to initialize MongoDataService. This could be due to incorrect connection details, database accessibility (firewall, network), or replica set configuration issues for transactions. Please verify your Vercel environment variables and database setup. Original error:", error);
      throw error; 
    }
  } else { 
    console.log("Server-side: Using LocalDataService (for server-side operations in local mode).");
    // This path should ideally only be taken if NEXT_PUBLIC_DATA_SOURCE_TYPE is explicitly 'local' or undefined for server operations.
    // For server-side 'local' mode, LocalDataService is designed to use in-memory defaults.
    const LocalDataServiceModule = await import('./local-data-service');
    const LocalDataServiceClass = LocalDataServiceModule.LocalDataService;
    
    if (!LocalDataServiceClass || typeof LocalDataServiceClass !== 'function') {
      console.error("Server-side: Failed to resolve LocalDataService class from module for 'local' mode. Module content:", LocalDataServiceModule);
      throw new Error("LocalDataService class not found or is not a constructor in module for server-side 'local' mode.");
    }
    return new LocalDataServiceClass();
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

