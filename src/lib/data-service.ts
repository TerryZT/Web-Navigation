
import type { Category, LinkItem } from "@/types";
import type { IDataService } from './data-service-interface';
import { LocalDataService } from './local-data-service';
import { PostgresDataService } from './postgres-data-service';
import { MongoDataService } from './mongo-data-service';

let dataServiceInstance: IDataService;

const dataSourceType = process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE || 'local';

function initializeDataService(): IDataService {
  if (dataSourceType === 'postgres') {
    try {
      // Check for necessary PostgreSQL environment variables
      if (
        (process.env.POSTGRES_HOST && process.env.POSTGRES_PORT && process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD && process.env.POSTGRES_DB) ||
        process.env.POSTGRES_CONNECTION_STRING
      ) {
        console.log("Attempting to use PostgresDataService");
        return new PostgresDataService();
      } else {
        console.warn("PostgreSQL environment variables are not fully set. Falling back to LocalDataService.");
        return new LocalDataService();
      }
    } catch (error) {
      console.error("Failed to initialize PostgresDataService, falling back to LocalDataService:", error);
      return new LocalDataService();
    }
  } else if (dataSourceType === 'mongodb') {
    try {
      // Check for necessary MongoDB environment variables
      if (process.env.MONGODB_URI && process.env.MONGODB_DB_NAME) {
        console.log("Attempting to use MongoDataService");
        return new MongoDataService();
      } else {
        console.warn("MongoDB environment variables are not fully set. Falling back to LocalDataService.");
        return new LocalDataService();
      }
    } catch (error) {
      console.error("Failed to initialize MongoDataService, falling back to LocalDataService:", error);
      return new LocalDataService();
    }
  } else {
    console.log("Using LocalDataService");
    return new LocalDataService();
  }
}

dataServiceInstance = initializeDataService();

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
