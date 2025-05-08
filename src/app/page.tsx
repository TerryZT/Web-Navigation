
"use client";
import { useEffect, useState, useCallback } from 'react';
import type { Category, LinkItem } from '@/types';
import { getCategories, getLinksByCategoryId } from '@/lib/data-service';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import CategorySection from '@/components/links/CategorySection';
import Logo from '@/components/layout/Logo';
import { Input } from '@/components/ui/input';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allLinksMap, setAllLinksMap] = useState<Record<string, LinkItem[]>>({});
  
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [filteredLinksMap, setFilteredLinksMap] = useState<Record<string, LinkItem[]>>({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedCategories = await getCategories();
      setAllCategories(fetchedCategories);

      const newLinksMap: Record<string, LinkItem[]> = {};
      // Fetch links for all categories in parallel
      await Promise.all(fetchedCategories.map(async (category) => {
        newLinksMap[category.id] = await getLinksByCategoryId(category.id);
      }));
      setAllLinksMap(newLinksMap);

    } catch (error) {
      console.error("Failed to load data:", error);
      toast({ title: "Error", description: "Could not load link data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (loading) return;

    if (!searchTerm.trim()) {
      setFilteredCategories(allCategories);
      setFilteredLinksMap(allLinksMap);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    
    const newFilteredCategories: Category[] = [];
    const newFilteredLinksMap: Record<string, LinkItem[]> = {};

    allCategories.forEach(category => {
      const categoryMatches = category.name.toLowerCase().includes(lowerSearchTerm) || 
                              (category.description && category.description.toLowerCase().includes(lowerSearchTerm));
      
      const linksInCategory = allLinksMap[category.id] || [];
      const matchingLinks = linksInCategory.filter(link => 
        link.title.toLowerCase().includes(lowerSearchTerm) ||
        (link.description && link.description.toLowerCase().includes(lowerSearchTerm)) ||
        link.url.toLowerCase().includes(lowerSearchTerm)
      );

      if (categoryMatches || matchingLinks.length > 0) {
        newFilteredCategories.push(category);
        // If category itself matches, show all its links, otherwise show only matching links
        newFilteredLinksMap[category.id] = categoryMatches ? linksInCategory : matchingLinks;
      }
    });
    
    setFilteredCategories(newFilteredCategories);
    setFilteredLinksMap(newFilteredLinksMap);

  }, [searchTerm, allCategories, allLinksMap, loading]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-12">
          <Logo />
          <h1 className="text-5xl font-bold text-foreground mt-8">Hello</h1>
          <p className="text-3xl text-primary mt-4">
            Welcome to All-Subject English Enlightenment
          </p>
          <p className="text-lg text-muted-foreground mt-2">
            系统 (平台) 由 Erin 全科英语启蒙团队独立开发完成
          </p>
          <div className="mt-8 w-full max-w-lg">
            <Input 
              type="search"
              placeholder="搜索..."
              className="py-6 text-lg rounded-xl shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
        ) : filteredCategories.length > 0 ? (
          filteredCategories.map(category => (
            <CategorySection key={category.id} category={category} links={filteredLinksMap[category.id] || []} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              {searchTerm ? `No results found for "${searchTerm}".` : "No categories or links found. Start by adding some in the admin panel!"}
            </p>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}

