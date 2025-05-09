'use server';

import { revalidatePath } from 'next/cache';
import { getLinks, addLink, updateLink, deleteLink } from '@/lib/data-service';
import type { LinkItem } from '@/types';

export async function getLinksAction(): Promise<LinkItem[]> {
  try {
    console.log("getLinksAction: Fetching links...");
    const links = await getLinks();
    console.log(`getLinksAction: Successfully fetched ${links.length} links.`);
    return links;
  } catch (error: any) {
    console.error(`getLinksAction: Failed to fetch links.`, {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500)
    });
    throw error;
  }
}

export async function addLinkAction(values: Omit<LinkItem, 'id'>): Promise<LinkItem> {
  try {
    console.log(`addLinkAction: Attempting to add link: ${JSON.stringify(values).substring(0,100)}`);
    const newLink = await addLink(values);
    console.log(`addLinkAction: Successfully added link, ID: ${newLink.id}`);
    revalidatePath('/admin/links');
    revalidatePath('/'); // Revalidate public page as well
    return newLink;
  } catch (error: any) {
    console.error(`addLinkAction: Failed to add link. Values: ${JSON.stringify(values).substring(0,100)}`, {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500)
    });
    throw error;
  }
}

export async function updateLinkAction(values: LinkItem): Promise<LinkItem | null> {
  try {
    console.log(`updateLinkAction: Attempting to update link ID ${values.id}: ${JSON.stringify(values).substring(0,100)}`);
    const updatedLink = await updateLink(values);
    if (updatedLink) {
      console.log(`updateLinkAction: Successfully updated link ID: ${updatedLink.id}`);
    } else {
      console.warn(`updateLinkAction: Link ID ${values.id} not found for update.`);
    }
    revalidatePath('/admin/links');
    revalidatePath('/');
    return updatedLink;
  } catch (error: any) {
    console.error(`updateLinkAction: Failed to update link ID ${values.id}. Values: ${JSON.stringify(values).substring(0,100)}`, {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500)
    });
    throw error;
  }
}

export async function deleteLinkAction(id: string): Promise<boolean> {
  try {
    console.log(`deleteLinkAction: Attempting to delete link ID: ${id}`);
    const success = await deleteLink(id);
    console.log(`deleteLinkAction: Deletion attempt for link ID ${id} result: ${success}`);
    revalidatePath('/admin/links');
    revalidatePath('/');
    return success;
  } catch (error: any) {
    console.error(`deleteLinkAction: Failed to delete link ID: ${id}`, {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500)
    });
    throw error;
  }
}
