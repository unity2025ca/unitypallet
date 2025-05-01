import { 
  type User, 
  type InsertUser, 
  type Product,
  type InsertProduct,
  type Contact,
  type InsertContact,
  type Subscriber,
  type InsertSubscriber,
  type Setting,
  type InsertSetting,
  type ProductImage,
  type InsertProductImage,
  type Faq,
  type InsertFaq,
  type Appointment,
  type InsertAppointment,
  type VisitorStat,
  type InsertVisitorStat,
  type Notification,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type InsertNotification,
  users,
  products,
  contacts,
  subscribers,
  settings,
  productImages,
  faqs,
  appointments,
  visitorStats,
  notifications,
  orders,
  orderItems
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, and, desc, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

// Define the storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Product Images methods
  getProductImages(productId: number): Promise<ProductImage[]>;
  getProductMainImage(productId: number): Promise<ProductImage | undefined>;
  getProductImageById(imageId: number): Promise<ProductImage | undefined>;
  addProductImage(productImage: InsertProductImage): Promise<ProductImage>;
  setMainProductImage(productId: number, imageId: number): Promise<boolean>;
  deleteProductImage(imageId: number): Promise<boolean>;
  
  // Contact methods
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
  
  // Subscriber methods
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getAllSubscribers(): Promise<Subscriber[]>;
  updateSubscriber(id: number, data: Partial<InsertSubscriber>): Promise<Subscriber | undefined>;
  
  // Settings methods
  getSetting(key: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  getSettingsByCategory(category: string): Promise<Setting[]>;
  updateSetting(key: string, value: string): Promise<Setting | undefined>;
  createSetting(setting: InsertSetting): Promise<Setting>;
  
  // FAQ methods
  getAllFaqs(): Promise<Faq[]>;
  getFaqById(id: number): Promise<Faq | undefined>;
  createFaq(faq: InsertFaq): Promise<Faq>;
  updateFaq(id: number, faq: Partial<InsertFaq>): Promise<Faq | undefined>;
  deleteFaq(id: number): Promise<boolean>;
  
  // Appointment methods
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAllAppointments(): Promise<Appointment[]>;
  getAppointmentById(id: number): Promise<Appointment | undefined>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  
  // Visitor stats methods
  addVisitorStat(stat: InsertVisitorStat): Promise<VisitorStat>;
  getVisitorStatsByDate(startDate: Date, endDate: Date): Promise<VisitorStat[]>;
  getVisitorStatsCount(): Promise<number>;
  getPageViewsByUrl(): Promise<{ url: string; count: number }[]>;
  getVisitorStatsByDateRange(days: number): Promise<{ date: string; count: number }[]>;
  getVisitorStatsByCountry(): Promise<{ country: string; count: number }[]>;
  getVisitorStatsByDevice(): Promise<{ device: string; count: number }[]>;
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  getUnreadNotificationsByUserId(userId: number): Promise<Notification[]>;  
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Order methods
  createOrder(orderData: InsertOrder): Promise<Order>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByCustomerId(userId: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  updateOrderPaymentStatus(id: number, paymentStatus: string): Promise<Order | undefined>;
  
  // Order Item methods
  createOrderItem(orderItemData: InsertOrderItem): Promise<OrderItem>;
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;
  
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
    // Set the default roleType based on isAdmin field for backwards compatibility
    if (insertUser.isAdmin && !insertUser.roleType) {
      insertUser.roleType = "admin";
    } else if (!insertUser.roleType) {
      insertUser.roleType = "user";
    }
    
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(asc(users.id));
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    // If password is provided, it will be hashed in the authentication layer
    const result = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    
    return result.length > 0;
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(asc(products.displayOrder), asc(products.id));
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    const validCategory = category as "electronics" | "home" | "toys" | "mixed" | "other";
    return db
      .select()
      .from(products)
      .where(eq(products.category, validCategory))
      .orderBy(asc(products.displayOrder), asc(products.id));
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
  
  // Product Images methods
  async getProductImages(productId: number): Promise<ProductImage[]> {
    return db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.displayOrder), asc(productImages.id));
  }
  
  async getProductMainImage(productId: number): Promise<ProductImage | undefined> {
    const mainImage = await db
      .select()
      .from(productImages)
      .where(and(
        eq(productImages.productId, productId),
        eq(productImages.isMain, true)
      ));
    
    if (mainImage.length > 0) {
      return mainImage[0];
    }
    
    // If no main image is set, return the first image
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.displayOrder), asc(productImages.id))
      .limit(1);
    
    return images[0];
  }
  
  async getProductImageById(imageId: number): Promise<ProductImage | undefined> {
    const result = await db
      .select()
      .from(productImages)
      .where(eq(productImages.id, imageId));
    
    return result[0];
  }
  
  async addProductImage(productImage: InsertProductImage): Promise<ProductImage> {
    // If this is the first image for the product, make it the main image
    const existingImages = await this.getProductImages(productImage.productId);
    if (existingImages.length === 0) {
      productImage.isMain = true;
    }
    
    const result = await db.insert(productImages).values(productImage).returning();
    return result[0];
  }
  
  async setMainProductImage(productId: number, imageId: number): Promise<boolean> {
    // First, set all product images to not be main
    await db
      .update(productImages)
      .set({ isMain: false })
      .where(eq(productImages.productId, productId));
    
    // Then set the selected image as main
    const result = await db
      .update(productImages)
      .set({ isMain: true })
      .where(and(
        eq(productImages.id, imageId),
        eq(productImages.productId, productId)
      ))
      .returning();
    
    // Also update the main product imageUrl for backwards compatibility
    if (result.length > 0) {
      const mainImageUrl = result[0].imageUrl;
      await db
        .update(products)
        .set({ imageUrl: mainImageUrl })
        .where(eq(products.id, productId));
      
      return true;
    }
    
    return false;
  }
  
  async deleteProductImage(imageId: number): Promise<boolean> {
    // Get the image details before deleting
    const imageToDelete = await db
      .select()
      .from(productImages)
      .where(eq(productImages.id, imageId));
    
    if (imageToDelete.length === 0) {
      return false;
    }
    
    const { productId, isMain } = imageToDelete[0];
    
    // Delete the image
    const result = await db
      .delete(productImages)
      .where(eq(productImages.id, imageId))
      .returning({ id: productImages.id });
    
    // If the deleted image was the main image, set another image as main
    if (isMain) {
      const remainingImages = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.displayOrder), asc(productImages.id))
        .limit(1);
      
      if (remainingImages.length > 0) {
        await this.setMainProductImage(productId, remainingImages[0].id);
      }
    }
    
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
      // Handle case where only phone is provided (email might be empty)
      if (subscriber.phone && (!subscriber.email || subscriber.email.trim() === '')) {
        // Check if this phone number already exists
        const existingWithPhone = await db
          .select()
          .from(subscribers)
          .where(eq(subscribers.phone, subscriber.phone));
        
        if (existingWithPhone.length > 0) {
          // Phone number already exists, return the existing subscriber
          return existingWithPhone[0];
        }
        
        // No existing subscriber with this phone, create a new one with a placeholder email
        const timestamp = new Date().getTime();
        subscriber.email = `phone_subscriber_${timestamp}@placeholder.com`;
      } else if (subscriber.email && subscriber.phone) {
        // Both email and phone provided - check for existing subscriber by email
        const existingWithEmail = await db
          .select()
          .from(subscribers)
          .where(eq(subscribers.email, subscriber.email));
        
        if (existingWithEmail.length > 0) {
          // Subscriber with this email exists, update their phone if needed
          const existing = existingWithEmail[0];
          if (!existing.phone) {
            await this.updateSubscriber(existing.id, { phone: subscriber.phone });
            return { ...existing, phone: subscriber.phone };
          }
          return existing;
        }
        
        // Check for subscriber with this phone number
        const existingWithPhone = await db
          .select()
          .from(subscribers)
          .where(eq(subscribers.phone, subscriber.phone));
        
        if (existingWithPhone.length > 0) {
          // Subscriber with this phone exists, update their email if it's a placeholder
          const existing = existingWithPhone[0];
          if (existing.email && existing.email.includes('phone_subscriber_')) {
            await this.updateSubscriber(existing.id, { email: subscriber.email });
            return { ...existing, email: subscriber.email };
          }
          return existing;
        }
      } else if (subscriber.email) {
        // Only email provided, check if it exists
        const existingWithEmail = await db
          .select()
          .from(subscribers)
          .where(eq(subscribers.email, subscriber.email));
        
        if (existingWithEmail.length > 0) {
          return existingWithEmail[0];
        }
      }
      
      // Create new subscriber
      const result = await db.insert(subscribers).values(subscriber).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating subscriber:', error);
      // If all else fails, try to find by email as a fallback
      if (subscriber.email) {
        const existingSubscriber = await db
          .select()
          .from(subscribers)
          .where(eq(subscribers.email, subscriber.email));
          
        if (existingSubscriber.length > 0) {
          return existingSubscriber[0];
        }
      }
      
      // Re-throw the error if we couldn't recover
      throw error;
    }
  }
  
  async getAllSubscribers(): Promise<Subscriber[]> {
    return db.select().from(subscribers).orderBy(asc(subscribers.id));
  }
  
  async updateSubscriber(id: number, data: Partial<InsertSubscriber>): Promise<Subscriber | undefined> {
    const result = await db
      .update(subscribers)
      .set(data)
      .where(eq(subscribers.id, id))
      .returning();
    
    return result[0];
  }
  
  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    const result = await db.select().from(settings).where(eq(settings.key, key));
    return result[0];
  }
  
  async getAllSettings(): Promise<Setting[]> {
    return db.select().from(settings).orderBy(asc(settings.id));
  }
  
  async getSettingsByCategory(category: string): Promise<Setting[]> {
    const result = await db.select().from(settings).where(eq(settings.category, category));
    return result;
  }
  
  async updateSetting(key: string, value: string): Promise<Setting | undefined> {
    const result = await db
      .update(settings)
      .set({ 
        value, 
        updatedAt: new Date() 
      })
      .where(eq(settings.key, key))
      .returning();
    
    return result[0];
  }
  
  async createSetting(setting: InsertSetting): Promise<Setting> {
    const result = await db.insert(settings).values(setting).returning();
    return result[0];
  }
  
  // FAQ methods
  async getAllFaqs(): Promise<Faq[]> {
    return db.select().from(faqs).orderBy(asc(faqs.displayOrder), asc(faqs.id));
  }
  
  async getFaqById(id: number): Promise<Faq | undefined> {
    const result = await db.select().from(faqs).where(eq(faqs.id, id));
    return result[0];
  }
  
  async createFaq(faq: InsertFaq): Promise<Faq> {
    const result = await db.insert(faqs).values(faq).returning();
    return result[0];
  }
  
  async updateFaq(id: number, faqData: Partial<InsertFaq>): Promise<Faq | undefined> {
    const result = await db
      .update(faqs)
      .set({
        ...faqData,
        updatedAt: new Date()
      })
      .where(eq(faqs.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteFaq(id: number): Promise<boolean> {
    const result = await db
      .delete(faqs)
      .where(eq(faqs.id, id))
      .returning({ id: faqs.id });
    
    return result.length > 0;
  }
  
  // Appointment methods
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(appointment).returning();
    return result[0];
  }
  
  async getAllAppointments(): Promise<Appointment[]> {
    return db.select().from(appointments).orderBy(desc(appointments.createdAt));
  }
  
  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id));
    return result[0];
  }
  
  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const result = await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db
      .delete(appointments)
      .where(eq(appointments.id, id))
      .returning({ id: appointments.id });
    
    return result.length > 0;
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
    
    // Check if publisher user exists, if not create one
    const publisherExists = await this.getUserByUsername("publisher");
    if (!publisherExists) {
      await this.createUser({
        username: "publisher",
        password: "publisher123", // In a real app, this would be hashed
        isAdmin: false, // Publishers are not admins
        roleType: "publisher" // Set publisher role explicitly
      });
    }
    
    // Check if products exist, if not create sample products
    const productsExist = await this.getAllProducts();
    if (productsExist.length === 0) {
      await this.seedProducts();
    }
    
    // Check if settings exist, if not create default settings
    const settings = await this.getAllSettings();
    if (settings.length === 0) {
      await this.seedSettings();
    }
  }
  
  // Seed default settings
  private async seedSettings() {
    const defaultSettings: InsertSetting[] = [
      // Appearance settings
      {
        key: "site_logo",
        value: "https://images.unsplash.com/photo-1586892477838-2b96e85e0f96?w=200",
        category: "appearance",
        label: "شعار الموقع",
        type: "image"
      },
      {
        key: "primary_color",
        value: "#16a34a",
        category: "appearance",
        label: "اللون الرئيسي",
        type: "color"
      },
      {
        key: "secondary_color",
        value: "#0f766e",
        category: "appearance",
        label: "اللون الثانوي",
        type: "color"
      },
      {
        key: "font_family",
        value: "Tajawal, sans-serif",
        category: "appearance",
        label: "نوع الخط",
        type: "select"
      },
      
      // Content settings
      {
        key: "site_name",
        value: "وحدة",
        category: "content",
        label: "اسم الموقع",
        type: "text"
      },
      {
        key: "site_description",
        value: "موقع متخصص في بيع بالات أمازون المرتجعة",
        category: "content",
        label: "وصف الموقع",
        type: "textarea"
      },
      {
        key: "hero_title",
        value: "أفضل بالات أمازون المرتجعة",
        category: "content",
        label: "عنوان القسم الرئيسي",
        type: "text"
      },
      {
        key: "hero_subtitle",
        value: "اكتشف مجموعة متنوعة من المنتجات بأسعار مميزة",
        category: "content",
        label: "العنوان الفرعي للقسم الرئيسي",
        type: "text"
      },
      
      // Contact settings
      {
        key: "contact_email",
        value: "info@unity-pallets.com",
        category: "contact",
        label: "البريد الإلكتروني للتواصل",
        type: "email"
      },
      {
        key: "contact_phone",
        value: "+966-5XXXXXXXX",
        category: "contact",
        label: "رقم الهاتف للتواصل",
        type: "tel"
      },
      {
        key: "instagram",
        value: "unity.pallets",
        category: "social",
        label: "حساب انستغرام",
        type: "text"
      },
      {
        key: "twitter",
        value: "unitypallets",
        category: "social",
        label: "حساب تويتر",
        type: "text"
      }
    ];
    
    for (const setting of defaultSettings) {
      await this.createSetting(setting);
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
  // Visitor Stats Methods
  async addVisitorStat(stat: InsertVisitorStat): Promise<VisitorStat> {
    const result = await db.insert(visitorStats).values(stat).returning();
    return result[0];
  }

  async getVisitorStatsByDate(startDate: Date, endDate: Date): Promise<VisitorStat[]> {
    return db
      .select()
      .from(visitorStats)
      .where(
        and(
          // Using >= for start date and < for end date to get inclusive start, exclusive end
          sql`${visitorStats.visitDate} >= ${startDate.toISOString()}`,
          sql`${visitorStats.visitDate} < ${endDate.toISOString()}`
        )
      )
      .orderBy(desc(visitorStats.visitDate));
  }

  async getVisitorStatsCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(visitorStats);
    return result[0]?.count || 0;
  }

  async getPageViewsByUrl(): Promise<{ url: string; count: number }[]> {
    const result = await db
      .select({
        url: visitorStats.pageUrl,
        count: sql<number>`count(*)`
      })
      .from(visitorStats)
      .groupBy(visitorStats.pageUrl)
      .orderBy(desc(sql<number>`count(*)`));
    
    return result;
  }

  async getVisitorStatsByDateRange(days: number): Promise<{ date: string; count: number }[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const result = await db
      .select({
        date: sql<string>`to_char(${visitorStats.visitDate}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)`
      })
      .from(visitorStats)
      .where(
        and(
          sql`${visitorStats.visitDate} >= ${startDate.toISOString()}`,
          sql`${visitorStats.visitDate} <= ${endDate.toISOString()}`
        )
      )
      .groupBy(sql`to_char(${visitorStats.visitDate}, 'YYYY-MM-DD')`)
      .orderBy(asc(sql`to_char(${visitorStats.visitDate}, 'YYYY-MM-DD')`));
    
    return result;
  }

  async getVisitorStatsByCountry(): Promise<{ country: string; count: number }[]> {
    const result = await db
      .select({
        country: visitorStats.countryCode,
        count: sql<number>`count(*)`
      })
      .from(visitorStats)
      .where(sql`${visitorStats.countryCode} IS NOT NULL`)
      .groupBy(visitorStats.countryCode)
      .orderBy(desc(sql<number>`count(*)`));
    
    // Filter and transform to ensure country is never null
    return result
      .filter(item => item.country !== null)
      .map(item => ({
        country: (item.country || 'Unknown') as string,
        count: item.count
      }));
  }

  async getVisitorStatsByDevice(): Promise<{ device: string; count: number }[]> {
    const result = await db
      .select({
        device: visitorStats.deviceType,
        count: sql<number>`count(*)`
      })
      .from(visitorStats)
      .where(sql`${visitorStats.deviceType} IS NOT NULL`)
      .groupBy(visitorStats.deviceType)
      .orderBy(desc(sql<number>`count(*)`));
    
    // Filter and transform to ensure device is never null
    return result
      .filter(item => item.device !== null)
      .map(item => ({
        device: (item.device || 'Unknown') as string,
        count: item.count
      }));
  }

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.created_at));
  }

  async getUnreadNotificationsByUserId(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
      .orderBy(desc(notifications.created_at));
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    
    return result.length > 0;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
      .returning();
    
    return result.length > 0;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(eq(notifications.id, id))
      .returning({ id: notifications.id });
    
    return result.length > 0;
  }

  // Order methods
  async createOrder(orderData: InsertOrder): Promise<Order> {
    try {
      const [order] = await db.insert(orders)
        .values(orderData)
        .returning();
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    try {
      const [order] = await db.select()
        .from(orders)
        .where(eq(orders.id, id));
      return order;
    } catch (error) {
      console.error('Error getting order by ID:', error);
      throw error;
    }
  }

  async getOrdersByCustomerId(userId: number): Promise<Order[]> {
    try {
      return await db.select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error('Error getting orders by customer ID:', error);
      throw error;
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    try {
      const validStatus = status as "pending" | "processing" | "completed" | "cancelled" | "refunded";
      const [updatedOrder] = await db.update(orders)
        .set({ status: validStatus })
        .where(eq(orders.id, id))
        .returning();
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async updateOrderPaymentStatus(id: number, paymentStatus: string): Promise<Order | undefined> {
    try {
      const validPaymentStatus = paymentStatus as "pending" | "paid" | "failed" | "refunded";
      const [updatedOrder] = await db.update(orders)
        .set({ paymentStatus: validPaymentStatus })
        .where(eq(orders.id, id))
        .returning();
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order payment status:', error);
      throw error;
    }
  }

  // Order Item methods
  async createOrderItem(orderItemData: InsertOrderItem): Promise<OrderItem> {
    try {
      const [orderItem] = await db.insert(orderItems)
        .values(orderItemData)
        .returning();
      return orderItem;
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  }

  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    try {
      return await db.select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));
    } catch (error) {
      console.error('Error getting order items by order ID:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
