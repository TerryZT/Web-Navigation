
import type { Category, LinkItem } from '@/types';
import type { IDataService } from './data-service-interface';
import { MongoClient, Db, ObjectId, type Collection } from 'mongodb';

// Collection names
const CATEGORIES_COLLECTION = 'categories';
const LINKS_COLLECTION = 'links';

export class MongoDataService implements IDataService {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  constructor() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;

    if (!uri || !dbName) {
      throw new Error("MongoDB URI or DB Name not found in environment variables.");
    }

    this.client = new MongoClient(uri);
    this.connect(dbName).catch(error => {
      console.error("Failed to connect to MongoDB during construction:", error);
      // Error will be handled by the main data-service logic which might fall back
    });
  }

  private async connect(dbName: string): Promise<void> {
    if (!this.client) {
      throw new Error("MongoDB client not initialized.");
    }
    if (this.db) { // Already connected
        return;
    }
    try {
      await this.client.connect();
      this.db = this.client.db(dbName);
      console.log("Successfully connected to MongoDB and database selected.");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      this.db = null; // Ensure db is null if connection fails
      throw error; // Re-throw to be caught by the main data-service logic
    }
  }

  private getCollection<T extends Document>(name: string): Collection<T> {
    if (!this.db) {
      // This situation should ideally be handled by connect failing or a ready state check
      throw new Error("MongoDB database not connected. Cannot get collection.");
    }
    return this.db.collection<T>(name);
  }

  private mapMongoId<T extends { _id?: ObjectId }>(doc: T): Omit<T, '_id'> & { id: string } {
    const { _id, ...rest } = doc;
    return { id: _id ? _id.toHexString() : '', ...rest } as Omit<T, '_id'> & { id: string };
  }
  
  async getCategories(): Promise<Category[]> {
    console.warn("MongoDataService.getCategories() called. Ensure your 'categories' collection is set up.");
    if (!this.db) return Promise.resolve([]);
    // const categoriesCollection = this.getCollection<Category>(CATEGORIES_COLLECTION);
    // const mongoCategories = await categoriesCollection.find().toArray();
    // return mongoCategories.map(this.mapMongoId);
    return Promise.resolve([]); // Placeholder
  }

  async getCategory(id: string): Promise<Category | undefined> {
    console.warn(`MongoDataService.getCategory(${id}) called.`);
    if (!this.db || !ObjectId.isValid(id)) return Promise.resolve(undefined);
    // const categoriesCollection = this.getCollection<Category>(CATEGORIES_COLLECTION);
    // const mongoCategory = await categoriesCollection.findOne({ _id: new ObjectId(id) });
    // return mongoCategory ? this.mapMongoId(mongoCategory) : undefined;
    return Promise.resolve(undefined); // Placeholder
  }

  async addCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    console.warn("MongoDataService.addCategory() called.");
     if (!this.db) throw new Error("MongoDB not connected");
    // const categoriesCollection = this.getCollection<Omit<Category, 'id'>>(CATEGORIES_COLLECTION);
    // const result = await categoriesCollection.insertOne(categoryData);
    // return { id: result.insertedId.toHexString(), ...categoryData };
     const newCategory: Category = { id: new ObjectId().toHexString(), ...categoryData };
    return Promise.resolve(newCategory);
  }

  async updateCategory(updatedCategory: Category): Promise<Category | null> {
    console.warn(`MongoDataService.updateCategory(${updatedCategory.id}) called.`);
    if (!this.db || !ObjectId.isValid(updatedCategory.id)) return Promise.resolve(null);
    // const { id, ...categoryData } = updatedCategory;
    // const categoriesCollection = this.getCollection<Omit<Category, 'id'>>(CATEGORIES_COLLECTION);
    // const result = await categoriesCollection.updateOne(
    //   { _id: new ObjectId(id) },
    //   { $set: categoryData }
    // );
    // return result.modifiedCount > 0 ? updatedCategory : null;
    return Promise.resolve(updatedCategory); // Placeholder
  }

  async deleteCategory(id: string): Promise<boolean> {
    console.warn(`MongoDataService.deleteCategory(${id}) called.`);
    if (!this.db || !ObjectId.isValid(id)) return Promise.resolve(false);
    // const categoriesCollection = this.getCollection<Category>(CATEGORIES_COLLECTION);
    // const linksCollection = this.getCollection<LinkItem>(LINKS_COLLECTION);
    
    // const session = this.client?.startSession(); // Requires replica set for transactions
    // try {
    //   if (session) await session.withTransaction(async () => {
    //     await linksCollection.deleteMany({ categoryId: id }, { session });
    //     await categoriesCollection.deleteOne({ _id: new ObjectId(id) }, { session });
    //   });
    //   else { // No transaction support
    //      await linksCollection.deleteMany({ categoryId: id });
    //      const result = await categoriesCollection.deleteOne({ _id: new ObjectId(id) });
    //      return result.deletedCount > 0;
    //   }
    //   return true;
    // } catch (error) {
    //   console.error("Error deleting category or its links from MongoDB:", error);
    //   return false;
    // } finally {
    //    session?.endSession();
    // }
    return Promise.resolve(true); // Placeholder
  }

  async getLinks(): Promise<LinkItem[]> {
    console.warn("MongoDataService.getLinks() called.");
    if (!this.db) return Promise.resolve([]);
    // const linksCollection = this.getCollection<LinkItem>(LINKS_COLLECTION);
    // const mongoLinks = await linksCollection.find().toArray();
    // return mongoLinks.map(this.mapMongoId);
    return Promise.resolve([]); // Placeholder
  }

  async getLinksByCategoryId(categoryId: string): Promise<LinkItem[]> {
    console.warn(`MongoDataService.getLinksByCategoryId(${categoryId}) called.`);
     if (!this.db) return Promise.resolve([]); // No ObjectId validation for categoryId string
    // const linksCollection = this.getCollection<LinkItem>(LINKS_COLLECTION);
    // const mongoLinks = await linksCollection.find({ categoryId: categoryId }).toArray();
    // return mongoLinks.map(this.mapMongoId);
    return Promise.resolve([]); // Placeholder
  }

  async getLink(id: string): Promise<LinkItem | undefined> {
    console.warn(`MongoDataService.getLink(${id}) called.`);
    if (!this.db || !ObjectId.isValid(id)) return Promise.resolve(undefined);
    // const linksCollection = this.getCollection<LinkItem>(LINKS_COLLECTION);
    // const mongoLink = await linksCollection.findOne({ _id: new ObjectId(id) });
    // return mongoLink ? this.mapMongoId(mongoLink) : undefined;
    return Promise.resolve(undefined); // Placeholder
  }

  async addLink(linkData: Omit<LinkItem, 'id'>): Promise<LinkItem> {
    console.warn("MongoDataService.addLink() called.");
    if (!this.db) throw new Error("MongoDB not connected");
    // const linksCollection = this.getCollection<Omit<LinkItem, 'id'>>(LINKS_COLLECTION);
    // const result = await linksCollection.insertOne(linkData);
    // return { id: result.insertedId.toHexString(), ...linkData };
    const newLink: LinkItem = { id: new ObjectId().toHexString(), ...linkData };
    return Promise.resolve(newLink);
  }

  async updateLink(updatedLink: LinkItem): Promise<LinkItem | null> {
    console.warn(`MongoDataService.updateLink(${updatedLink.id}) called.`);
    if (!this.db || !ObjectId.isValid(updatedLink.id)) return Promise.resolve(null);
    // const { id, ...linkData } = updatedLink;
    // const linksCollection = this.getCollection<Omit<LinkItem, 'id'>>(LINKS_COLLECTION);
    // const result = await linksCollection.updateOne(
    //   { _id: new ObjectId(id) },
    //   { $set: linkData }
    // );
    // return result.modifiedCount > 0 ? updatedLink : null;
    return Promise.resolve(updatedLink); // Placeholder
  }

  async deleteLink(id: string): Promise<boolean> {
    console.warn(`MongoDataService.deleteLink(${id}) called.`);
    if (!this.db || !ObjectId.isValid(id)) return Promise.resolve(false);
    // const linksCollection = this.getCollection<LinkItem>(LINKS_COLLECTION);
    // const result = await linksCollection.deleteOne({ _id: new ObjectId(id) });
    // return result.deletedCount > 0;
    return Promise.resolve(true); // Placeholder
  }

  async closeConnection(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log("MongoDB connection closed.");
    }
  }
}
