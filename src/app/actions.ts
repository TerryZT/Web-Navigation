'use server';
import { getCategories as getCategoriesCore, getLinksByCategoryId as getLinksByCategoryIdCore } from '@/lib/data-service';
import type { Category, LinkItem } from '@/types';

export async function getPublicPageCategories(): Promise<Category[]> {
  return getCategoriesCore();
}

export async function getPublicPageLinksByCategoryId(categoryId: string): Promise<LinkItem[]> {
  return getLinksByCategoryIdCore(categoryId);
}