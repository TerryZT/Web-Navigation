"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Category } from '@/types';
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/lib/data-service';
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState<Category | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();


  useEffect(() => {
    setCategories(getCategories());
    const action = searchParams.get('action');
    if (action === 'add') {
      setIsFormOpen(true);
      setEditingCategory(undefined);
       // Remove action from URL after handling
      const newPath = router.pathname; // Use router.pathname from next/navigation
      window.history.replaceState({}, '', newPath);
    }
  }, [searchParams, router.pathname]);

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
  
  const confirmDelete = () => {
    if (isDeleting) {
      const success = deleteCategory(isDeleting.id);
      if (success) {
        setCategories(getCategories());
        toast({ title: "Category Deleted", description: `Category "${isDeleting.name}" has been deleted.` });
      } else {
        toast({ title: "Error", description: "Failed to delete category.", variant: "destructive" });
      }
      setIsDeleting(null);
    }
  };

  const handleSubmitForm = (values: Omit<Category, 'id'> & { id?: string }) => {
    if (editingCategory) {
      const updated = updateCategory({ ...editingCategory, ...values });
      if (updated) {
        toast({ title: "Category Updated", description: `Category "${updated.name}" has been updated.` });
      } else {
        toast({ title: "Error", description: "Failed to update category.", variant: "destructive" });
      }
    } else {
      const newCat = addCategory(values);
      toast({ title: "Category Added", description: `Category "${newCat.name}" has been added.` });
    }
    setCategories(getCategories());
    setIsFormOpen(false);
    setEditingCategory(undefined);
  };

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