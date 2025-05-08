"use client";
import type { Category, LinkItem } from "@/types";
import { Home, Briefcase, BookOpen, Code, Settings, Link as LinkIconLucide, Folder, Zap, Film, ShoppingCart, Users, Globe } from "lucide-react";

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
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : defaultValue;
};

const setLocalStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Categories CRUD
export const getCategories = (): Category[] => getLocalStorageItem(CATEGORIES_KEY, initialCategories);
export const getCategory = (id: string): Category | undefined => getCategories().find(cat => cat.id === id);

export const addCategory = (category: Omit<Category, "id">): Category => {
  const categories = getCategories();
  const newCategory: Category = { ...category, id: Date.now().toString() };
  setLocalStorageItem(CATEGORIES_KEY, [...categories, newCategory]);
  return newCategory;
};

export const updateCategory = (updatedCategory: Category): Category | null => {
  let categories = getCategories();
  const index = categories.findIndex(cat => cat.id === updatedCategory.id);
  if (index !== -1) {
    categories[index] = updatedCategory;
    setLocalStorageItem(CATEGORIES_KEY, categories);
    return updatedCategory;
  }
  return null;
};

export const deleteCategory = (id: string): boolean => {
  let categories = getCategories();
  const initialLength = categories.length;
  categories = categories.filter(cat => cat.id !== id);
  // Also delete links associated with this category
  let links = getLinks();
  links = links.filter(link => link.categoryId !== id);
  setLocalStorageItem(LINKS_KEY, links);
  
  if (categories.length < initialLength) {
    setLocalStorageItem(CATEGORIES_KEY, categories);
    return true;
  }
  return false;
};

// Links CRUD
export const getLinks = (): LinkItem[] => getLocalStorageItem(LINKS_KEY, initialLinks);
export const getLinksByCategoryId = (categoryId: string): LinkItem[] => getLinks().filter(link => link.categoryId === categoryId);
export const getLink = (id: string): LinkItem | undefined => getLinks().find(link => link.id === id);

export const addLink = (link: Omit<LinkItem, "id">): LinkItem => {
  const links = getLinks();
  const newLink: LinkItem = { ...link, id: Date.now().toString() };
  setLocalStorageItem(LINKS_KEY, [...links, newLink]);
  return newLink;
};

export const updateLink = (updatedLink: LinkItem): LinkItem | null => {
  let links = getLinks();
  const index = links.findIndex(link => link.id === updatedLink.id);
  if (index !== -1) {
    links[index] = updatedLink;
    setLocalStorageItem(LINKS_KEY, links);
    return updatedLink;
  }
  return null;
};

export const deleteLink = (id: string): boolean => {
  let links = getLinks();
  const initialLength = links.length;
  links = links.filter(link => link.id !== id);
  if (links.length < initialLength) {
    setLocalStorageItem(LINKS_KEY, links);
    return true;
  }
  return false;
};

// Initialize with default data if local storage is empty
if (typeof window !== "undefined") {
  if (!localStorage.getItem(CATEGORIES_KEY)) {
    setLocalStorageItem(CATEGORIES_KEY, initialCategories);
  }
  if (!localStorage.getItem(LINKS_KEY)) {
    setLocalStorageItem(LINKS_KEY, initialLinks);
  }
}