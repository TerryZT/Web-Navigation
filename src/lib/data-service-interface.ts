
import type { Category, LinkItem } from '@/types';

export interface IDataService {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  addCategory(category: Omit<Category, 'id'>): Promise<Category>;
  updateCategory(updatedCategory: Category): Promise<Category | null>;
  deleteCategory(id: string): Promise<boolean>;

  // Links
  getLinks(): Promise<LinkItem[]>;
  getLinksByCategoryId(categoryId: string): Promise<LinkItem[]>;
  getLink(id: string): Promise<LinkItem | undefined>;
  addLink(link: Omit<LinkItem, 'id'>): Promise<LinkItem>;
  updateLink(updatedLink: LinkItem): Promise<LinkItem | null>;
  deleteLink(id: string): Promise<boolean>;
}
