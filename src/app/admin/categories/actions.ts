'use server';

import { revalidatePath } from 'next/cache';
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/lib/data-service';
import type { Category } from '@/types';

export async function getCategoriesAction(): Promise<Category[]> {
  try {
    console.log("getCategoriesAction: Fetching categories...");
    const categories = await getCategories();
    console.log(`getCategoriesAction: Successfully fetched ${categories.length} categories.`);
    return categories;
  } catch (error: any) {
    console.error(`getCategoriesAction: Failed to fetch categories.`, {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500)
    });
    throw error; // Re-throw to ensure client is aware of failure
  }
}

export async function addCategoryAction(values: Omit<Category, 'id'>): Promise<Category> {
  try {
    console.log(`addCategoryAction: Attempting to add category: ${JSON.stringify(values).substring(0,100)}`);
    const newCategory = await addCategory(values);
    console.log(`addCategoryAction: Successfully added category, ID: ${newCategory.id}`);
    revalidatePath('/admin/categories');
    revalidatePath('/'); // Also revalidate public page
    return newCategory;
  } catch (error: any) {
    console.error(`addCategoryAction: Failed to add category. Values: ${JSON.stringify(values).substring(0,100)}`, {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500)
    });
    throw error;
  }
}

export async function updateCategoryAction(values: Category): Promise<Category | null> {
  try {
    console.log(`updateCategoryAction: Attempting to update category ID ${values.id}: ${JSON.stringify(values).substring(0,100)}`);
    const updatedCategory = await updateCategory(values);
    if (updatedCategory) {
      console.log(`updateCategoryAction: Successfully updated category ID: ${updatedCategory.id}`);
    } else {
      console.warn(`updateCategoryAction: Category ID ${values.id} not found for update.`);
    }
    revalidatePath('/admin/categories');
    revalidatePath('/');
    return updatedCategory;
  } catch (error: any) {
    console.error(`updateCategoryAction: Failed to update category ID ${values.id}. Values: ${JSON.stringify(values).substring(0,100)}`, {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500)
    });
    throw error;
  }
}

export async function deleteCategoryAction(id: string): Promise<boolean> {
  try {
    console.log(`deleteCategoryAction: Attempting to delete category ID: ${id}`);
    const success = await deleteCategory(id);
    console.log(`deleteCategoryAction: Deletion attempt for category ID ${id} result: ${success}`);
    revalidatePath('/admin/categories');
    revalidatePath('/');
    return success;
  } catch (error: any) {
    console.error(`deleteCategoryAction: Failed to delete category ID: ${id}`, {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500)
    });
    throw error;
  }
}

