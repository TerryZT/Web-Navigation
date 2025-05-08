
import type { Category, LinkItem } from '@/types';
import type { IDataService } from './data-service-interface';
import { db } from './firebase-config';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';

const CATEGORIES_COLLECTION = 'categories';
const LINKS_COLLECTION = 'links';

export class FirebaseDataService implements IDataService {
  constructor() {
    if (!db) {
      throw new Error("Firestore is not initialized. Check Firebase configuration.");
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    if (!db) return [];
    const q = query(collection(db, CATEGORIES_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    if (!db) return undefined;
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Category) : undefined;
  }

  async addCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    if (!db) throw new Error("Firestore not available");
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), categoryData);
    return { id: docRef.id, ...categoryData };
  }

  async updateCategory(updatedCategory: Category): Promise<Category | null> {
    if (!db) return null;
    const { id, ...categoryData } = updatedCategory;
    if (!id) return null;
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await updateDoc(docRef, categoryData);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    if (!db) return false;
    const batch = writeBatch(db);
    const categoryDocRef = doc(db, CATEGORIES_COLLECTION, id);
    batch.delete(categoryDocRef);

    // Delete associated links
    const linksQuery = query(collection(db, LINKS_COLLECTION), where("categoryId", "==", id));
    const linksSnapshot = await getDocs(linksQuery);
    linksSnapshot.forEach(linkDoc => {
      batch.delete(doc(db, LINKS_COLLECTION, linkDoc.id));
    });

    await batch.commit();
    return true;
  }

  // Links
  async getLinks(): Promise<LinkItem[]> {
    if (!db) return [];
    const q = query(collection(db, LINKS_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LinkItem));
  }

  async getLinksByCategoryId(categoryId: string): Promise<LinkItem[]> {
    if (!db) return [];
    const q = query(collection(db, LINKS_COLLECTION), where("categoryId", "==", categoryId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LinkItem));
  }

  async getLink(id: string): Promise<LinkItem | undefined> {
    if (!db) return undefined;
    const docRef = doc(db, LINKS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as LinkItem) : undefined;
  }

  async addLink(linkData: Omit<LinkItem, 'id'>): Promise<LinkItem> {
    if (!db) throw new Error("Firestore not available");
    const docRef = await addDoc(collection(db, LINKS_COLLECTION), linkData);
    return { id: docRef.id, ...linkData };
  }

  async updateLink(updatedLink: LinkItem): Promise<LinkItem | null> {
    if (!db) return null;
    const { id, ...linkData } = updatedLink;
    if(!id) return null;
    const docRef = doc(db, LINKS_COLLECTION, id);
    await updateDoc(docRef, linkData);
    return updatedLink;
  }

  async deleteLink(id: string): Promise<boolean> {
    if (!db) return false;
    const docRef = doc(db, LINKS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  }
}
