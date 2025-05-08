'use server';

import { revalidatePath } from 'next/cache';
import { getLinks, addLink, updateLink, deleteLink } from '@/lib/data-service';
import type { LinkItem } from '@/types';

export async function getLinksAction(): Promise<LinkItem[]> {
  return getLinks();
}

export async function addLinkAction(values: Omit<LinkItem, 'id'>): Promise<LinkItem> {
  const newLink = await addLink(values);
  revalidatePath('/admin/links');
  return newLink;
}

export async function updateLinkAction(values: LinkItem): Promise<LinkItem | null> {
  const updatedLink = await updateLink(values);
  revalidatePath('/admin/links');
  return updatedLink;
}

export async function deleteLinkAction(id: string): Promise<boolean> {
  const success = await deleteLink(id);
  revalidatePath('/admin/links');
  return success;
}
