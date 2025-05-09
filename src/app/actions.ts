'use server';
import { getCategoriesCore, getLinksByCategoryIdCore } from '@/lib/data-service';
import type { Category, LinkItem } from '@/types';

export async function getPublicPageCategories(): Promise<Category[]> {
  try {
    console.log("getPublicPageCategories: Fetching categories for public page...");
    const categories = await getCategoriesCore();
    console.log(`getPublicPageCategories: Successfully fetched ${categories.length} categories.`);
    return categories;
  } catch (error: any) {
    console.error(`getPublicPageCategories: Failed to fetch categories.`, {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500) // Log more of the stack
    });
    // For public page, we might want to return empty array instead of throwing,
    // to allow the page to render gracefully with a "no data" message.
    // However, re-throwing helps in debugging setup issues.
    // For now, let's re-throw.
    throw error; 
  }
}

export async function getPublicPageLinksByCategoryId(categoryId: string): Promise<LinkItem[]> {
  try {
    console.log(`getPublicPageLinksByCategoryId: Fetching links for category ID: ${categoryId}`);
    const links = await getLinksByCategoryIdCore(categoryId);
    console.log(`getPublicPageLinksByCategoryId: Successfully fetched ${links.length} links for category ID: ${categoryId}.`);
    return links;
  } catch (error: any) {
    console.error(`getPublicPageLinksByCategoryId: Failed to fetch links for category ID: ${categoryId}.`, {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500) // Log more of the stack
    });
    throw error;
  }
}
