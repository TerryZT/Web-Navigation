"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { LinkItem, Category } from '@/types';
import { getLinks, getCategories, addLink, updateLink, deleteLink } from '@/lib/data-service';
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

export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState<LinkItem | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setLinks(getLinks());
    setCategories(getCategories());
    const action = searchParams.get('action');
    if (action === 'add') {
      setIsFormOpen(true);
      setEditingLink(undefined);
      const newPath = router.pathname; 
      window.history.replaceState({}, '', newPath);
    }
  }, [searchParams, router.pathname]);

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

  const confirmDelete = () => {
    if (isDeleting) {
      const success = deleteLink(isDeleting.id);
       if (success) {
        setLinks(getLinks());
        toast({ title: "Link Deleted", description: `Link "${isDeleting.title}" has been deleted.` });
      } else {
        toast({ title: "Error", description: "Failed to delete link.", variant: "destructive" });
      }
      setIsDeleting(null);
    }
  };

  const handleSubmitForm = (values: Omit<LinkItem, 'id'> & { id?: string }) => {
    if (editingLink) {
      const updated = updateLink({ ...editingLink, ...values });
      if (updated) {
        toast({ title: "Link Updated", description: `Link "${updated.title}" has been updated.` });
      } else {
        toast({ title: "Error", description: "Failed to update link.", variant: "destructive" });
      }
    } else {
      const newL = addLink(values);
      toast({ title: "Link Added", description: `Link "${newL.title}" has been added.` });
    }
    setLinks(getLinks());
    setIsFormOpen(false);
    setEditingLink(undefined);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'N/A';
  };

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