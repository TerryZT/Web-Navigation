'use server';

import { revalidatePath } from 'next/cache';
import { dataServiceInstance } from '@/lib/data-service';
import type { Category } from '@/types';

export async function getCategories(): Promise<Category[]> {
  return dataServiceInstance.getCategories();
}

export async function addCategory(values: Omit<Category, 'id'>): Promise<Category> {
  const newCategory = await dataServiceInstance.addCategory(values);
  revalidatePath('/admin/categories');
  return newCategory;
}

export async function updateCategory(values: Category): Promise<Category | null> {
  const updatedCategory = await dataServiceInstance.updateCategory(values);
  revalidatePath('/admin/categories');
  return updatedCategory;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const success = await dataServiceInstance.deleteCategory(id);
  revalidatePath('/admin/categories');
  return success;
}
