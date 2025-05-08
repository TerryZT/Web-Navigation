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
  icon?: string; // Can be Lucide name, URL, or Data URI. Undefined if iconSource is 'none'.
  iconSource?: 'lucide' | 'url' | 'data' | 'none'; // Indicates the source/type of the icon string
}
