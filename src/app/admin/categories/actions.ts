'use server';

import { revalidatePath } from 'next/cache';
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/lib/data-service';
import type { Category } from '@/types';

export async function getCategoriesAction(): Promise<Category[]> {
  return getCategories();
}

export async function addCategoryAction(values: Omit<Category, 'id'>): Promise<Category> {
  const newCategory = await addCategory(values);
  revalidatePath('/admin/categories');
  return newCategory;
}

export async function updateCategoryAction(values: Category): Promise<Category | null> {
  const updatedCategory = await updateCategory(values);
  revalidatePath('/admin/categories');
  return updatedCategory;
}

export async function deleteCategoryAction(id: string): Promise<boolean> {
  const success = await deleteCategory(id);
  revalidatePath('/admin/categories');
  return success;
}
