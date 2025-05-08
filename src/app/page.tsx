"use client";
import { useEffect, useState } from 'react';
import type { Category, LinkItem } from '@/types';
import { getCategories, getLinksByCategoryId } from '@/lib/data-service';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import CategorySection from '@/components/links/CategorySection';
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [linksMap, setLinksMap] = useState<Record<string, LinkItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const fetchedCategories = getCategories();
      setCategories(fetchedCategories);

      const newLinksMap: Record<string, LinkItem[]> = {};
      fetchedCategories.forEach(category => {
        newLinksMap[category.id] = getLinksByCategoryId(category.id);
      });
      setLinksMap(newLinksMap);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary">Welcome to Link Hub</h1>
          <p className="text-xl text-muted-foreground mt-4">Your central place for quick access to all your important links.</p>
        </div>
        {loading ? (
          <>
            {[1, 2].map(i => (
              <div key={i} className="mb-12">
                <Skeleton className="h-8 w-1/4 mb-6" />
                <Skeleton className="h-6 w-1/2 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1,2,3,4].map(j => <Skeleton key={j} className="h-48 w-full rounded-lg" />)}
                </div>
              </div>
            ))}
          </>
        ) : categories.length > 0 ? (
          categories.map(category => (
            <CategorySection key={category.id} category={category} links={linksMap[category.id] || []} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No categories or links found. Start by adding some in the admin panel!</p>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}