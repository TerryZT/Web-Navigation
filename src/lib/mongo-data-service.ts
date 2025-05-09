
import type { Category, LinkItem } from '@/types';
import type { IDataService } from './data-service-interface';
import { MongoClient, Db, ObjectId, type Collection } from 'mongodb';

// Collection names
const CATEGORIES_COLLECTION = 'categories';
const LINKS_COLLECTION = 'links';

export class MongoDataService implements IDataService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private dbName: string;

  constructor() {
    console.log("MongoDataService: Constructor called.");
    const uri = process.env.MONGODB_URI;
    const dbNameFromEnv = process.env.MONGODB_DB_NAME;

    if (!uri || !dbNameFromEnv) {
      const errMsg = "MongoDataService CRITICAL Error: MongoDB URI or DB Name not found in environment variables.";
      console.error(errMsg);
      throw new Error(errMsg);
    }
    this.dbName = dbNameFromEnv;
    try {
        this.client = new MongoClient(uri);
        console.log("MongoDataService: MongoClient instance created. Health check will be performed separately.");
    } catch (error: any) {
        console.error("MongoDataService CRITICAL: Failed to initialize MongoClient during constructor.", {
            errorMessage: error.message,
            errorStack: error.stack?.substring(0, 500)
        });
        this.client = null;
        throw error;
    }
  }

  private async connect(): Promise<void> {
    if (!this.client) {
      throw new Error("MongoDataService: MongoDB client not initialized.");
    }
    if (this.db) { // Already connected
        // console.log("MongoDataService: Already connected to DB, skipping connect.");
        return;
    }
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log("MongoDataService: Successfully connected to MongoDB and database selected.");
    } catch (error) {
      console.error("MongoDataService: Failed to connect to MongoDB:", error);
      this.db = null; // Ensure db is null if connection fails
      throw error; // Re-throw to be caught by the health check or service instantiation
    }
  }

  async healthCheck(): Promise<void> {
    if (this.db) { // Already connected and presumably healthy from a previous check/operation
        // console.log("MongoDataService: DB already connected, performing quick ping for health check.");
        try {
            await this.db.command({ ping: 1 });
            console.log("MongoDataService: Health check (ping) successful on existing connection.");
            return;
        } catch (pingError: any) {
            console.warn("MongoDataService: Ping failed on existing connection, attempting to reconnect.", pingError.message);
            this.db = null; // Force reconnect
        }
    }

    console.log("MongoDataService: Attempting to connect for health check...");
    await this.connect(); // This will throw if it fails
    if (!this.db) { // Should not happen if connect() doesn't throw but as a safeguard
        throw new Error("MongoDataService: Health check failed, DB connection not established after connect call.");
    }
    try {
      await this.db.command({ ping: 1 });
      console.log("MongoDataService: Health check (connect and ping) successful.");
    } catch (error: any) {
      console.error("MongoDataService: Health check FAILED after connection.", { errorMessage: error.message, errorStack: error.stack?.substring(0,300) });
      throw new Error(`MongoDataService: Health check failed. Unable to ping database. Original error: ${error.message}`);
    }
  }


  private getCollection<T extends Document>(name: string): Collection<T> {
    if (!this.db) {
      // This situation should ideally be handled by connect failing or a ready state check
      throw new Error("MongoDataService Error: MongoDB database not connected. Cannot get collection.");
    }
    return this.db.collection<T>(name);
  }

  private mapMongoId<T extends { _id?: ObjectId }>(doc: T): Omit<T, '_id'> & { id: string } {
    const { _id, ...rest } = doc;
    return { id: _id ? _id.toHexString() : '', ...rest } as Omit<T, '_id'> & { id: string };
  }
  
  async getCategories(): Promise<Category[]> {
    // console.warn("MongoDataService.getCategories() called. Ensure your 'categories' collection is set up.");
    if (!this.db) await this.connect(); // Ensure connection before operation
    const categoriesCollection = this.getCollection<Category>(CATEGORIES_COLLECTION);
    const mongoCategories = await categoriesCollection.find().toArray();
    return mongoCategories.map(this.mapMongoId);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    // console.warn(`MongoDataService.getCategory(${id}) called.`);
    if (!this.db) await this.connect();
    if (!ObjectId.isValid(id)) return Promise.resolve(undefined);
    const categoriesCollection = this.getCollection<Category>(CATEGORIES_COLLECTION);
    const mongoCategory = await categoriesCollection.findOne({ _id: new ObjectId(id) });
    return mongoCategory ? this.mapMongoId(mongoCategory) : undefined;
  }

  async addCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    // console.warn("MongoDataService.addCategory() called.");
    if (!this.db) await this.connect();
    const categoriesCollection = this.getCollection<Omit<Category, 'id'>>(CATEGORIES_COLLECTION);
    const result = await categoriesCollection.insertOne(categoryData as any); // Cast to any if schema has _id
    return { id: result.insertedId.toHexString(), ...categoryData };
  }

  async updateCategory(updatedCategory: Category): Promise<Category | null> {
    // console.warn(`MongoDataService.updateCategory(${updatedCategory.id}) called.`);
    if (!this.db) await this.connect();
    if (!ObjectId.isValid(updatedCategory.id)) return Promise.resolve(null);
    const { id, ...categoryData } = updatedCategory;
    const categoriesCollection = this.getCollection<Omit<Category, 'id'>>(CATEGORIES_COLLECTION);
    const result = await categoriesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: categoryData }
    );
    return result.modifiedCount > 0 ? updatedCategory : null;
  }

  async deleteCategory(id: string): Promise<boolean> {
    // console.warn(`MongoDataService.deleteCategory(${id}) called.`);
    if (!this.db) await this.connect();
    if (!ObjectId.isValid(id)) return Promise.resolve(false);
    const categoriesCollection = this.getCollection<Category>(CATEGORIES_COLLECTION);
    const linksCollection = this.getCollection<LinkItem>(LINKS_COLLECTION);
    
    const session = this.client?.startSession(); 
    try {
      if (session) {
        console.log("MongoDataService: Starting transaction to delete category and links.");
        await session.withTransaction(async () => {
          await linksCollection.deleteMany({ categoryId: id }, { session });
          await categoriesCollection.deleteOne({ _id: new ObjectId(id) }, { session });
        });
         console.log("MongoDataService: Transaction committed for category deletion.");
      } else { // No transaction support (e.g. standalone instances)
         console.warn("MongoDataService: Transactions not supported, deleting category and links sequentially.");
         await linksCollection.deleteMany({ categoryId: id });
         const result = await categoriesCollection.deleteOne({ _id: new ObjectId(id) });
         return result.deletedCount > 0;
      }
      return true; // If transaction succeeds
    } catch (error) {
      console.error("MongoDataService Error: Error deleting category or its links from MongoDB:", error);
      if (session?.inTransaction()) {
          console.log("MongoDataService: Aborting transaction due to error.");
          await session.abortTransaction();
      }
      return false;
    } finally {
       await session?.endSession();
       // console.log("MongoDataService: Session ended for deleteCategory.");
    }
  }

  async getLinks(): Promise<LinkItem[]> {
    // console.warn("MongoDataService.getLinks() called.");
    if (!this.db) await this.connect();
    const linksCollection = this.getCollection<LinkItem>(LINKS_COLLECTION);
    const mongoLinks = await linksCollection.find().toArray();
    return mongoLinks.map(this.mapMongoId);
  }

  async getLinksByCategoryId(categoryId: string): Promise<LinkItem[]> {
    // console.warn(`MongoDataService.getLinksByCategoryId(${categoryId}) called.`);
    if (!this.db) await this.connect(); // No ObjectId validation for categoryId string (it's just a string from UI)
    const linksCollection = this.getCollection<LinkItem>(LINKS_COLLECTION);
    const mongoLinks = await linksCollection.find({ categoryId: categoryId }).toArray();
    return mongoLinks.map(this.mapMongoId);
  }

  async getLink(id: string): Promise<LinkItem | undefined> {
    // console.warn(`MongoDataService.getLink(${id}) called.`);
    if (!this.db) await this.connect();
    if (!ObjectId.isValid(id)) return Promise.resolve(undefined);
    const linksCollection = this.getCollection<LinkItem>(LINKS_COLLECTION);
    const mongoLink = await linksCollection.findOne({ _id: new ObjectId(id) });
    return mongoLink ? this.mapMongoId(mongoLink) : undefined;
  }

  async addLink(linkData: Omit<LinkItem, 'id'>): Promise<LinkItem> {
    // console.warn("MongoDataService.addLink() called.");
    if (!this.db) await this.connect();
    const linksCollection = this.getCollection<Omit<LinkItem, 'id'>>(LINKS_COLLECTION);
    const result = await linksCollection.insertOne(linkData as any);
    return { id: result.insertedId.toHexString(), ...linkData };
  }

  async updateLink(updatedLink: LinkItem): Promise<LinkItem | null> {
    // console.warn(`MongoDataService.updateLink(${updatedLink.id}) called.`);
    if (!this.db) await this.connect();
    if (!ObjectId.isValid(updatedLink.id)) return Promise.resolve(null);
    const { id, ...linkData } = updatedLink;
    const linksCollection = this.getCollection<Omit<LinkItem, 'id'>>(LINKS_COLLECTION);
    const result = await linksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: linkData }
    );
    return result.modifiedCount > 0 ? updatedLink : null;
  }

  async deleteLink(id: string): Promise<boolean> {
    // console.warn(`MongoDataService.deleteLink(${id}) called.`);
    if (!this.db) await this.connect();
    if (!ObjectId.isValid(id)) return Promise.resolve(false);
    const linksCollection = this.getCollection<LinkItem>(LINKS_COLLECTION);
    const result = await linksCollection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async closeConnection(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log("MongoDataService: MongoDB connection closed.");
    }
  }
}

