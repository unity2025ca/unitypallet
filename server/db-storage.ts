import { db } from "./db";
import { 
  users, products, categories, productImages, settings, contacts, faqs, 
  appointments, subscribers, visitorStats, notifications, orders, orderItems,
  shippingZones, shippingRates, locations, allowedCities, carts, cartItems
} from "@shared/schema";
import type {
  User, InsertUser,
  Product, InsertProduct,
  Category, InsertCategory,
  ProductImage, InsertProductImage,
  Setting, InsertSetting,
  Contact, InsertContact,
  Faq, InsertFaq,
  Appointment, InsertAppointment,
  Subscriber, InsertSubscriber,
  VisitorStat, InsertVisitorStat,
  Notification, InsertNotification,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  ShippingZone, InsertShippingZone,
  ShippingRate, InsertShippingRate,
  Location, InsertLocation,
  AllowedCity, InsertAllowedCity,
  Cart, InsertCart,
  CartItem, InsertCartItem
} from "@shared/schema";
import { eq, desc, and, or, like, gte, lte, sql, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage {
  public sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.displayOrder);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();
    return category || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount > 0;
  }

  // Product Images methods
  async getProductImages(productId: number): Promise<ProductImage[]> {
    return await db.select().from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(productImages.displayOrder);
  }

  async createProductImage(insertProductImage: InsertProductImage): Promise<ProductImage> {
    const [productImage] = await db.insert(productImages).values(insertProductImage).returning();
    return productImage;
  }

  async deleteProductImage(id: number): Promise<boolean> {
    const result = await db.delete(productImages).where(eq(productImages.id, id));
    return result.rowCount > 0;
  }

  // Settings methods
  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings).orderBy(settings.category, settings.key);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async createSetting(insertSetting: InsertSetting): Promise<Setting> {
    const [setting] = await db.insert(settings).values(insertSetting).returning();
    return setting;
  }

  async updateSetting(id: number, updates: Partial<InsertSetting>): Promise<Setting | undefined> {
    const [setting] = await db.update(settings).set(updates).where(eq(settings.id, id)).returning();
    return setting || undefined;
  }

  async deleteSetting(id: number): Promise<boolean> {
    const result = await db.delete(settings).where(eq(settings.id, id));
    return result.rowCount > 0;
  }

  // Contact methods
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || undefined;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return result.rowCount > 0;
  }

  // FAQ methods
  async getFaqs(): Promise<Faq[]> {
    return await db.select().from(faqs).orderBy(faqs.displayOrder);
  }

  async createFaq(insertFaq: InsertFaq): Promise<Faq> {
    const [faq] = await db.insert(faqs).values(insertFaq).returning();
    return faq;
  }

  async updateFaq(id: number, updates: Partial<InsertFaq>): Promise<Faq | undefined> {
    const [faq] = await db.update(faqs).set(updates).where(eq(faqs.id, id)).returning();
    return faq || undefined;
  }

  async deleteFaq(id: number): Promise<boolean> {
    const result = await db.delete(faqs).where(eq(faqs.id, id));
    return result.rowCount > 0;
  }

  // Appointment methods
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [appointment] = await db.update(appointments).set(updates).where(eq(appointments.id, id)).returning();
    return appointment || undefined;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return result.rowCount > 0;
  }

  // Subscriber methods
  async getSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
  }

  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await db.insert(subscribers).values(insertSubscriber).returning();
    return subscriber;
  }

  async deleteSubscriber(id: number): Promise<boolean> {
    const result = await db.delete(subscribers).where(eq(subscribers.id, id));
    return result.rowCount > 0;
  }

  // Visitor Stats methods
  async getVisitorStats(): Promise<VisitorStat[]> {
    return await db.select().from(visitorStats).orderBy(desc(visitorStats.createdAt));
  }

  async createVisitorStat(insertVisitorStat: InsertVisitorStat): Promise<VisitorStat> {
    const [visitorStat] = await db.insert(visitorStats).values(insertVisitorStat).returning();
    return visitorStat;
  }

  // Notification methods
  async getNotifications(userId?: number): Promise<Notification[]> {
    const query = db.select().from(notifications);
    if (userId) {
      return await query.where(eq(notifications.userId, userId)).orderBy(desc(notifications.created_at));
    }
    return await query.orderBy(desc(notifications.created_at));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
    return result.rowCount > 0;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return result.rowCount > 0;
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const [order] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return order || undefined;
  }

  async deleteOrder(id: number): Promise<boolean> {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return result.rowCount > 0;
  }

  // Order Items methods
  async getOrderItems(orderId?: number): Promise<OrderItem[]> {
    const query = db.select().from(orderItems);
    if (orderId) {
      return await query.where(eq(orderItems.orderId, orderId));
    }
    return await query.orderBy(desc(orderItems.createdAt));
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(insertOrderItem).returning();
    return orderItem;
  }

  async deleteOrderItem(id: number): Promise<boolean> {
    const result = await db.delete(orderItems).where(eq(orderItems.id, id));
    return result.rowCount > 0;
  }

  // Shipping methods
  async getShippingZones(): Promise<ShippingZone[]> {
    return await db.select().from(shippingZones).orderBy(desc(shippingZones.createdAt));
  }

  async createShippingZone(insertShippingZone: InsertShippingZone): Promise<ShippingZone> {
    const [shippingZone] = await db.insert(shippingZones).values(insertShippingZone).returning();
    return shippingZone;
  }

  async getShippingRates(): Promise<ShippingRate[]> {
    return await db.select().from(shippingRates).orderBy(desc(shippingRates.createdAt));
  }

  async createShippingRate(insertShippingRate: InsertShippingRate): Promise<ShippingRate> {
    const [shippingRate] = await db.insert(shippingRates).values(insertShippingRate).returning();
    return shippingRate;
  }

  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations).orderBy(desc(locations.createdAt));
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db.insert(locations).values(insertLocation).returning();
    return location;
  }

  async getAllowedCities(): Promise<AllowedCity[]> {
    return await db.select().from(allowedCities).orderBy(allowedCities.province, allowedCities.cityName);
  }

  async createAllowedCity(insertAllowedCity: InsertAllowedCity): Promise<AllowedCity> {
    const [allowedCity] = await db.insert(allowedCities).values(insertAllowedCity).returning();
    return allowedCity;
  }

  // Cart methods
  async getCarts(): Promise<Cart[]> {
    return await db.select().from(carts).orderBy(desc(carts.createdAt));
  }

  async getCart(id: number): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.id, id));
    return cart || undefined;
  }

  async getCartByUser(userId: number): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    return cart || undefined;
  }

  async getCartBySession(sessionId: string): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.sessionId, sessionId));
    return cart || undefined;
  }

  async createCart(insertCart: InsertCart): Promise<Cart> {
    const [cart] = await db.insert(carts).values(insertCart).returning();
    return cart;
  }

  async updateCart(id: number, updates: Partial<InsertCart>): Promise<Cart | undefined> {
    const [cart] = await db.update(carts).set(updates).where(eq(carts.id, id)).returning();
    return cart || undefined;
  }

  async deleteCart(id: number): Promise<boolean> {
    const result = await db.delete(carts).where(eq(carts.id, id));
    return result.rowCount > 0;
  }

  // Cart Items methods
  async getCartItems(cartId?: number): Promise<CartItem[]> {
    const query = db.select().from(cartItems);
    if (cartId) {
      return await query.where(eq(cartItems.cartId, cartId));
    }
    return await query.orderBy(desc(cartItems.addedAt));
  }

  async getCartItem(id: number): Promise<CartItem | undefined> {
    const [cartItem] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return cartItem || undefined;
  }

  async createCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    const [cartItem] = await db.insert(cartItems).values(insertCartItem).returning();
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [cartItem] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return cartItem || undefined;
  }

  async removeCartItem(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.rowCount > 0;
  }

  async clearCart(cartId: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    return result.rowCount >= 0;
  }
}