"use client";
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// Import actual server actions
import { getCategoriesAction } from './categories/actions'; 
import { getLinksAction } from './links/actions';
import { getClientLocalDataService } from '@/lib/client-local-data-service'; // Client-side service
import type { IDataService } from '@/lib/data-service-interface';

import IconComponent from '@/components/icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; 

const IS_LOCAL_STORAGE_MODE = process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE === 'local' || !process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE;

function getEffectiveDataService(): IDataService {
  if (IS_LOCAL_STORAGE_MODE) {
    return getClientLocalDataService();
  }
  // For non-local modes, return an object that calls the server actions
  return {
    getCategories: getCategoriesAction, // Use server action
    getLinks: getLinksAction,           // Use server action
    // Dummy implementations for other IDataService methods not used by this page
    getLinksByCategoryId: async (categoryId: string) => { console.warn("getLinksByCategoryId called on server action stub from admin dashboard"); return []; },
    getLink: async (id: string) => { console.warn("getLink called on server action stub from admin dashboard"); return undefined; },
    getCategory: async (id: string) => { console.warn("getCategory called on server action stub from admin dashboard"); return undefined; },
    addCategory: async (category) => { console.warn("addCategory called on server action stub from admin dashboard"); throw new Error("Not implemented on stub"); },
    updateCategory: async (category) => { console.warn("updateCategory called on server action stub from admin dashboard"); throw new Error("Not implemented on stub"); },
    deleteCategory: async (id: string) => { console.warn("deleteCategory called on server action stub from admin dashboard"); return false; },
    addLink: async (link) => { console.warn("addLink called on server action stub from admin dashboard"); throw new Error("Not implemented on stub"); },
    updateLink: async (link) => { console.warn("updateLink called on server action stub from admin dashboard"); throw new Error("Not implemented on stub"); },
    deleteLink: async (id: string) => { console.warn("deleteLink called on server action stub from admin dashboard"); return false; },
  };
}


export default function AdminDashboardPage() {
  const [categoryCount, setCategoryCount] = useState(0);
  const [linkCount, setLinkCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    setIsLoading(true);
    const service = getEffectiveDataService();
    try {
      const [categories, links] = await Promise.all([
        service.getCategories(),
        service.getLinks(),
      ]);
      setCategoryCount(categories.length);
      setLinkCount(links.length);
    } catch (error) {
      console.error("Failed to fetch counts:", error);
      setCategoryCount(0);
      setLinkCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-1/3 mb-6" /> {/* Title Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-1/2" /> {/* Card Title Skeleton */}
                <Skeleton className="h-5 w-5 rounded-full" /> {/* Icon Skeleton */}
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/4 mb-1" /> {/* Count Skeleton */}
                <Skeleton className="h-4 w-3/4 mb-2" /> {/* Description Skeleton */}
                <Skeleton className="h-8 w-24" /> {/* Button Skeleton */}
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <Skeleton className="h-7 w-1/2 mb-2" /> {/* Welcome Title Skeleton */}
            <Skeleton className="h-5 w-full" /> {/* Welcome Description Skeleton */}
             <Skeleton className="h-5 w-3/4 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-5 w-1/4 mb-2" /> {/* "Get started by:" Skeleton */}
            <ul className="list-disc list-inside mt-2 space-y-2 text-sm">
              <li><Skeleton className="h-5 w-3/4" /></li>
              <li><Skeleton className="h-5 w-3/4" /></li>
              <li><Skeleton className="h-5 w-3/4" /></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-primary">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <IconComponent name="Folder" className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryCount}</div>
            <p className="text-xs text-muted-foreground">Manage your link categories.</p>
            <Button asChild variant="link" className="px-0 mt-2">
              <Link href="/admin/categories">View Categories</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <IconComponent name="Link" className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{linkCount}</div>
            <p className="text-xs text-muted-foreground">Manage your individual links.</p>
             <Button asChild variant="link" className="px-0 mt-2">
              <Link href="/admin/links">View Links</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <IconComponent name="Zap" className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
             <Button asChild variant="outline" size="sm">
              <Link href="/admin/categories?action=add">Add New Category</Link>
            </Button>
             <Button asChild variant="outline" size="sm">
              <Link href="/admin/links?action=add">Add New Link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
       <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle>Welcome to Link Hub Admin!</CardTitle>
          <CardDescription>
            Use the navigation panel to manage your categories and links. Your changes will be reflected on the public-facing website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Get started by:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Adding a new <Link href="/admin/categories?action=add" className="text-primary hover:underline">category</Link> to group your links.</li>
            <li>Adding a new <Link href="/admin/links?action=add" className="text-primary hover:underline">link</Link> to an existing category.</li>
            <li>Exploring the public <Link href="/" target="_blank" className="text-primary hover:underline">Link Hub page</Link> to see your content.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
