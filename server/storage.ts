import { 
  type User, 
  type InsertUser, 
  type Product,
  type InsertProduct,
  type Contact,
  type InsertContact,
  type Subscriber,
  type InsertSubscriber
} from "@shared/schema";

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
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private contacts: Map<number, Contact>;
  private subscribers: Map<number, Subscriber>;
  
  private currentUserId: number;
  private currentProductId: number;
  private currentContactId: number;
  private currentSubscriberId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.contacts = new Map();
    this.subscribers = new Map();
    
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentContactId = 1;
    this.currentSubscriberId = 1;
    
    // Create admin user by default
    this.createUser({
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      isAdmin: true,
    });
    
    // Add some sample products
    this.seedProducts();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const timestamp = new Date();
    const newProduct: Product = { ...product, id, createdAt: timestamp };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    
    if (!existingProduct) {
      return undefined;
    }
    
    const updatedProduct: Product = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Contact methods
  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const timestamp = new Date();
    const newContact: Contact = { ...contact, id, createdAt: timestamp };
    this.contacts.set(id, newContact);
    return newContact;
  }
  
  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }
  
  // Subscriber methods
  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    // Check if email already exists
    const existingSubscriber = Array.from(this.subscribers.values()).find(
      (sub) => sub.email === subscriber.email
    );
    
    if (existingSubscriber) {
      return existingSubscriber;
    }
    
    const id = this.currentSubscriberId++;
    const timestamp = new Date();
    const newSubscriber: Subscriber = { ...subscriber, id, createdAt: timestamp };
    this.subscribers.set(id, newSubscriber);
    return newSubscriber;
  }
  
  async getAllSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values());
  }
  
  // Seed some initial products
  private seedProducts() {
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
    
    sampleProducts.forEach(product => {
      this.createProduct(product);
    });
  }
}

export const storage = new MemStorage();
