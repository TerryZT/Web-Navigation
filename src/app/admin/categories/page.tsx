"use client";
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Category } from '@/types';
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
import { CategoryForm } from '@/components/admin/CategoryForm';
import { useToast } from '@/hooks/use-toast';
import IconComponent from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategoriesAction, addCategoryAction, deleteCategoryAction, updateCategoryAction } from './actions';
import { getClientLocalDataService } from '@/lib/client-local-data-service';
import type { IDataService } from '@/lib/data-service-interface';

const IS_LOCAL_STORAGE_MODE = process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE === 'local' || !process.env.NEXT_PUBLIC_DATA_SOURCE_TYPE;

function getEffectiveDataService(): IDataService {
  if (IS_LOCAL_STORAGE_MODE) {
    return getClientLocalDataService();
  }
  return {
    getCategories: getCategoriesAction,
    addCategory: addCategoryAction,
    updateCategory: updateCategoryAction,
    deleteCategory: deleteCategoryAction,
    // Dummy implementations for other IDataService methods not used by this page
    getCategory: async (id: string) => { console.warn("getCategory called on server action stub"); return undefined; },
    getLinks: async () => { console.warn("getLinks called on server action stub"); return []; },
    getLinksByCategoryId: async (id: string) => { console.warn("getLinksByCategoryId called on server action stub"); return []; },
    getLink: async (id: string) => { console.warn("getLink called on server action stub"); return undefined; },
    addLink: async (link) => { console.warn("addLink called on server action stub"); throw new Error("Not implemented on stub"); },
    updateLink: async (link) => { console.warn("updateLink called on server action stub"); throw new Error("Not implemented on stub"); },
    deleteLink: async (id: string) => { console.warn("deleteLink called on server action stub"); return false; },
  };
}


export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState<Category | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // dataService instance will be resolved based on mode within functions
  // No need to store it in state if getEffectiveDataService is cheap (which it is)

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const service = getEffectiveDataService();
      const fetchedCategories = await service.getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast({ title: "Error", description: "Could not load categories.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
    const action = searchParams.get('action');
    if (action === 'add') {
      setIsFormOpen(true);
      setEditingCategory(undefined);
      // Clean the URL query param
      if (typeof window !== 'undefined') {
        const currentPathname = window.location.pathname;
        window.history.replaceState({}, '', currentPathname);
      }
    }
  }, [fetchCategories, searchParams]);

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setIsDeleting(category);
  };

  const confirmDelete = async () => {
    if (isDeleting) {
      try {
        const service = getEffectiveDataService();
        const success = await service.deleteCategory(isDeleting.id);
        if (success) {
          await fetchCategories(); // Refetch to update list
          toast({ title: "Category Deleted", description: `Category "${isDeleting.name}" has been deleted.` });
        } else {
          toast({ title: "Error", description: "Failed to delete category.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        toast({ title: "Error", description: "An error occurred while deleting the category.", variant: "destructive" });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleSubmitForm = async (values: Omit<Category, 'id'> & { id?: string }) => {
    const service = getEffectiveDataService();
    try {
      if (editingCategory) {
        const updated = await service.updateCategory({ ...editingCategory, ...values } as Category); // Ensure ID is present
        if (updated) {
          toast({ title: "Category Updated", description: `Category "${updated.name}" has been updated.` });
        } else {
          toast({ title: "Error", description: "Failed to update category.", variant: "destructive" });
        }
      } else {
        const newCat = await service.addCategory(values);
        toast({ title: "Category Added", description: `Category "${newCat.name}" has been added.` });
      }
      await fetchCategories(); // Refetch to update list
      setIsFormOpen(false);
      setEditingCategory(undefined);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    }
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
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/2" />
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
        <CardTitle className="text-2xl font-bold text-primary">Manage Categories</CardTitle>
        <Button onClick={handleAddCategory}><IconComponent name="PlusCircle" className="mr-2 h-5 w-5" /> Add Category</Button>
      </CardHeader>
      <CardContent>
        {categories.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.icon && <IconComponent name={category.icon} className="h-5 w-5 text-muted-foreground" />}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{category.description || '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                      <IconComponent name="Edit3" className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category)}>
                      <IconComponent name="Trash2" className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <IconComponent name="Folder" className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg">No categories found.</p>
            <p>Click "Add Category" to get started.</p>
          </div>
        )}
      </CardContent>

      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingCategory(undefined); }}
        onSubmit={handleSubmitForm}
        defaultValues={editingCategory}
        isEditing={!!editingCategory}
      />

      {isDeleting && (
        <AlertDialog open={!!isDeleting} onOpenChange={() => setIsDeleting(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete "{isDeleting.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the category and all associated links.
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
