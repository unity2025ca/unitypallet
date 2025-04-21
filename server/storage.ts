import { 
  type User, 
  type InsertUser, 
  type Product,
  type InsertProduct,
  type Contact,
  type InsertContact,
  type Subscriber,
  type InsertSubscriber,
  users,
  products,
  contacts,
  subscribers
} from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

// Define the storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Contact methods
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
  
  // Subscriber methods
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getAllSubscribers(): Promise<Subscriber[]>;
  
  // Session store
  sessionStore: any; // Simplify type for session store
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    
    // Initialize the database with sample data if needed
    this.initializeDatabase();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(asc(products.id));
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    // Handle category filtering using a safer approach with runtime type checking
    const result = await db.select().from(products);
    return result.filter(p => p.category === category);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }
  
  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    
    return result.length > 0;
  }
  
  // Contact methods
  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await db.insert(contacts).values(contact).returning();
    return result[0];
  }
  
  async getAllContacts(): Promise<Contact[]> {
    return db.select().from(contacts).orderBy(asc(contacts.id));
  }
  
  // Subscriber methods
  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    try {
      const result = await db.insert(subscribers).values(subscriber).returning();
      return result[0];
    } catch (error) {
      // If insert fails due to unique constraint, return the existing subscriber
      const existingSubscriber = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, subscriber.email));
        
      return existingSubscriber[0];
    }
  }
  
  async getAllSubscribers(): Promise<Subscriber[]> {
    return db.select().from(subscribers).orderBy(asc(subscribers.id));
  }
  
  // Initialize the database with sample data if it's empty
  private async initializeDatabase() {
    // Check if admin user exists, if not create one
    const adminExists = await this.getUserByUsername("admin");
    if (!adminExists) {
      await this.createUser({
        username: "admin",
        password: "admin123", // In a real app, this would be hashed
        isAdmin: true,
      });
    }
    
    // Check if products exist, if not create sample products
    const productsExist = await this.getAllProducts();
    if (productsExist.length === 0) {
      await this.seedProducts();
    }
  }
  
  // Seed sample products
  private async seedProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        title: "Electronics Pallet",
        titleAr: "بالة إلكترونيات متنوعة",
        description: "Contains headphones, chargers, and various electronic accessories.",
        descriptionAr: "تحتوي على سماعات، أجهزة شحن، وإكسسوارات إلكترونية متنوعة.",
        category: "electronics",
        status: "available",
        price: 2500,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      },
      {
        title: "Home Appliances Pallet",
        titleAr: "بالة أدوات منزلية",
        description: "Contains kitchen tools, home accessories, and cleaning supplies.",
        descriptionAr: "تحتوي على أدوات مطبخ، إكسسوارات منزلية، وأدوات تنظيف.",
        category: "home",
        status: "limited",
        price: 1800,
        imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c",
      },
      {
        title: "Toys and Gifts Pallet",
        titleAr: "بالة ألعاب وهدايا",
        description: "Contains children's toys, educational toys, and electronic games.",
        descriptionAr: "تحتوي على ألعاب أطفال، ألعاب تعليمية، وألعاب إلكترونية.",
        category: "toys",
        status: "available",
        price: 3200,
        imageUrl: "https://images.unsplash.com/photo-1637159125357-4ca13ef3316b",
      },
      {
        title: "Mixed Accessories Pallet",
        titleAr: "بالة إكسسوارات متنوعة",
        description: "Contains phone accessories, bags, and various merchandise.",
        descriptionAr: "تحتوي على إكسسوارات للهواتف، حقائب، وسلع متنوعة.",
        category: "mixed",
        status: "soldout",
        price: 2000,
        imageUrl: "https://images.unsplash.com/photo-1545127398-14699f92334b",
      }
    ];
    
    for (const product of sampleProducts) {
      await this.createProduct(product);
    }
  }
}

export const storage = new DatabaseStorage();
