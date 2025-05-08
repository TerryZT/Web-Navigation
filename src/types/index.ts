export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string; // Lucide icon name
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  categoryId: string;
  icon?: string; // Lucide icon name or path to image, for now lucide
}