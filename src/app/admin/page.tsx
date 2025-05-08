"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCategories, getLinks } from '@/lib/data-service';
import type { Category, LinkItem } from '@/types';
import IconComponent from '@/components/icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const [categoryCount, setCategoryCount] = useState(0);
  const [linkCount, setLinkCount] = useState(0);

  useEffect(() => {
    setCategoryCount(getCategories().length);
    setLinkCount(getLinks().length);
  }, []);

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