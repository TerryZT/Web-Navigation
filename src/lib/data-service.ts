
"use client";
import type { Category, LinkItem } from "@/types";
import type { IDataService } from './data-service-interface';
import { LocalDataService } from './local-data-service';
import { FirebaseDataService } from './firebase-data-service';
import { app as firebaseAppInstance } from './firebase-config'; // Use 'app' to check if Firebase initialized

let dataServiceInstance: IDataService;

const dataSourceType = process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE || 'local';

if (dataSourceType === 'firebase' && firebaseAppInstance) {
  try {
    dataServiceInstance = new FirebaseDataService();
    console.log("Using FirebaseDataService");
  } catch (error) {
    console.error("Failed to initialize FirebaseDataService, falling back to LocalDataService:", error);
    dataServiceInstance = new LocalDataService();
     console.log("Fell back to LocalDataService due to Firebase init error");
  }
} else {
  if (dataSourceType === 'firebase' && !firebaseAppInstance) {
    console.warn("Firebase is selected as data source, but not configured/initialized. Falling back to LocalDataService.");
  }
  dataServiceInstance = new LocalDataService();
  console.log("Using LocalDataService");
}

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
