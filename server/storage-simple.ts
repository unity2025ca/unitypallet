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
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Contact methods
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
  getContactById(id: number): Promise<Contact | undefined>;
  updateContactReadStatus(id: number, isRead: boolean): Promise<Contact>;
  deleteContact(id: number): Promise<boolean>;
  
  // Settings methods
  getAllSettings(): Promise<Setting[]>;
  getSettingByKey(key: string): Promise<Setting | undefined>;
  updateSetting(key: string, value: string): Promise<Setting>;
  createSetting(setting: InsertSetting): Promise<Setting>;
  
  // Session store
  sessionStore: session.SessionStore;
  
  // Placeholder methods for compatibility
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductImages(productId: number): Promise<ProductImage[]>;
  getProductMainImage(productId: number): Promise<ProductImage | undefined>;
  getProductImageById(imageId: number): Promise<ProductImage | undefined>;
  addProductImage(productImage: InsertProductImage): Promise<ProductImage>;
  setMainProductImage(productId: number, imageId: number): Promise<boolean>;
  deleteProductImage(imageId: number): Promise<boolean>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getAllSubscribers(): Promise<Subscriber[]>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  deleteSubscriber(id: number): Promise<boolean>;
  getAllFaqs(): Promise<Faq[]>;
  getFaqById(id: number): Promise<Faq | undefined>;
  createFaq(faq: InsertFaq): Promise<Faq>;
  updateFaq(id: number, faq: Partial<InsertFaq>): Promise<Faq | undefined>;
  deleteFaq(id: number): Promise<boolean>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAllAppointments(): Promise<Appointment[]>;
  getAppointmentById(id: number): Promise<Appointment | undefined>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment>;
  deleteAppointment(id: number): Promise<boolean>;
  createVisitorStat(stat: InsertVisitorStat): Promise<VisitorStat>;
  getVisitorStats(startDate?: Date, endDate?: Date): Promise<VisitorStat[]>;
  getVisitorStatsByPage(page: string): Promise<VisitorStat[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  createOrder(orderData: any): Promise<Order>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByCustomerId(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  updateOrderPaymentStatus(id: number, paymentStatus: string): Promise<Order>;
  deleteOrder(id: number): Promise<boolean>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
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
  getAllAllowedCities(): Promise<AllowedCity[]>;
  getAllowedCityById(id: number): Promise<AllowedCity | undefined>;
  createAllowedCity(city: InsertAllowedCity): Promise<AllowedCity>;
  updateAllowedCity(id: number, city: Partial<InsertAllowedCity>): Promise<AllowedCity | undefined>;
  deleteAllowedCity(id: number): Promise<boolean>;
  isCityAllowed(cityName: string): Promise<boolean>;
}

class SimpleMemoryStorage implements IStorage {
  private data = {
    users: new Map<number, any>(),
    products: new Map<number, any>(),
    contacts: new Map<number, any>(),
    settings: new Map<string, any>(),
    categories: new Map<number, any>(),
    productImages: new Map<number, any>(),
    subscribers: new Map<number, any>(),
    faqs: new Map<number, any>(),
    appointments: new Map<number, any>(),
    visitorStats: new Map<number, any>(),
    notifications: new Map<number, any>(),
    orders: new Map<number, any>(),
    orderItems: new Map<number, any>(),
    shippingZones: new Map<number, any>(),
    shippingRates: new Map<number, any>(),
    locations: new Map<number, any>(),
    allowedCities: new Map<number, any>()
  };
  
  private nextId = 1;
  public sessionStore: session.SessionStore;

  constructor() {
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    this.initializeData();
  }

  private getNextId(): number {
    return this.nextId++;
  }

  private initializeData() {
    // Initialize default settings
    const defaultSettings = [
      { key: 'site_name', value: 'Jaberco', category: 'general', label: 'Site Name', type: 'text', description: 'Website name' },
      { key: 'site_logo', value: '', category: 'general', label: 'Site Logo', type: 'file', description: 'Website logo' },
      { key: 'contact_email', value: 'info@jaberco.com', category: 'contact', label: 'Contact Email', type: 'email', description: 'Contact email address' },
      { key: 'contact_phone', value: '+1 (289) 216-6500', category: 'contact', label: 'Contact Phone', type: 'text', description: 'Contact phone number' },
      { key: 'contact_address', value: 'Mississauga, Ontario, Canada', category: 'contact', label: 'Contact Address', type: 'text', description: 'Business address' },
    ];

    defaultSettings.forEach(setting => {
      const id = this.getNextId();
      this.data.settings.set(setting.key, { id, ...setting, updatedAt: new Date() });
    });

    // Initialize default categories
    const defaultCategories = [
      { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets' },
      { name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion items' },
      { name: 'Home & Garden', slug: 'home-garden', description: 'Home and garden products' }
    ];

    defaultCategories.forEach(category => {
      const id = this.getNextId();
      this.data.categories.set(id, { id, ...category, createdAt: new Date() });
    });

    // Initialize allowed cities
    const defaultCities = [
      { cityName: 'Brampton', province: 'Ontario', isActive: true },
      { cityName: 'Mississauga', province: 'Ontario', isActive: true },
      { cityName: 'Toronto', province: 'Ontario', isActive: true }
    ];

    defaultCities.forEach(city => {
      const id = this.getNextId();
      this.data.allowedCities.set(id, { id, ...city, createdAt: new Date() });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.data.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.data.users.values()) {
      if (user.username === username) return user;
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.getNextId();
    const newUser = { id, ...user, createdAt: new Date() };
    this.data.users.set(id, newUser);
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.data.users.values());
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.data.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...user };
    this.data.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.data.users.delete(id);
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.data.products.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.data.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.getNextId();
    const newProduct = { id, ...product, createdAt: new Date() };
    this.data.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.data.products.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...product };
    this.data.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.data.products.delete(id);
  }

  // Contact methods
  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.getNextId();
    const newContact = { id, ...contact, isRead: false, createdAt: new Date() };
    this.data.contacts.set(id, newContact);
    return newContact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.data.contacts.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getContactById(id: number): Promise<Contact | undefined> {
    return this.data.contacts.get(id);
  }

  async updateContactReadStatus(id: number, isRead: boolean): Promise<Contact> {
    const contact = this.data.contacts.get(id);
    if (!contact) throw new Error('Contact not found');
    const updated = { ...contact, isRead };
    this.data.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.data.contacts.delete(id);
  }

  // Settings methods
  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.data.settings.values());
  }

  async getSettingByKey(key: string): Promise<Setting | undefined> {
    return this.data.settings.get(key);
  }

  async updateSetting(key: string, value: string): Promise<Setting> {
    const existing = this.data.settings.get(key);
    if (existing) {
      const updated = { ...existing, value, updatedAt: new Date() };
      this.data.settings.set(key, updated);
      return updated;
    } else {
      const id = this.getNextId();
      const newSetting = { id, key, value, category: 'general', label: key, type: 'text', description: '', updatedAt: new Date() };
      this.data.settings.set(key, newSetting);
      return newSetting;
    }
  }

  async createSetting(setting: InsertSetting): Promise<Setting> {
    const id = this.getNextId();
    const newSetting = { id, ...setting, updatedAt: new Date() };
    this.data.settings.set(setting.key, newSetting);
    return newSetting;
  }

  // Placeholder implementations for compatibility
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.data.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.data.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    for (const category of this.data.categories.values()) {
      if (category.slug === slug) return category;
    }
    return undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.getNextId();
    const newCategory = { id, ...category, createdAt: new Date() };
    this.data.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.data.categories.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...category };
    this.data.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.data.categories.delete(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.data.products.values()).filter(p => p.category === category);
  }

  async getProductImages(productId: number): Promise<ProductImage[]> {
    return Array.from(this.data.productImages.values()).filter(img => img.productId === productId);
  }

  async getProductMainImage(productId: number): Promise<ProductImage | undefined> {
    for (const image of this.data.productImages.values()) {
      if (image.productId === productId && image.isMain) return image;
    }
    return undefined;
  }

  async getProductImageById(imageId: number): Promise<ProductImage | undefined> {
    return this.data.productImages.get(imageId);
  }

  async addProductImage(productImage: InsertProductImage): Promise<ProductImage> {
    const id = this.getNextId();
    const newImage = { id, ...productImage, createdAt: new Date() };
    this.data.productImages.set(id, newImage);
    return newImage;
  }

  async setMainProductImage(productId: number, imageId: number): Promise<boolean> {
    // Unset all main images for this product
    for (const [id, image] of this.data.productImages.entries()) {
      if (image.productId === productId) {
        this.data.productImages.set(id, { ...image, isMain: false });
      }
    }
    
    // Set the specified image as main
    const image = this.data.productImages.get(imageId);
    if (image && image.productId === productId) {
      this.data.productImages.set(imageId, { ...image, isMain: true });
      return true;
    }
    return false;
  }

  async deleteProductImage(imageId: number): Promise<boolean> {
    return this.data.productImages.delete(imageId);
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const id = this.getNextId();
    const newSubscriber = { id, ...subscriber, createdAt: new Date() };
    this.data.subscribers.set(id, newSubscriber);
    return newSubscriber;
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.data.subscribers.values());
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    for (const subscriber of this.data.subscribers.values()) {
      if (subscriber.email === email) return subscriber;
    }
    return undefined;
  }

  async deleteSubscriber(id: number): Promise<boolean> {
    return this.data.subscribers.delete(id);
  }

  async getAllFaqs(): Promise<Faq[]> {
    return Array.from(this.data.faqs.values());
  }

  async getFaqById(id: number): Promise<Faq | undefined> {
    return this.data.faqs.get(id);
  }

  async createFaq(faq: InsertFaq): Promise<Faq> {
    const id = this.getNextId();
    const newFaq = { id, ...faq, createdAt: new Date() };
    this.data.faqs.set(id, newFaq);
    return newFaq;
  }

  async updateFaq(id: number, faq: Partial<InsertFaq>): Promise<Faq | undefined> {
    const existing = this.data.faqs.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...faq };
    this.data.faqs.set(id, updated);
    return updated;
  }

  async deleteFaq(id: number): Promise<boolean> {
    return this.data.faqs.delete(id);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.getNextId();
    const newAppointment = { id, ...appointment, status: 'pending', createdAt: new Date() };
    this.data.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.data.appointments.values());
  }

  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    return this.data.appointments.get(id);
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    const appointment = this.data.appointments.get(id);
    if (!appointment) throw new Error('Appointment not found');
    const updated = { ...appointment, status };
    this.data.appointments.set(id, updated);
    return updated;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.data.appointments.delete(id);
  }

  async createVisitorStat(stat: InsertVisitorStat): Promise<VisitorStat> {
    const id = this.getNextId();
    const newStat = { id, ...stat, visitDate: new Date(), createdAt: new Date() };
    this.data.visitorStats.set(id, newStat);
    return newStat;
  }

  async getVisitorStats(startDate?: Date, endDate?: Date): Promise<VisitorStat[]> {
    let stats = Array.from(this.data.visitorStats.values());
    if (startDate) stats = stats.filter(s => new Date(s.visitDate) >= startDate);
    if (endDate) stats = stats.filter(s => new Date(s.visitDate) <= endDate);
    return stats;
  }

  async getVisitorStatsByPage(page: string): Promise<VisitorStat[]> {
    return Array.from(this.data.visitorStats.values()).filter(s => s.pageUrl === page);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.getNextId();
    const newNotification = { id, ...notification, isRead: false, created_at: new Date() };
    this.data.notifications.set(id, newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.data.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.data.notifications.values())
      .filter(n => n.userId === userId && !n.isRead)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.data.notifications.get(id);
    if (!notification) return false;
    this.data.notifications.set(id, { ...notification, isRead: true });
    return true;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    for (const [id, notification] of this.data.notifications.entries()) {
      if (notification.userId === userId && !notification.isRead) {
        this.data.notifications.set(id, { ...notification, isRead: true });
      }
    }
    return true;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.data.notifications.delete(id);
  }

  async createOrder(orderData: any): Promise<Order> {
    const id = this.getNextId();
    const newOrder = { 
      id, 
      ...orderData, 
      status: 'pending', 
      paymentStatus: 'pending', 
      createdAt: new Date() 
    };
    this.data.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.data.orders.get(id);
  }

  async getOrdersByCustomerId(userId: number): Promise<Order[]> {
    return Array.from(this.data.orders.values())
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.data.orders.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const order = this.data.orders.get(id);
    if (!order) throw new Error('Order not found');
    const updated = { ...order, status };
    this.data.orders.set(id, updated);
    return updated;
  }

  async updateOrderPaymentStatus(id: number, paymentStatus: string): Promise<Order> {
    const order = this.data.orders.get(id);
    if (!order) throw new Error('Order not found');
    const updated = { ...order, paymentStatus };
    this.data.orders.set(id, updated);
    return updated;
  }

  async deleteOrder(id: number): Promise<boolean> {
    return this.data.orders.delete(id);
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.getNextId();
    const newOrderItem = { id, ...orderItem };
    this.data.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.data.orderItems.values()).filter(item => item.orderId === orderId);
  }

  // Shipping methods (simplified)
  async getAllShippingZones(): Promise<ShippingZone[]> {
    return Array.from(this.data.shippingZones.values());
  }

  async getShippingZoneById(id: number): Promise<ShippingZone | undefined> {
    return this.data.shippingZones.get(id);
  }

  async createShippingZone(zone: InsertShippingZone): Promise<ShippingZone> {
    const id = this.getNextId();
    const newZone = { id, ...zone, createdAt: new Date() };
    this.data.shippingZones.set(id, newZone);
    return newZone;
  }

  async updateShippingZone(id: number, zone: Partial<InsertShippingZone>): Promise<ShippingZone | undefined> {
    const existing = this.data.shippingZones.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...zone };
    this.data.shippingZones.set(id, updated);
    return updated;
  }

  async deleteShippingZone(id: number): Promise<boolean> {
    return this.data.shippingZones.delete(id);
  }

  async getAllShippingRates(): Promise<ShippingRate[]> {
    return Array.from(this.data.shippingRates.values());
  }

  async getShippingRateById(id: number): Promise<ShippingRate | undefined> {
    return this.data.shippingRates.get(id);
  }

  async createShippingRate(rate: InsertShippingRate): Promise<ShippingRate> {
    const id = this.getNextId();
    const newRate = { id, ...rate, createdAt: new Date() };
    this.data.shippingRates.set(id, newRate);
    return newRate;
  }

  async updateShippingRate(id: number, rate: Partial<InsertShippingRate>): Promise<ShippingRate | undefined> {
    const existing = this.data.shippingRates.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...rate };
    this.data.shippingRates.set(id, updated);
    return updated;
  }

  async deleteShippingRate(id: number): Promise<boolean> {
    return this.data.shippingRates.delete(id);
  }

  async getAllLocations(): Promise<Location[]> {
    return Array.from(this.data.locations.values());
  }

  async getLocationById(id: number): Promise<Location | undefined> {
    return this.data.locations.get(id);
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const id = this.getNextId();
    const newLocation = { id, ...location, createdAt: new Date() };
    this.data.locations.set(id, newLocation);
    return newLocation;
  }

  async updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined> {
    const existing = this.data.locations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...location };
    this.data.locations.set(id, updated);
    return updated;
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.data.locations.delete(id);
  }

  async getAllAllowedCities(): Promise<AllowedCity[]> {
    return Array.from(this.data.allowedCities.values());
  }

  async getAllowedCityById(id: number): Promise<AllowedCity | undefined> {
    return this.data.allowedCities.get(id);
  }

  async createAllowedCity(city: InsertAllowedCity): Promise<AllowedCity> {
    const id = this.getNextId();
    const newCity = { id, ...city, createdAt: new Date() };
    this.data.allowedCities.set(id, newCity);
    return newCity;
  }

  async updateAllowedCity(id: number, city: Partial<InsertAllowedCity>): Promise<AllowedCity | undefined> {
    const existing = this.data.allowedCities.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...city };
    this.data.allowedCities.set(id, updated);
    return updated;
  }

  async deleteAllowedCity(id: number): Promise<boolean> {
    return this.data.allowedCities.delete(id);
  }

  async isCityAllowed(cityName: string): Promise<boolean> {
    const normalizedCityName = cityName.toLowerCase().trim();
    for (const city of this.data.allowedCities.values()) {
      if (city.isActive && city.cityName.toLowerCase().includes(normalizedCityName)) {
        return true;
      }
    }
    return false;
  }
}

export const storage = new SimpleMemoryStorage();