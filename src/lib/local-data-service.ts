
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
  { id: "1", title: "Google", url: "https://google.com", description: "Search engine", categoryId: "1", icon: "Zap", iconSource: "lucide" },
  { id: "2", title: "Next.js Docs", url: "https://nextjs.org/docs", description: "The React Framework for Production", categoryId: "3", icon: "FileText", iconSource: "lucide" },
  { id: "3", title: "Tailwind CSS", url: "https://tailwindcss.com", description: "A utility-first CSS framework", categoryId: "3", icon: "Palette", iconSource: "lucide" },
  { id: "4", title: "GitHub", url: "https://github.com", description: "Code hosting platform", categoryId: "2", icon: "Github", iconSource: "lucide" },
  { id: "5", title: "MDN Web Docs", url: "https://developer.mozilla.org", description: "Resources for developers, by developers", categoryId: "4", icon: "BookOpen", iconSource: "lucide" },
];

const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") {
    // For server-side rendering or build time, if this class is instantiated, return default.
    // This should not happen for write operations.
    console.warn(`LocalDataService: Attempted to read localStorage key "${key}" on the server. Returning default.`);
    return defaultValue;
  }
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return defaultValue;
  }
};

const setLocalStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") {
    console.warn(`LocalDataService: Attempted to write localStorage key "${key}" on the server. Operation skipped.`);
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error writing to localStorage:", error);
  }
};

// Initialize with default data if local storage is empty
// This block will only run on the client-side when the module is imported.
if (typeof window !== "undefined") {
  if (localStorage.getItem(CATEGORIES_KEY) === null) {
    setLocalStorageItem(CATEGORIES_KEY, initialCategories);
  }
  if (localStorage.getItem(LINKS_KEY) === null) {
    setLocalStorageItem(LINKS_KEY, initialLinks);
  }
}
export class LocalDataService implements IDataService {
  private categories: Category[];
  private links: LinkItem[];
  private isServerContext: boolean;

  constructor() {
    this.isServerContext = typeof window === 'undefined';
    if (this.isServerContext) {
      // Server context: use in-memory defaults that won't persist.
      // This is primarily for build-time or server-side fallbacks when NEXT_PUBLIC_DATA_SOURCE_TYPE="local".
      this.categories = JSON.parse(JSON.stringify(initialCategories)); // Deep copy
      this.links = JSON.parse(JSON.stringify(initialLinks)); // Deep copy
      console.warn("LocalDataService instantiated on the server. Data will be in-memory and reset on each request/build for 'local' mode.");
    } else {
      // Client context: use localStorage.
      // Ensure defaults are loaded if localStorage is empty.
      if (localStorage.getItem(CATEGORIES_KEY) === null) {
        setLocalStorageItem(CATEGORIES_KEY, initialCategories);
      }
      if (localStorage.getItem(LINKS_KEY) === null) {
        setLocalStorageItem(LINKS_KEY, initialLinks);
      }
      this.categories = getLocalStorageItem(CATEGORIES_KEY, initialCategories);
      this.links = getLocalStorageItem(LINKS_KEY, initialLinks);
    }
  }

  private persistCategories(): void {
    if (!this.isServerContext) {
      setLocalStorageItem(CATEGORIES_KEY, this.categories);
    }
  }

  private persistLinks(): void {
    if (!this.isServerContext) {
      setLocalStorageItem(LINKS_KEY, this.links);
    }
  }


  async getCategories(): Promise<Category[]> {
    if (this.isServerContext) return Promise.resolve(JSON.parse(JSON.stringify(initialCategories))); // Fresh copy for server
    this.categories = getLocalStorageItem(CATEGORIES_KEY, initialCategories); // Ensure fresh read on client
    return Promise.resolve(this.categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const categories = await this.getCategories();
    return Promise.resolve(categories.find(cat => cat.id === id));
  }

  async addCategory(categoryData: Omit<Category, "id">): Promise<Category> {
    const categories = await this.getCategories(); // Ensures we're operating on current data
    const newCategory: Category = { ...categoryData, id: Date.now().toString() };
    this.categories = [...categories, newCategory];
    this.persistCategories();
    return Promise.resolve(newCategory);
  }

  async updateCategory(updatedCategory: Category): Promise<Category | null> {
    let categories = await this.getCategories();
    const index = categories.findIndex(cat => cat.id === updatedCategory.id);
    if (index !== -1) {
      this.categories = categories.map(c => c.id === updatedCategory.id ? updatedCategory : c);
      this.persistCategories();
      return Promise.resolve(updatedCategory);
    }
    return Promise.resolve(null);
  }

  async deleteCategory(id: string): Promise<boolean> {
    let categories = await this.getCategories();
    const initialLength = categories.length;
    this.categories = categories.filter(cat => cat.id !== id);
    
    if (this.categories.length < initialLength) {
      this.persistCategories();
      // Also delete associated links
      let links = await this.getLinks();
      this.links = links.filter(link => link.categoryId !== id);
      this.persistLinks();
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  async getLinks(): Promise<LinkItem[]> {
     if (this.isServerContext) return Promise.resolve(JSON.parse(JSON.stringify(initialLinks))); // Fresh copy for server
    this.links = getLocalStorageItem(LINKS_KEY, initialLinks); // Ensure fresh read on client
    return Promise.resolve(this.links);
  }

  async getLinksByCategoryId(categoryId: string): Promise<LinkItem[]> {
    const links = await this.getLinks();
    return Promise.resolve(links.filter(link => link.categoryId === categoryId));
  }

  async getLink(id: string): Promise<LinkItem | undefined> {
    const links = await this.getLinks();
    return Promise.resolve(links.find(link => link.id === id));
  }

  async addLink(linkData: Omit<LinkItem, "id" | "iconSource"> & Partial<Pick<LinkItem, "iconSource" | "icon">>) : Promise<LinkItem> {
    const links = await this.getLinks();
    const newLink: LinkItem = {
      ...linkData,
      id: Date.now().toString(),
      // Ensure iconSource is set, default to 'lucide' if icon is present but no source, else 'none'
      iconSource: linkData.iconSource || (linkData.icon ? 'lucide' : 'none')
    };
    this.links = [...links, newLink];
    this.persistLinks();
    return Promise.resolve(newLink);
  }

  async updateLink(updatedLink: LinkItem): Promise<LinkItem | null> {
    let links = await this.getLinks();
    const index = links.findIndex(link => link.id === updatedLink.id);
    if (index !== -1) {
      this.links = links.map(l => l.id === updatedLink.id ? updatedLink : l);
      this.persistLinks();
      return Promise.resolve(updatedLink);
    }
    return Promise.resolve(null);
  }

  async deleteLink(id: string): Promise<boolean> {
    let links = await this.getLinks();
    const initialLength = links.length;
    this.links = links.filter(link => link.id !== id);
    if (this.links.length < initialLength) {
      this.persistLinks();
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
}
