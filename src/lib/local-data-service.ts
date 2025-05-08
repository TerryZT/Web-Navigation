
"use client";
import type { Category, LinkItem } from '@/types';
import type { IDataService } from './data-service-interface';

const CATEGORIES_KEY = "linkhub_categories";
const LINKS_KEY = "linkhub_links";

const initialCategories: Category[] = [
  { id: "1", name: "General", description: "Useful general links", icon: "Globe" },
  { id: "2", name: "Work", description: "Work-related tools and resources", icon: "Briefcase" },
  { id: "3", name: "Development", description: "Coding and development links", icon: "Code" },
  { id: "4", name: "Learning", description: "Educational resources", icon: "BookOpen" },
];

const initialLinks: LinkItem[] = [
  { id: "1", title: "Google", url: "https://google.com", description: "Search engine", categoryId: "1", icon: "Zap" },
  { id: "2", title: "Next.js Docs", url: "https://nextjs.org/docs", description: "The React Framework for Production", categoryId: "3", icon: "FileText" },
  { id: "3", title: "Tailwind CSS", url: "https://tailwindcss.com", description: "A utility-first CSS framework", categoryId: "3", icon: "Palette" },
  { id: "4", title: "GitHub", url: "https://github.com", description: "Code hosting platform", categoryId: "2", icon: "Github" },
  { id: "5", title: "MDN Web Docs", url: "https://developer.mozilla.org", description: "Resources for developers, by developers", categoryId: "4", icon: "BookOpen" },
];

const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return defaultValue;
  }
};

const setLocalStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }
};

// Initialize with default data if local storage is empty
if (typeof window !== "undefined") {
  if (localStorage.getItem(CATEGORIES_KEY) === null) {
    setLocalStorageItem(CATEGORIES_KEY, initialCategories);
  }
  if (localStorage.getItem(LINKS_KEY) === null) {
    setLocalStorageItem(LINKS_KEY, initialLinks);
  }
}
export class LocalDataService implements IDataService {
  async getCategories(): Promise<Category[]> {
    return Promise.resolve(getLocalStorageItem(CATEGORIES_KEY, initialCategories));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const categories = await this.getCategories();
    return Promise.resolve(categories.find(cat => cat.id === id));
  }

  async addCategory(categoryData: Omit<Category, "id">): Promise<Category> {
    const categories = await this.getCategories();
    const newCategory: Category = { ...categoryData, id: Date.now().toString() };
    setLocalStorageItem(CATEGORIES_KEY, [...categories, newCategory]);
    return Promise.resolve(newCategory);
  }

  async updateCategory(updatedCategory: Category): Promise<Category | null> {
    let categories = await this.getCategories();
    const index = categories.findIndex(cat => cat.id === updatedCategory.id);
    if (index !== -1) {
      categories[index] = updatedCategory;
      setLocalStorageItem(CATEGORIES_KEY, categories);
      return Promise.resolve(updatedCategory);
    }
    return Promise.resolve(null);
  }

  async deleteCategory(id: string): Promise<boolean> {
    let categories = await this.getCategories();
    const initialLength = categories.length;
    categories = categories.filter(cat => cat.id !== id);
    
    let links = await this.getLinks();
    links = links.filter(link => link.categoryId !== id);
    setLocalStorageItem(LINKS_KEY, links);
    
    if (categories.length < initialLength) {
      setLocalStorageItem(CATEGORIES_KEY, categories);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  async getLinks(): Promise<LinkItem[]> {
    return Promise.resolve(getLocalStorageItem(LINKS_KEY, initialLinks));
  }

  async getLinksByCategoryId(categoryId: string): Promise<LinkItem[]> {
    const links = await this.getLinks();
    return Promise.resolve(links.filter(link => link.categoryId === categoryId));
  }

  async getLink(id: string): Promise<LinkItem | undefined> {
    const links = await this.getLinks();
    return Promise.resolve(links.find(link => link.id === id));
  }

  async addLink(linkData: Omit<LinkItem, "id">): Promise<LinkItem> {
    const links = await this.getLinks();
    const newLink: LinkItem = { ...linkData, id: Date.now().toString() };
    setLocalStorageItem(LINKS_KEY, [...links, newLink]);
    return Promise.resolve(newLink);
  }

  async updateLink(updatedLink: LinkItem): Promise<LinkItem | null> {
    let links = await this.getLinks();
    const index = links.findIndex(link => link.id === updatedLink.id);
    if (index !== -1) {
      links[index] = updatedLink;
      setLocalStorageItem(LINKS_KEY, links);
      return Promise.resolve(updatedLink);
    }
    return Promise.resolve(null);
  }

  async deleteLink(id: string): Promise<boolean> {
    let links = await this.getLinks();
    const initialLength = links.length;
    links = links.filter(link => link.id !== id);
    if (links.length < initialLength) {
      setLocalStorageItem(LINKS_KEY, links);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
}
