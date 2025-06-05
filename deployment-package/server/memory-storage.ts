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
  type InsertAllowedCity
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// In-memory storage interface
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
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  deleteSubscriber(id: number): Promise<boolean>;
  
  // Settings methods
  getAllSettings(): Promise<Setting[]>;
  getSettingByKey(key: string): Promise<Setting | undefined>;
  updateSetting(key: string, value: string): Promise<Setting>;
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
  updateAppointmentStatus(id: number, status: string): Promise<Appointment>;
  deleteAppointment(id: number): Promise<boolean>;
  
  // Visitor stats methods
  createVisitorStat(stat: InsertVisitorStat): Promise<VisitorStat>;
  getVisitorStats(startDate?: Date, endDate?: Date): Promise<VisitorStat[]>;
  getVisitorStatsByPage(page: string): Promise<VisitorStat[]>;
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Order methods
  createOrder(orderData: any): Promise<Order>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByCustomerId(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  updateOrderPaymentStatus(id: number, paymentStatus: string): Promise<Order>;
  deleteOrder(id: number): Promise<boolean>;
  
  // Order item methods
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  
  // Shipping methods
  getAllShippingZones(): Promise<ShippingZone[]>;
  getShippingZoneById(id: number): Promise<ShippingZone | undefined>;
  createShippingZone(zone: InsertShippingZone): Promise<ShippingZone>;
  updateShippingZone(id: number, zone: Partial<InsertShippingZone>): Promise<ShippingZone | undefined>;
  deleteShippingZone(id: number): Promise<boolean>;
  
  getAllShippingRates(): Promise<ShippingRate[]>;
  getShippingRateById(id: number): Promise<ShippingRate | undefined>;
  createShippingRate(rate: InsertShippingRate): Promise<ShippingRate>;
  updateShippingRate(id: number, rate: Partial<InsertShippingRate>): Promise<ShippingRate | undefined>;
  deleteShippingRate(id: number): Promise<boolean>;
  
  getAllLocations(): Promise<Location[]>;
  getLocationById(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;
  
  // Allowed cities methods
  getAllAllowedCities(): Promise<AllowedCity[]>;
  getAllowedCityById(id: number): Promise<AllowedCity | undefined>;
  createAllowedCity(city: InsertAllowedCity): Promise<AllowedCity>;
  updateAllowedCity(id: number, city: Partial<InsertAllowedCity>): Promise<AllowedCity | undefined>;
  deleteAllowedCity(id: number): Promise<boolean>;
  isCityAllowed(cityName: string): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

class MemoryStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private categories: Map<number, Category> = new Map();
  private products: Map<number, Product> = new Map();
  private productImages: Map<number, ProductImage> = new Map();
  private contacts: Map<number, Contact> = new Map();
  private subscribers: Map<number, Subscriber> = new Map();
  private settings: Map<string, Setting> = new Map();
  private faqs: Map<number, Faq> = new Map();
  private appointments: Map<number, Appointment> = new Map();
  private visitorStats: Map<number, VisitorStat> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private orders: Map<number, Order> = new Map();
  private orderItems: Map<number, OrderItem> = new Map();
  private shippingZones: Map<number, ShippingZone> = new Map();
  private shippingRates: Map<number, ShippingRate> = new Map();
  private locations: Map<number, Location> = new Map();
  private allowedCities: Map<number, AllowedCity> = new Map();
  
  private nextId = 1;
  public sessionStore: session.SessionStore;

  constructor() {
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    this.initializeDefaultData();
  }

  private getNextId(): number {
    return this.nextId++;
  }

  private initializeDefaultData() {
    // Initialize default settings
    const defaultSettings = [
      { key: 'site_name', value: 'Jaberco', category: 'general', label: 'Site Name', type: 'text', description: 'Website name' },
      { key: 'site_logo', value: '', category: 'general', label: 'Site Logo', type: 'file', description: 'Website logo' },
      { key: 'contact_email', value: 'info@jaberco.com', category: 'contact', label: 'Contact Email', type: 'email', description: 'Contact email address' },
      { key: 'contact_phone', value: '+1 (289) 216-6500', category: 'contact', label: 'Contact Phone', type: 'text', description: 'Contact phone number' },
      { key: 'contact_address', value: 'Mississauga, Ontario, Canada', category: 'contact', label: 'Contact Address', type: 'text', description: 'Business address' },
      { key: 'location_map', value: '', category: 'contact', label: 'Google Maps Embed Code', type: 'textarea', description: 'Google Maps iframe code' }
    ];

    defaultSettings.forEach(setting => {
      const id = this.getNextId();
      this.settings.set(setting.key, {
        id,
        ...setting,
        updatedAt: new Date()
      } as Setting);
    });

    // Initialize default categories
    const defaultCategories = [
      { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets', isActive: true },
      { name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion items', isActive: true },
      { name: 'Home & Garden', slug: 'home-garden', description: 'Home and garden products', isActive: true }
    ];

    defaultCategories.forEach(category => {
      const id = this.getNextId();
      this.categories.set(id, {
        id,
        ...category,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Category);
    });

    // Initialize default allowed cities
    const defaultCities = [
      { cityName: 'Brampton', province: 'Ontario', isActive: true },
      { cityName: 'Mississauga', province: 'Ontario', isActive: true },
      { cityName: 'Toronto', province: 'Ontario', isActive: true }
    ];

    defaultCities.forEach(city => {
      const id = this.getNextId();
      this.allowedCities.set(id, {
        id,
        ...city,
        createdAt: new Date(),
        updatedAt: new Date()
      } as AllowedCity);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.getNextId();
    const newUser: User = {
      id,
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = {
      ...existingUser,
      ...user,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    for (const category of this.categories.values()) {
      if (category.slug === slug) {
        return category;
      }
    }
    return undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.getNextId();
    const newCategory: Category = {
      id,
      ...category,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory = {
      ...existingCategory,
      ...category,
      updatedAt: new Date()
    };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.category === category);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.getNextId();
    const newProduct: Product = {
      id,
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = {
      ...existingProduct,
      ...product,
      updatedAt: new Date()
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Product Images methods
  async getProductImages(productId: number): Promise<ProductImage[]> {
    return Array.from(this.productImages.values()).filter(img => img.productId === productId);
  }

  async getProductMainImage(productId: number): Promise<ProductImage | undefined> {
    for (const image of this.productImages.values()) {
      if (image.productId === productId && image.isMain) {
        return image;
      }
    }
    return undefined;
  }

  async getProductImageById(imageId: number): Promise<ProductImage | undefined> {
    return this.productImages.get(imageId);
  }

  async addProductImage(productImage: InsertProductImage): Promise<ProductImage> {
    const id = this.getNextId();
    const newImage: ProductImage = {
      id,
      ...productImage,
      createdAt: new Date()
    };
    this.productImages.set(id, newImage);
    return newImage;
  }

  async setMainProductImage(productId: number, imageId: number): Promise<boolean> {
    // First, unset all main images for this product
    for (const [id, image] of this.productImages.entries()) {
      if (image.productId === productId) {
        this.productImages.set(id, { ...image, isMain: false });
      }
    }
    
    // Then set the specified image as main
    const image = this.productImages.get(imageId);
    if (image && image.productId === productId) {
      this.productImages.set(imageId, { ...image, isMain: true });
      return true;
    }
    return false;
  }

  async deleteProductImage(imageId: number): Promise<boolean> {
    return this.productImages.delete(imageId);
  }

  // Contact methods
  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.getNextId();
    const newContact: Contact = {
      id,
      ...contact,
      isRead: false,
      createdAt: new Date()
    };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getContactById(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async updateContactReadStatus(id: number, isRead: boolean): Promise<Contact> {
    const contact = this.contacts.get(id);
    if (!contact) throw new Error('Contact not found');
    
    const updatedContact = { ...contact, isRead };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  // Subscriber methods
  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const id = this.getNextId();
    const newSubscriber: Subscriber = {
      id,
      ...subscriber,
      subscribedAt: new Date()
    };
    this.subscribers.set(id, newSubscriber);
    return newSubscriber;
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values());
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    for (const subscriber of this.subscribers.values()) {
      if (subscriber.email === email) {
        return subscriber;
      }
    }
    return undefined;
  }

  async deleteSubscriber(id: number): Promise<boolean> {
    return this.subscribers.delete(id);
  }

  // Settings methods
  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async getSettingByKey(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async updateSetting(key: string, value: string): Promise<Setting> {
    const existing = this.settings.get(key);
    if (existing) {
      const updated = { ...existing, value, updatedAt: new Date() };
      this.settings.set(key, updated);
      return updated;
    } else {
      const id = this.getNextId();
      const newSetting: Setting = {
        id,
        key,
        value,
        category: 'general',
        label: key,
        type: 'text',
        description: '',
        updatedAt: new Date()
      };
      this.settings.set(key, newSetting);
      return newSetting;
    }
  }

  async createSetting(setting: InsertSetting): Promise<Setting> {
    const id = this.getNextId();
    const newSetting: Setting = {
      id,
      ...setting,
      updatedAt: new Date()
    };
    this.settings.set(setting.key, newSetting);
    return newSetting;
  }

  // FAQ methods
  async getAllFaqs(): Promise<Faq[]> {
    return Array.from(this.faqs.values());
  }

  async getFaqById(id: number): Promise<Faq | undefined> {
    return this.faqs.get(id);
  }

  async createFaq(faq: InsertFaq): Promise<Faq> {
    const id = this.getNextId();
    const newFaq: Faq = {
      id,
      ...faq,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.faqs.set(id, newFaq);
    return newFaq;
  }

  async updateFaq(id: number, faq: Partial<InsertFaq>): Promise<Faq | undefined> {
    const existing = this.faqs.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...faq,
      updatedAt: new Date()
    };
    this.faqs.set(id, updated);
    return updated;
  }

  async deleteFaq(id: number): Promise<boolean> {
    return this.faqs.delete(id);
  }

  // Appointment methods
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.getNextId();
    const newAppointment: Appointment = {
      id,
      ...appointment,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) throw new Error('Appointment not found');
    
    const updated = { ...appointment, status, updatedAt: new Date() };
    this.appointments.set(id, updated);
    return updated;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  // Visitor stats methods
  async createVisitorStat(stat: InsertVisitorStat): Promise<VisitorStat> {
    const id = this.getNextId();
    const newStat: VisitorStat = {
      id,
      ...stat,
      visitedAt: new Date()
    };
    this.visitorStats.set(id, newStat);
    return newStat;
  }

  async getVisitorStats(startDate?: Date, endDate?: Date): Promise<VisitorStat[]> {
    let stats = Array.from(this.visitorStats.values());
    
    if (startDate) {
      stats = stats.filter(s => s.visitedAt >= startDate);
    }
    if (endDate) {
      stats = stats.filter(s => s.visitedAt <= endDate);
    }
    
    return stats;
  }

  async getVisitorStatsByPage(page: string): Promise<VisitorStat[]> {
    return Array.from(this.visitorStats.values()).filter(s => s.page === page);
  }

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.getNextId();
    const newNotification: Notification = {
      id,
      ...notification,
      isRead: false,
      created_at: new Date()
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.isRead)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    this.notifications.set(id, { ...notification, isRead: true });
    return true;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    for (const [id, notification] of this.notifications.entries()) {
      if (notification.userId === userId && !notification.isRead) {
        this.notifications.set(id, { ...notification, isRead: true });
      }
    }
    return true;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // Order methods
  async createOrder(orderData: any): Promise<Order> {
    const id = this.getNextId();
    const newOrder: Order = {
      id,
      userId: orderData.userId,
      total: orderData.total,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress: orderData.shippingAddress || '',
      shippingCity: orderData.shippingCity || '',
      shippingPostalCode: orderData.shippingPostalCode || '',
      shippingCountry: orderData.shippingCountry || '',
      notes: orderData.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByCustomerId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(o => o.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error('Order not found');
    
    const updated = { ...order, status, updatedAt: new Date() };
    this.orders.set(id, updated);
    return updated;
  }

  async updateOrderPaymentStatus(id: number, paymentStatus: string): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error('Order not found');
    
    const updated = { ...order, paymentStatus, updatedAt: new Date() };
    this.orders.set(id, updated);
    return updated;
  }

  async deleteOrder(id: number): Promise<boolean> {
    return this.orders.delete(id);
  }

  // Order item methods
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.getNextId();
    const newOrderItem: OrderItem = {
      id,
      ...orderItem
    };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  // Shipping methods
  async getAllShippingZones(): Promise<ShippingZone[]> {
    return Array.from(this.shippingZones.values());
  }

  async getShippingZoneById(id: number): Promise<ShippingZone | undefined> {
    return this.shippingZones.get(id);
  }

  async createShippingZone(zone: InsertShippingZone): Promise<ShippingZone> {
    const id = this.getNextId();
    const newZone: ShippingZone = {
      id,
      ...zone,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.shippingZones.set(id, newZone);
    return newZone;
  }

  async updateShippingZone(id: number, zone: Partial<InsertShippingZone>): Promise<ShippingZone | undefined> {
    const existing = this.shippingZones.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...zone,
      updatedAt: new Date()
    };
    this.shippingZones.set(id, updated);
    return updated;
  }

  async deleteShippingZone(id: number): Promise<boolean> {
    return this.shippingZones.delete(id);
  }

  async getAllShippingRates(): Promise<ShippingRate[]> {
    return Array.from(this.shippingRates.values());
  }

  async getShippingRateById(id: number): Promise<ShippingRate | undefined> {
    return this.shippingRates.get(id);
  }

  async createShippingRate(rate: InsertShippingRate): Promise<ShippingRate> {
    const id = this.getNextId();
    const newRate: ShippingRate = {
      id,
      ...rate,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.shippingRates.set(id, newRate);
    return newRate;
  }

  async updateShippingRate(id: number, rate: Partial<InsertShippingRate>): Promise<ShippingRate | undefined> {
    const existing = this.shippingRates.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...rate,
      updatedAt: new Date()
    };
    this.shippingRates.set(id, updated);
    return updated;
  }

  async deleteShippingRate(id: number): Promise<boolean> {
    return this.shippingRates.delete(id);
  }

  async getAllLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async getLocationById(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const id = this.getNextId();
    const newLocation: Location = {
      id,
      ...location,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.locations.set(id, newLocation);
    return newLocation;
  }

  async updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined> {
    const existing = this.locations.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...location,
      updatedAt: new Date()
    };
    this.locations.set(id, updated);
    return updated;
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }

  // Allowed cities methods
  async getAllAllowedCities(): Promise<AllowedCity[]> {
    return Array.from(this.allowedCities.values());
  }

  async getAllowedCityById(id: number): Promise<AllowedCity | undefined> {
    return this.allowedCities.get(id);
  }

  async createAllowedCity(city: InsertAllowedCity): Promise<AllowedCity> {
    const id = this.getNextId();
    const newCity: AllowedCity = {
      id,
      ...city,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.allowedCities.set(id, newCity);
    return newCity;
  }

  async updateAllowedCity(id: number, city: Partial<InsertAllowedCity>): Promise<AllowedCity | undefined> {
    const existing = this.allowedCities.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...city,
      updatedAt: new Date()
    };
    this.allowedCities.set(id, updated);
    return updated;
  }

  async deleteAllowedCity(id: number): Promise<boolean> {
    return this.allowedCities.delete(id);
  }

  async isCityAllowed(cityName: string): Promise<boolean> {
    const normalizedCityName = cityName.toLowerCase().trim();
    
    for (const city of this.allowedCities.values()) {
      if (city.isActive && city.cityName.toLowerCase().includes(normalizedCityName)) {
        return true;
      }
    }
    
    return false;
  }
}

export const storage = new MemoryStorage();