// @ts-nocheck
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { LinkItem, Category } from "@/types";
import IconComponent, { iconMap } from "@/components/icons";
import React, { useTransition, useEffect, useState } from "react";

const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const linkFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }).max(100),
  url: z.string().url({ message: "Please enter a valid URL." }),
  description: z.string().max(200).optional().or(z.literal('')),
  categoryId: z.string().min(1, {message: "Please select a category."}),
  iconSource: z.enum(['lucide', 'url', 'upload', 'none']).default('lucide'),
  lucideIconName: z.string().optional().or(z.literal('')),
  iconUrlInput: z.string().optional().or(z.literal('')), // Not strictly URL here, validated conditionally
  iconFileInput: z.any().optional(),
}).superRefine((data, ctx) => {
  if (data.iconSource === 'url') {
    if (!data.iconUrlInput) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['iconUrlInput'],
        message: 'Icon URL is required when "Icon URL" source is selected.',
      });
    } else {
      try {
        new URL(data.iconUrlInput);
      } catch (_) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['iconUrlInput'],
          message: 'Please enter a valid URL.',
        });
      }
    }
  }
  if (data.iconSource === 'lucide' && !data.lucideIconName) {
     // Allow 'none' selection for lucide, so this might not be strictly required if 'none' is a valid lucideIconName value
  }
  if (data.iconSource === 'upload' && data.iconFileInput && data.iconFileInput.length > 0) {
    const file = data.iconFileInput[0];
    if (file.size > MAX_FILE_SIZE_BYTES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['iconFileInput'],
        message: `File size must be less than ${MAX_FILE_SIZE_MB}MB.`,
      });
    }
    if (!file.type.startsWith('image/')) {
       ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['iconFileInput'],
        message: 'Invalid file type. Please upload an image.',
      });
    }
  }
});

type LinkFormValues = z.infer<typeof linkFormSchema>;

interface LinkFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<LinkItem>) => void; // onSubmit now takes Partial<LinkItem>
  defaultValues?: Partial<LinkItem>;
  categories: Category[];
  isEditing: boolean;
}

const availableIcons = Object.keys(iconMap).filter(iconName => iconName !== 'Default');

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function LinkForm({ isOpen, onClose, onSubmit, defaultValues, categories, isEditing }: LinkFormProps) {
  const [isPending, startTransition] = useTransition();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      title: "",
      url: "",
      description: "",
      categoryId: "",
      iconSource: 'lucide',
      lucideIconName: "",
      iconUrlInput: "",
      iconFileInput: undefined,
    },
  });

  const watchedIconSource = form.watch('iconSource');
  const watchedIconUrlInput = form.watch('iconUrlInput');
  const watchedIconFileInput = form.watch('iconFileInput');

  useEffect(() => {
    if (isOpen) {
      const initialFormValues: LinkFormValues = {
        title: defaultValues?.title || "",
        url: defaultValues?.url || "",
        description: defaultValues?.description || "",
        categoryId: defaultValues?.categoryId || "",
        iconSource: defaultValues?.iconSource || 'lucide',
        lucideIconName: (defaultValues?.iconSource === 'lucide' || !defaultValues?.iconSource) ? (defaultValues?.icon || "") : "",
        iconUrlInput: defaultValues?.iconSource === 'url' ? (defaultValues?.icon || "") : "",
        iconFileInput: undefined, // File input cannot be pre-filled
      };
      form.reset(initialFormValues);

      if (defaultValues?.iconSource === 'url' && defaultValues.icon) {
        setPreviewImage(defaultValues.icon);
      } else if (defaultValues?.iconSource === 'data' && defaultValues.icon) {
        setPreviewImage(defaultValues.icon);
      } else {
        setPreviewImage(null);
      }
    } else {
      form.reset(); // Reset form when dialog closes
      setPreviewImage(null);
    }
  }, [isOpen, defaultValues, form]);

  useEffect(() => {
    if (watchedIconSource === 'url' && watchedIconUrlInput) {
      // Basic validation for image URL to prevent broken images in preview
      const img = new Image();
      img.onload = () => setPreviewImage(watchedIconUrlInput);
      img.onerror = () => setPreviewImage(null); // Clear preview if URL is not a valid image
      img.src = watchedIconUrlInput;
    } else if (watchedIconSource === 'upload' && watchedIconFileInput && watchedIconFileInput.length > 0) {
      const file = watchedIconFileInput[0];
      if (file && file.type.startsWith('image/')) {
        readFileAsDataURL(file).then(setPreviewImage).catch(() => setPreviewImage(null));
      } else {
        setPreviewImage(null);
      }
    } else if (watchedIconSource !== 'url' && watchedIconSource !== 'upload') {
      setPreviewImage(null);
    }
  }, [watchedIconSource, watchedIconUrlInput, watchedIconFileInput]);


  const formSubmitHandler = async (values: LinkFormValues) => {
    startTransition(async () => {
      const linkToSubmit: Partial<LinkItem> = {
        title: values.title,
        url: values.url,
        description: values.description,
        categoryId: values.categoryId,
      };

      if (values.iconSource === 'lucide') {
        linkToSubmit.icon = values.lucideIconName && values.lucideIconName !== 'none' ? values.lucideIconName : undefined;
        linkToSubmit.iconSource = values.lucideIconName && values.lucideIconName !== 'none' ? 'lucide' : 'none';
      } else if (values.iconSource === 'url' && values.iconUrlInput) {
        linkToSubmit.icon = values.iconUrlInput;
        linkToSubmit.iconSource = 'url';
      } else if (values.iconSource === 'upload' && values.iconFileInput && values.iconFileInput.length > 0) {
        try {
          const dataUri = await readFileAsDataURL(values.iconFileInput[0]);
          linkToSubmit.icon = dataUri;
          linkToSubmit.iconSource = 'data';
        } catch (error) {
          console.error("Error reading file:", error);
          form.setError("iconFileInput", { type: "manual", message: "Could not read file." });
          return;
        }
      } else if (values.iconSource === 'none') {
        linkToSubmit.icon = undefined;
        linkToSubmit.iconSource = 'none';
      }
      
      onSubmit(linkToSubmit);
      // form.reset(); // Reset is now handled by useEffect on isOpen
      // onClose(); // onClose will trigger the reset
    });
  };
  
  const handleClose = () => {
    onClose(); // This will trigger the useEffect to reset the form
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { handleClose(); }}}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Link" : "Add New Link"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of this link." : "Fill in the details for the new link."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(formSubmitHandler)} className="space-y-6 py-4">
            {/* Standard fields */}
            <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Link Title</FormLabel> <FormControl><Input placeholder="e.g., My Favorite Blog" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="url" render={({ field }) => ( <FormItem> <FormLabel>URL</FormLabel> <FormControl><Input type="url" placeholder="https://example.com" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="categoryId" render={({ field }) => ( <FormItem> <FormLabel>Category</FormLabel> <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl> <SelectContent>{categories.map((category) => (<SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>))}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description (Optional)</FormLabel> <FormControl><Textarea placeholder="A short description of the link" {...field} /></FormControl> <FormMessage /> </FormItem> )} />

            {/* Icon Selection */}
            <FormField
              control={form.control}
              name="iconSource"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Icon Source</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset other icon fields when source changes
                        form.setValue('lucideIconName', '');
                        form.setValue('iconUrlInput', '');
                        form.setValue('iconFileInput', undefined);
                        setPreviewImage(null);
                      }}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="none" /></FormControl>
                        <FormLabel className="font-normal">None</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="lucide" /></FormControl>
                        <FormLabel className="font-normal">Lucide Icon</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="url" /></FormControl>
                        <FormLabel className="font-normal">Icon URL</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="upload" /></FormControl>
                        <FormLabel className="font-normal">Upload Icon</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedIconSource === 'lucide' && (
              <FormField
                control={form.control}
                name="lucideIconName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Lucide Icon</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select an icon" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Icon</SelectItem>
                        {availableIcons.map((iconName) => (
                          <SelectItem key={iconName} value={iconName}>
                            <div className="flex items-center gap-2"> <IconComponent name={iconName} className="h-4 w-4" /> {iconName} </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchedIconSource === 'url' && (
              <FormField
                control={form.control}
                name="iconUrlInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://example.com/icon.png" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchedIconSource === 'upload' && (
               <FormField
                control={form.control}
                name="iconFileInput"
                render={({ field: { onChange, value, ...restField } }) => ( // Destructure to handle file input correctly
                  <FormItem>
                    <FormLabel>Upload Icon File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          onChange(e.target.files); // Pass FileList to react-hook-form
                        }}
                        {...restField} // Pass rest of the field props like name, ref
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {previewImage && (watchedIconSource === 'url' || watchedIconSource === 'upload') && (
              <div className="mt-2">
                <FormLabel>Icon Preview</FormLabel>
                <img src={previewImage} alt="Icon preview" className="mt-1 h-16 w-16 object-contain border rounded-md" />
              </div>
            )}


            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isEditing ? "Save Changes" : "Add Link"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
