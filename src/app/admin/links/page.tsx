"use client";
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { LinkItem, Category } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LinkForm } from '@/components/admin/LinkForm';
import { useToast } from '@/hooks/use-toast';
import IconComponent from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

import { getLinksAction, addLinkAction, deleteLinkAction, updateLinkAction } from './actions';
import { getCategoriesAction as getCategoriesServerAction } from '../categories/actions'; // Renamed to avoid conflict
import { getClientLocalDataService } from '@/lib/client-local-data-service';
import type { IDataService } from '@/lib/data-service-interface';

const IS_LOCAL_STORAGE_MODE = process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE === 'local' || !process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE;

function getEffectiveDataService(): IDataService {
  if (IS_LOCAL_STORAGE_MODE) {
    return getClientLocalDataService();
  }
  // For non-local modes, return an object that calls the server actions
  return {
    getLinks: getLinksAction,
    addLink: addLinkAction,
    updateLink: updateLinkAction,
    deleteLink: deleteLinkAction,
    getCategories: getCategoriesServerAction, // Use the server action for categories
    // Dummy implementations for other IDataService methods not used by this page
    getLinksByCategoryId: async (categoryId: string) => { console.warn("getLinksByCategoryId called on server action stub"); return []; },
    getLink: async (id: string) => { console.warn("getLink called on server action stub"); return undefined; },
    getCategory: async (id: string) => { console.warn("getCategory called on server action stub"); return undefined; },
    addCategory: async (category) => { console.warn("addCategory called on server action stub"); throw new Error("Not implemented on stub"); },
    updateCategory: async (category) => { console.warn("updateCategory called on server action stub"); throw new Error("Not implemented on stub"); },
    deleteCategory: async (id: string) => { console.warn("deleteCategory called on server action stub"); return false; },
  };
}


export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState<LinkItem | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const service = getEffectiveDataService();
      const [fetchedLinks, fetchedCategories] = await Promise.all([
        service.getLinks(),
        service.getCategories() // This will use clientLocal.getCategories or categoriesServerAction
      ]);
      setLinks(fetchedLinks);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({ title: "Error", description: "Could not load links or categories.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    const action = searchParams.get('action');
    if (action === 'add') {
      setIsFormOpen(true);
      setEditingLink(undefined);
      if (typeof window !== 'undefined') {
        const currentPathname = window.location.pathname;
        window.history.replaceState({}, '', currentPathname);
      }
    }
  }, [fetchData, searchParams]);

  const handleAddLink = () => {
    if (categories.length === 0) {
      toast({
        title: "No Categories Found",
        description: "Please add a category first before adding a link.",
        variant: "destructive",
        action: <Button asChild size="sm"><Link href="/admin/categories?action=add">Add Category</Link></Button>
      });
      return;
    }
    setEditingLink(undefined);
    setIsFormOpen(true);
  };

  const handleEditLink = (link: LinkItem) => {
    setEditingLink(link);
    setIsFormOpen(true);
  };

  const handleDeleteLink = (link: LinkItem) => {
    setIsDeleting(link);
  };

  const confirmDelete = async () => {
    if (isDeleting) {
      try {
        const service = getEffectiveDataService();
        const success = await service.deleteLink(isDeleting.id);
        if (success) {
          await fetchData();
          toast({ title: "Link Deleted", description: `Link "${isDeleting.title}" has been deleted.` });
        } else {
          toast({ title: "Error", description: "Failed to delete link.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Error deleting link:", error);
        toast({ title: "Error", description: "An error occurred while deleting the link.", variant: "destructive" });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleSubmitForm = async (values: Omit<LinkItem, 'id'> & { id?: string }) => {
    const service = getEffectiveDataService();
    try {
      if (editingLink) {
        const updated = await service.updateLink({ ...editingLink, ...values } as LinkItem); // Ensure ID is present
        if (updated) {
          toast({ title: "Link Updated", description: `Link "${updated.title}" has been updated.` });
        } else {
          toast({ title: "Error", description: "Failed to update link.", variant: "destructive" });
        }
      } else {
        const newL = await service.addLink(values);
        toast({ title: "Link Added", description: `Link "${newL.title}" has been added.` });
      }
      await fetchData();
      setIsFormOpen(false);
      setEditingLink(undefined);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'N/A';
  };

  if (isLoading) {
    return (
       <Card className="shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-1/5" />
                <Skeleton className="h-5 w-2/5" />
                <Skeleton className="h-5 w-1/5" />
                <div className="ml-auto flex space-x-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold text-primary">Manage Links</CardTitle>
        <Button onClick={handleAddLink}><IconComponent name="PlusCircle" className="mr-2 h-5 w-5" /> Add Link</Button>
      </CardHeader>
      <CardContent>
        {links.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    {link.icon && <IconComponent name={link.icon} className="h-5 w-5 text-muted-foreground" />}
                  </TableCell>
                  <TableCell className="font-medium">{link.title}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{link.url}</a>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{getCategoryName(link.categoryId)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditLink(link)}>
                      <IconComponent name="Edit3" className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteLink(link)}>
                       <IconComponent name="Trash2" className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <IconComponent name="Link" className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg">No links found.</p>
            {categories.length === 0 ? (
                 <p>Please <Link href="/admin/categories?action=add" className="text-primary hover:underline">add a category</Link> first.</p>
            ) : (
                <p>Click "Add Link" to get started.</p>
            )}
          </div>
        )}
      </CardContent>

      <LinkForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingLink(undefined); }}
        onSubmit={handleSubmitForm}
        defaultValues={editingLink}
        categories={categories}
        isEditing={!!editingLink}
      />

      {isDeleting && (
        <AlertDialog open={!!isDeleting} onOpenChange={() => setIsDeleting(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete "{isDeleting.title}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the link.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleting(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}
