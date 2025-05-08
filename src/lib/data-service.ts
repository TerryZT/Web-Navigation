import type { Category, LinkItem } from "@/types";
import type { IDataService } from './data-service-interface';
import { LocalDataService } from './local-data-service';
// Conditional imports for server-side services
let PostgresDataServiceModule: typeof import('./postgres-data-service');
let MongoDataServiceModule: typeof import('./mongo-data-service');

const dataSourceType = process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE || 'local';
const isBrowser = typeof window !== 'undefined';

let dataServiceInstance: IDataService;

async function initializeDataService(): Promise<IDataService> {
  if (dataSourceType === 'postgres') {
    if (!isBrowser) {
      try {
        PostgresDataServiceModule = await import('./postgres-data-service');
        if (
          (process.env.POSTGRES_HOST && process.env.POSTGRES_PORT && process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD && process.env.POSTGRES_DB) ||
          process.env.POSTGRES_CONNECTION_STRING
        ) {
          console.log("Attempting to use PostgresDataService (server-side).");
          return new PostgresDataServiceModule.PostgresDataService();
        } else {
          console.warn("PostgreSQL environment variables not fully set (server-side), but Postgres was selected as data source. Falling back to LocalDataService for this context.");
          return new LocalDataService();
        }
      } catch (error) {
        console.error("Failed to initialize PostgresDataService (server-side), falling back to LocalDataService:", error);
        return new LocalDataService();
      }
    } else {
      console.warn("PostgresDataService cannot be used on the client. Client-side operations will use LocalDataService. For production with Postgres, ensure data is fetched via Server Actions or API routes.");
      return new LocalDataService();
    }
  } else if (dataSourceType === 'mongodb') {
    if (!isBrowser) {
      try {
        MongoDataServiceModule = await import('./mongo-data-service');
        if (process.env.MONGODB_URI && process.env.MONGODB_DB_NAME) {
          console.log("Attempting to use MongoDataService (server-side).");
          return new MongoDataServiceModule.MongoDataService();
        } else {
          console.warn("MongoDB environment variables are not fully set (server-side), but MongoDB was selected as data source. Falling back to LocalDataService for this context.");
          return new LocalDataService();
        }
      } catch (error) {
        console.error("Failed to initialize MongoDataService (server-side), falling back to LocalDataService:", error);
        return new LocalDataService();
      }
    } else {
      console.warn("MongoDataService cannot be used on the client. Client-side operations will use LocalDataService. For production with MongoDB, ensure data is fetched via Server Actions or API routes.");
      return new LocalDataService();
    }
  } else { // 'local' or undefined
    console.log("Using LocalDataService (client or server).");
    return new LocalDataService();
  }
}

dataServiceInstance = await initializeDataService();

// Categories CRUD
export const getCategories = (): Promise<Category[]> => dataServiceInstance.getCategories();
export const getCategory = (id: string): Promise<Category | undefined> => dataServiceInstance.getCategory(id);
export const addCategory = (category: Omit<Category, "id">): Promise<Category> => dataServiceInstance.addCategory(category);
export const updateCategory = (updatedCategory: Category): Promise<Category | null> => dataServiceInstance.updateCategory(updatedCategory);
export const deleteCategory = (id: string): Promise<boolean> => dataServiceInstance.deleteCategory(id);

// Links CRUD
export const getLinks = (): Promise<LinkItem[]> => dataServiceInstance.getLinks();
export const getLinksByCategoryId = (categoryId: string): Promise<LinkItem[]> => dataServiceInstance.getLinksByCategoryId(categoryId);
export const getLink = (id: string): Promise<LinkItem | undefined> => dataServiceInstance.getLink(id);
export const addLink = (link: Omit<LinkItem, "id">): Promise<LinkItem> => dataServiceInstance.addLink(link);
export const updateLink = (updatedLink: LinkItem): Promise<LinkItem | null> => dataServiceInstance.updateLink(updatedLink);
export const deleteLink = (id: string): Promise<boolean> => dataServiceInstance.deleteLink(id);
