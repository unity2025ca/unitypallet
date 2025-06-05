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
  type ShippingZone,
  type InsertShippingZone,
  type ShippingRate,
  type InsertShippingRate,
  type Location,
  type InsertLocation,
  type Category,
  type InsertCategory,
  type AllowedCity,
  type InsertAllowedCity,
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
  orderItems,
  shippingZones,
  shippingRates,
  locations,
  categories,
  allowedCities
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, and, desc, sql, lte, gte, or } from "drizzle-orm";
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
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
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
  getContactById(id: number): Promise<Contact | undefined>;
  updateContactReadStatus(id: number, isRead: boolean): Promise<Contact>;
  deleteContact(id: number): Promise<boolean>;
  
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
  updateOrderPaymentIntent(id: number, paymentIntentId: string): Promise<Order | undefined>;
  
  // Order Item methods
  createOrderItem(orderItemData: InsertOrderItem): Promise<OrderItem>;
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;
  
  // Shipping Zone methods
  createShippingZone(zoneData: InsertShippingZone): Promise<ShippingZone>;
  getShippingZoneById(id: number): Promise<ShippingZone | undefined>;
  getAllShippingZones(): Promise<ShippingZone[]>;
  updateShippingZone(id: number, zoneData: Partial<InsertShippingZone>): Promise<ShippingZone | undefined>;
  deleteShippingZone(id: number): Promise<boolean>;
  
  // Shipping Rate methods
  createShippingRate(rateData: InsertShippingRate): Promise<ShippingRate>;
  getShippingRateById(id: number): Promise<ShippingRate | undefined>;
  getShippingRatesByZoneId(zoneId: number): Promise<ShippingRate[]>;
  getAllShippingRates(): Promise<ShippingRate[]>;
  updateShippingRate(id: number, rateData: Partial<InsertShippingRate>): Promise<ShippingRate | undefined>;
  deleteShippingRate(id: number): Promise<boolean>;
  
  // Location methods
  createLocation(locationData: InsertLocation): Promise<Location>;
  getLocationById(id: number): Promise<Location | undefined>;
  getAllLocations(): Promise<Location[]>;
  getWarehouseLocations(): Promise<Location[]>;
  updateLocation(id: number, locationData: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;
  
  // Allowed Cities methods
  createAllowedCity(cityData: InsertAllowedCity): Promise<AllowedCity>;
  getAllowedCityById(id: number): Promise<AllowedCity | undefined>;
  getAllAllowedCities(): Promise<AllowedCity[]>;
  getAllActiveAllowedCities(): Promise<AllowedCity[]>;
  updateAllowedCity(id: number, cityData: Partial<InsertAllowedCity>): Promise<AllowedCity | undefined>;
  deleteAllowedCity(id: number): Promise<boolean>;
  isCityAllowed(cityName: string): Promise<boolean>;
  
  // Shipping calculation
  calculateShippingCost(fromLocationId: number, toLocationId: number, weight?: number): Promise<number>;
  calculateShippingCostByCoordinates(fromLat: number, fromLng: number, toLat: number, toLng: number, zoneId?: number, weight?: number): Promise<number>;
  
  // Backup methods for data export
  getAllProductImages(): Promise<ProductImage[]>;
  getAllOrderItems(): Promise<OrderItem[]>;
  getAllOrders(): Promise<Order[]>;
  getAllNotifications(): Promise<Notification[]>;
  
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
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.displayOrder), asc(categories.id));
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug));
    return result[0];
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }
  
  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db
      .update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });
    
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
  
  async getContactById(id: number): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(eq(contacts.id, id));
    return result[0];
  }
  
  async updateContactReadStatus(id: number, isRead: boolean): Promise<Contact> {
    const result = await db
      .update(contacts)
      .set({ isRead })
      .where(eq(contacts.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteContact(id: number): Promise<boolean> {
    const result = await db
      .delete(contacts)
      .where(eq(contacts.id, id))
      .returning({ id: contacts.id });
    
    return result.length > 0;
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
  async createOrder(orderData: any): Promise<Order> {
    try {
      // We're avoiding the ORM and using direct SQL to avoid the shipping_province error
      // Using only the columns we confirmed exist in the actual database
      const result = await pool.query(
        `INSERT INTO orders (
          user_id, 
          total, 
          status, 
          payment_status, 
          shipping_address, 
          shipping_city, 
          shipping_postal_code, 
          shipping_country,
          notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          orderData.userId,
          orderData.total,
          'pending',
          'pending',
          orderData.shippingAddress || '',
          orderData.shippingCity || '',
          orderData.shippingPostalCode || '',
          orderData.shippingCountry || '',
          orderData.notes || ''
        ]
      );
      
      return result.rows[0];
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
  
  async updateOrderPaymentIntent(id: number, paymentIntentId: string): Promise<Order | undefined> {
    try {
      const [updatedOrder] = await db.update(orders)
        .set({ paymentIntentId })
        .where(eq(orders.id, id))
        .returning();
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order payment intent ID:', error);
      throw error;
    }
  }

  // Order Item methods
  async createOrderItem(orderItemData: any): Promise<OrderItem> {
    try {
      // Use a direct SQL query with only the columns we know exist
      const result = await pool.query(
        `INSERT INTO order_items 
         (order_id, product_id, quantity, price_per_unit) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [
          orderItemData.orderId,
          orderItemData.productId,
          orderItemData.quantity,
          orderItemData.pricePerUnit
        ]
      );
      
      return result.rows[0];
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

  // Shipping Zone methods
  async createShippingZone(zoneData: InsertShippingZone): Promise<ShippingZone> {
    const result = await db.insert(shippingZones).values(zoneData).returning();
    return result[0];
  }

  async getShippingZoneById(id: number): Promise<ShippingZone | undefined> {
    const result = await db.select().from(shippingZones).where(eq(shippingZones.id, id));
    return result[0];
  }

  async getAllShippingZones(): Promise<ShippingZone[]> {
    return db.select().from(shippingZones).orderBy(asc(shippingZones.name));
  }

  async updateShippingZone(id: number, zoneData: Partial<InsertShippingZone>): Promise<ShippingZone | undefined> {
    const result = await db
      .update(shippingZones)
      .set({
        ...zoneData,
        updatedAt: new Date()
      })
      .where(eq(shippingZones.id, id))
      .returning();
    
    return result[0];
  }

  async deleteShippingZone(id: number): Promise<boolean> {
    const result = await db
      .delete(shippingZones)
      .where(eq(shippingZones.id, id))
      .returning({ id: shippingZones.id });
    
    return result.length > 0;
  }

  // Shipping Rate methods
  async createShippingRate(rateData: InsertShippingRate): Promise<ShippingRate> {
    const result = await db.insert(shippingRates).values(rateData).returning();
    return result[0];
  }

  async getShippingRateById(id: number): Promise<ShippingRate | undefined> {
    const result = await db.select().from(shippingRates).where(eq(shippingRates.id, id));
    return result[0];
  }

  async getShippingRatesByZoneId(zoneId: number): Promise<ShippingRate[]> {
    return db
      .select()
      .from(shippingRates)
      .where(eq(shippingRates.zoneId, zoneId))
      .orderBy(asc(shippingRates.minDistance));
  }

  async getAllShippingRates(): Promise<ShippingRate[]> {
    return db
      .select()
      .from(shippingRates)
      .orderBy(asc(shippingRates.zoneId), asc(shippingRates.minDistance));
  }

  async updateShippingRate(id: number, rateData: Partial<InsertShippingRate>): Promise<ShippingRate | undefined> {
    const result = await db
      .update(shippingRates)
      .set({
        ...rateData,
        updatedAt: new Date()
      })
      .where(eq(shippingRates.id, id))
      .returning();
    
    return result[0];
  }

  async deleteShippingRate(id: number): Promise<boolean> {
    const result = await db
      .delete(shippingRates)
      .where(eq(shippingRates.id, id))
      .returning({ id: shippingRates.id });
    
    return result.length > 0;
  }

  // Location methods
  async createLocation(locationData: InsertLocation): Promise<Location> {
    const result = await db.insert(locations).values(locationData).returning();
    return result[0];
  }

  async getLocationById(id: number): Promise<Location | undefined> {
    const result = await db.select().from(locations).where(eq(locations.id, id));
    return result[0];
  }

  async getAllLocations(): Promise<Location[]> {
    return db
      .select()
      .from(locations)
      .orderBy(asc(locations.city), asc(locations.province));
  }

  async getWarehouseLocations(): Promise<Location[]> {
    return db
      .select()
      .from(locations)
      .where(eq(locations.isWarehouse, true))
      .orderBy(asc(locations.city));
  }

  async updateLocation(id: number, locationData: Partial<InsertLocation>): Promise<Location | undefined> {
    const result = await db
      .update(locations)
      .set(locationData)
      .where(eq(locations.id, id))
      .returning();
    
    return result[0];
  }

  async deleteLocation(id: number): Promise<boolean> {
    const result = await db
      .delete(locations)
      .where(eq(locations.id, id))
      .returning({ id: locations.id });
    
    return result.length > 0;
  }

  // Calculate shipping cost based on distance
  async calculateShippingCost(fromLocationId: number, toLocationId: number, weight: number = 0): Promise<number> {
    // Get location coordinates
    try {
      console.log(`Calculating shipping cost from location ${fromLocationId} to location ${toLocationId} with weight ${weight}g`);
      
      // Special handling for temporary location ID
      if (toLocationId === -1) {
        console.log('Using flat rate for temporary location');
        return 3500; // $35 flat rate for temporary locations
      }
      
      const fromLocation = await this.getLocationById(fromLocationId);
      const toLocation = await this.getLocationById(toLocationId);
      
      console.log('From location:', fromLocation ? 
        { id: fromLocation.id, city: fromLocation.city, isWarehouse: fromLocation.isWarehouse, zoneId: fromLocation.zoneId } : 
        'Not found');
      
      console.log('To location:', toLocation ? 
        { id: toLocation.id, city: toLocation.city, isWarehouse: toLocation.isWarehouse, zoneId: toLocation.zoneId } : 
        'Not found');
      
      if (!fromLocation) {
        console.error(`From location with id ${fromLocationId} not found`);
        // Return a default instead of throwing
        return 3000; // $30 default
      }
      
      if (!toLocation) {
        console.error(`To location with id ${toLocationId} not found`);
        // Return a default instead of throwing
        return 3000; // $30 default
      }
      
      // Validate coordinates
      if (!fromLocation.latitude || !fromLocation.longitude || !toLocation.latitude || !toLocation.longitude) {
        console.error('Invalid coordinates', { 
          fromLocationLat: fromLocation.latitude, 
          fromLocationLng: fromLocation.longitude,
          toLocationLat: toLocation.latitude,
          toLocationLng: toLocation.longitude
        });
        // Return a default instead of throwing
        return 3000; // $30 default
      }
      
      // If locations are in the same zone, use that zone for calculation
      let zoneId: number | undefined = undefined;
      let maxDistanceLimit: number = 0; // Default: no limit
      
      if (fromLocation.zoneId && toLocation.zoneId && fromLocation.zoneId === toLocation.zoneId) {
        zoneId = fromLocation.zoneId;
        
        // Get the shipping zone info to check for max distance limit
        if (zoneId) {
          const shippingZone = await this.getShippingZoneById(zoneId);
          if (shippingZone && shippingZone.maxDistanceLimit) {
            maxDistanceLimit = shippingZone.maxDistanceLimit;
            console.log(`Zone ${zoneId} has max distance limit of ${maxDistanceLimit}km`);
          }
        }
      } else if (fromLocation.zoneId) {
        // Only from location has zone, try to get that zone's limit
        const shippingZone = await this.getShippingZoneById(fromLocation.zoneId);
        if (shippingZone && shippingZone.maxDistanceLimit) {
          maxDistanceLimit = shippingZone.maxDistanceLimit;
          console.log(`From location's zone ${fromLocation.zoneId} has max distance limit of ${maxDistanceLimit}km`);
        }
      }
      
      console.log('Calculating shipping cost between locations:', {
        fromId: fromLocationId,
        fromCity: fromLocation.city,
        fromCoords: [fromLocation.latitude, fromLocation.longitude],
        toId: toLocationId,
        toCity: toLocation.city,
        toCoords: [toLocation.latitude, toLocation.longitude],
        zoneId,
        maxDistanceLimit,
        weight
      });
      
      // Calculate distance using Haversine formula
      return this.calculateShippingCostByCoordinates(
        parseFloat(fromLocation.latitude),
        parseFloat(fromLocation.longitude),
        parseFloat(toLocation.latitude),
        parseFloat(toLocation.longitude),
        zoneId,
        weight,
        maxDistanceLimit
      );
    } catch (error) {
      console.error('Error in calculateShippingCost:', error);
      throw error;
    }
  }

  async calculateShippingCostByCoordinates(
    fromLat: number, 
    fromLng: number, 
    toLat: number, 
    toLng: number, 
    zoneId?: number,
    weight: number = 0,
    maxDistanceLimit: number = 0
  ): Promise<number> {
    try {
      // Validate inputs
      if (isNaN(fromLat) || isNaN(fromLng) || isNaN(toLat) || isNaN(toLng)) {
        console.error('Invalid coordinate values:', { fromLat, fromLng, toLat, toLng });
        throw new Error("Invalid coordinate values");
      }
      
      // Calculate distance using Haversine formula
      const R = 6371; // Earth radius in kilometers
      const dLat = this.deg2rad(toLat - fromLat);
      const dLng = this.deg2rad(toLng - fromLng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.deg2rad(fromLat)) * Math.cos(this.deg2rad(toLat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in kilometers
      
      console.log('Calculated distance:', distance, 'km');
      
      // Check if distance exceeds max distance limit (if set)
      if (maxDistanceLimit > 0 && distance > maxDistanceLimit) {
        console.log(`Distance ${distance}km exceeds max distance limit of ${maxDistanceLimit}km`);
        // Return -1 to indicate shipping is not available due to distance limit
        return -1;
      }
      
      // Find applicable shipping rate
      let applicableRates: ShippingRate[] = [];
      
      if (zoneId) {
        // If zone is provided, get rates for that zone
        console.log('Looking for rates in zone:', zoneId, 'for distance:', distance);
        applicableRates = await db
          .select()
          .from(shippingRates)
          .where(
            and(
              eq(shippingRates.zoneId, zoneId),
              eq(shippingRates.isActive, true),
              lte(shippingRates.minDistance, distance),
              gte(shippingRates.maxDistance, distance)
            )
          );
      }
      
      // If no rates found or no zone provided, find a rate based on distance from any zone
      if (applicableRates.length === 0) {
        console.log('No zone-specific rates found, looking for any rate for distance:', distance);
        applicableRates = await db
          .select()
          .from(shippingRates)
          .where(
            and(
              eq(shippingRates.isActive, true),
              lte(shippingRates.minDistance, distance),
              gte(shippingRates.maxDistance, distance)
            )
          );
      }
      
      // If still no rates, use the rate with the highest max distance
      if (applicableRates.length === 0) {
        console.log('No distance-specific rates found, looking for highest maxDistance rate');
        applicableRates = await db
          .select()
          .from(shippingRates)
          .where(eq(shippingRates.isActive, true))
          .orderBy(desc(shippingRates.maxDistance))
          .limit(1);
      }
      
      if (applicableRates.length === 0) {
        // No shipping rates defined, return a default cost
        console.log('No shipping rates found at all, using default cost');
        return 2000; // $20.00 in cents
      }
      
      const rate = applicableRates[0];
      console.log('Using shipping rate:', {
        id: rate.id,
        zoneId: rate.zoneId,
        minDistance: rate.minDistance,
        maxDistance: rate.maxDistance,
        baseRate: rate.baseRate,
        additionalRatePerKm: rate.additionalRatePerKm
      });
      
      // Calculate base cost based on distance
      let shippingCost = rate.baseRate;
      
      // Add distance-based cost
      const additionalDistance = Math.max(0, distance - rate.minDistance);
      const distanceCost = Math.round(additionalDistance * rate.additionalRatePerKm);
      shippingCost += distanceCost;
      
      console.log('Distance-based cost calculation:', {
        baseRate: rate.baseRate,
        additionalDistance,
        distanceCost,
        subtotal: shippingCost
      });
      
      // Add weight-based cost if applicable
      if (weight > 0 && rate.additionalRatePerKg && rate.additionalRatePerKg > 0) {
        const weightInKg = weight / 1000; // Convert grams to kg
        const weightCost = Math.round(weightInKg * rate.additionalRatePerKg);
        shippingCost += weightCost;
        
        console.log('Weight-based cost calculation:', {
          weight,
          weightInKg,
          additionalRatePerKg: rate.additionalRatePerKg,
          weightCost,
          total: shippingCost
        });
      }
      
      return shippingCost;
    } catch (error) {
      console.error('Error calculating shipping cost by coordinates:', error);
      // Return a default cost in case of error instead of throwing
      return 2500; // $25 default in case of calculation error
    }
  }
  
  // Allowed Cities methods
  async createAllowedCity(cityData: InsertAllowedCity): Promise<AllowedCity> {
    const result = await db.insert(allowedCities).values(cityData).returning();
    return result[0];
  }

  async getAllowedCityById(id: number): Promise<AllowedCity | undefined> {
    const result = await db.select().from(allowedCities).where(eq(allowedCities.id, id));
    return result[0];
  }

  async getAllAllowedCities(): Promise<AllowedCity[]> {
    return db.select().from(allowedCities).orderBy(asc(allowedCities.cityName));
  }

  async getAllActiveAllowedCities(): Promise<AllowedCity[]> {
    return db.select().from(allowedCities)
      .where(eq(allowedCities.isActive, true))
      .orderBy(asc(allowedCities.cityName));
  }

  async updateAllowedCity(id: number, cityData: Partial<InsertAllowedCity>): Promise<AllowedCity | undefined> {
    const result = await db
      .update(allowedCities)
      .set(cityData)
      .where(eq(allowedCities.id, id))
      .returning();
    
    return result[0];
  }

  async deleteAllowedCity(id: number): Promise<boolean> {
    const result = await db
      .delete(allowedCities)
      .where(eq(allowedCities.id, id))
      .returning({ id: allowedCities.id });
    
    return result.length > 0;
  }

  async isCityAllowed(cityName: string): Promise<boolean> {
    if (!cityName) return false;
    
    const normalizedCityName = cityName.toLowerCase().trim();
    
    // Check for exact match first
    const exactMatches = await db.select()
      .from(allowedCities)
      .where(and(
        sql`LOWER(${allowedCities.cityName}) = ${normalizedCityName}`,
        eq(allowedCities.isActive, true)
      ));
    
    if (exactMatches.length > 0) {
      return true;
    }
    
    // Check for partial matches (city name contains the search term or vice versa)
    const partialMatches = await db.select()
      .from(allowedCities)
      .where(and(
        or(
          sql`LOWER(${allowedCities.cityName}) LIKE ${`%${normalizedCityName}%`}`,
          sql`${normalizedCityName} LIKE CONCAT('%', LOWER(${allowedCities.cityName}), '%')`
        ),
        eq(allowedCities.isActive, true)
      ));
    
    return partialMatches.length > 0;
  }
  
  // Helper method to convert degrees to radians
  private deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  // Initialize the database with initial allowed cities
  private async initializeDatabase() {
    try {
      // Check if we have some allowed cities already, if not add initial ones
      const existingCities = await this.getAllAllowedCities();
      
      if (existingCities.length === 0) {
        // Add initial allowed cities
        const initialCities = [
          { cityName: 'Brampton', province: 'Ontario', isActive: true },
          { cityName: 'Mississauga', province: 'Ontario', isActive: true },
          { cityName: 'Toronto', province: 'Ontario', isActive: true }
        ];
        
        for (const city of initialCities) {
          await this.createAllowedCity(city);
        }
        
        console.log('Initialized allowed cities with:', initialCities.map(c => c.cityName).join(', '));
      }
    } catch (error) {
      console.error('Error initializing allowed cities:', error);
    }
  }

  // Backup methods for data export
  async getAllProductImages(): Promise<ProductImage[]> {
    return db.select().from(productImages).orderBy(asc(productImages.id));
  }

  async getAllOrderItems(): Promise<OrderItem[]> {
    return db.select().from(orderItems).orderBy(asc(orderItems.id));
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getAllNotifications(): Promise<Notification[]> {
    return db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }
}

export const storage = new DatabaseStorage();
