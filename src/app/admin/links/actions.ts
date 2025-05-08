'use server';

import { revalidatePath } from 'next/cache';
import { dataServiceInstance } from '@/lib/data-service';
import type { LinkItem } from '@/types';

export async function getLinks(): Promise<LinkItem[]> {
  return dataServiceInstance.getLinks();
}

export async function addLink(values: Omit<LinkItem, 'id'>): Promise<LinkItem> {
  const newLink = await dataServiceInstance.addLink(values);
  revalidatePath('/admin/links');
  return newLink;
}

export async function updateLink(values: LinkItem): Promise<LinkItem | null> {
  const updatedLink = await dataServiceInstance.updateLink(values);
  revalidatePath('/admin/links');
  return updatedLink;
}

export async function deleteLink(id: string): Promise<boolean> {
  const success = await dataServiceInstance.deleteLink(id);
  revalidatePath('/admin/links');
  return success;
}
