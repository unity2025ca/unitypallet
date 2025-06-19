var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  allowedCities: () => allowedCities,
  appointments: () => appointments,
  cartItems: () => cartItems,
  carts: () => carts,
  categories: () => categories,
  categoryEnum: () => categoryEnum,
  categoryMap: () => categoryMap,
  contacts: () => contacts,
  customerRegistrationSchema: () => customerRegistrationSchema,
  faqs: () => faqs,
  insertAllowedCitySchema: () => insertAllowedCitySchema,
  insertAppointmentSchema: () => insertAppointmentSchema,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCartSchema: () => insertCartSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertContactSchema: () => insertContactSchema,
  insertFaqSchema: () => insertFaqSchema,
  insertLocationSchema: () => insertLocationSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertProductImageSchema: () => insertProductImageSchema,
  insertProductSchema: () => insertProductSchema,
  insertSettingSchema: () => insertSettingSchema,
  insertShippingRateSchema: () => insertShippingRateSchema,
  insertShippingZoneSchema: () => insertShippingZoneSchema,
  insertSubscriberSchema: () => insertSubscriberSchema,
  insertUserSchema: () => insertUserSchema,
  insertVisitorStatsSchema: () => insertVisitorStatsSchema,
  locations: () => locations,
  loginSchema: () => loginSchema,
  notificationTypeEnum: () => notificationTypeEnum,
  notifications: () => notifications,
  orderItems: () => orderItems,
  orderStatusEnum: () => orderStatusEnum,
  orders: () => orders,
  paymentStatusEnum: () => paymentStatusEnum,
  productImages: () => productImages,
  products: () => products,
  settings: () => settings,
  shippingRates: () => shippingRates,
  shippingZones: () => shippingZones,
  statusEnum: () => statusEnum,
  statusMap: () => statusMap,
  subscribers: () => subscribers,
  users: () => users,
  visitorStats: () => visitorStats
});
import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, insertUserSchema, customerRegistrationSchema, categories, insertCategorySchema, categoryEnum, statusEnum, products, insertProductSchema, productImages, insertProductImageSchema, contacts, insertContactSchema, subscribers, insertSubscriberSchema, faqs, insertFaqSchema, loginSchema, categoryMap, statusMap, settings, insertSettingSchema, appointments, insertAppointmentSchema, visitorStats, insertVisitorStatsSchema, notificationTypeEnum, notifications, insertNotificationSchema, orderStatusEnum, paymentStatusEnum, orders, insertOrderSchema, orderItems, insertOrderItemSchema, carts, insertCartSchema, cartItems, insertCartItemSchema, shippingZones, insertShippingZoneSchema, shippingRates, insertShippingRateSchema, locations, insertLocationSchema, allowedCities, insertAllowedCitySchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      email: text("email"),
      fullName: text("full_name"),
      phone: text("phone"),
      isAdmin: boolean("is_admin").default(false),
      roleType: text("role_type").default("user"),
      stripeCustomerId: text("stripe_customer_id"),
      stripeSubscriptionId: text("stripe_subscription_id"),
      address: text("address"),
      city: text("city"),
      postalCode: text("postal_code"),
      country: text("country"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true
    });
    customerRegistrationSchema = createInsertSchema(users).pick({
      username: true,
      password: true,
      email: true,
      fullName: true,
      phone: true,
      address: true,
      city: true,
      postalCode: true,
      country: true
    }).extend({
      confirmPassword: z.string()
    });
    categories = pgTable("categories", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      nameAr: text("name_ar").notNull(),
      slug: text("slug").notNull().unique(),
      description: text("description"),
      descriptionAr: text("description_ar"),
      displayOrder: integer("display_order").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertCategorySchema = createInsertSchema(categories).omit({
      id: true,
      createdAt: true
    });
    categoryEnum = pgEnum("category", [
      "electronics",
      "home",
      "toys",
      "mixed",
      "other"
    ]);
    statusEnum = pgEnum("status", [
      "available",
      "limited",
      "soldout"
    ]);
    products = pgTable("products", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      titleAr: text("title_ar").notNull(),
      description: text("description").notNull(),
      descriptionAr: text("description_ar").notNull(),
      category: categoryEnum("category").notNull(),
      status: statusEnum("status").default("available"),
      price: integer("price").notNull(),
      // Price in Canadian dollars
      imageUrl: text("image_url").notNull(),
      // Main product image (for backward compatibility)
      displayOrder: integer("display_order").default(0),
      // Display order for sorting products
      createdAt: timestamp("created_at").defaultNow()
    });
    insertProductSchema = createInsertSchema(products).omit({
      id: true,
      createdAt: true
    });
    productImages = pgTable("product_images", {
      id: serial("id").primaryKey(),
      productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
      imageUrl: text("image_url").notNull(),
      isMain: boolean("is_main").default(false),
      // Whether this is the main product image
      displayOrder: integer("display_order").default(0),
      // Order to display images
      createdAt: timestamp("created_at").defaultNow()
    });
    insertProductImageSchema = createInsertSchema(productImages).omit({
      id: true,
      createdAt: true
    });
    contacts = pgTable("contacts", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull(),
      phone: text("phone").notNull(),
      message: text("message").notNull(),
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertContactSchema = createInsertSchema(contacts).omit({
      id: true,
      createdAt: true
    });
    subscribers = pgTable("subscribers", {
      id: serial("id").primaryKey(),
      email: text("email").unique(),
      // Made optional but still unique
      phone: text("phone"),
      // Phone number in international format (e.g. +1234567890)
      createdAt: timestamp("created_at").defaultNow()
    });
    insertSubscriberSchema = createInsertSchema(subscribers).omit({
      id: true,
      createdAt: true
    });
    faqs = pgTable("faqs", {
      id: serial("id").primaryKey(),
      question: text("question").notNull(),
      answer: text("answer").notNull(),
      displayOrder: integer("display_order").default(0),
      // Order to display FAQs
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertFaqSchema = createInsertSchema(faqs).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    loginSchema = z.object({
      username: z.string().min(3, "Username is required"),
      password: z.string().min(6, "Password is required")
    });
    categoryMap = {
      electronics: "Electronics",
      home: "Home",
      toys: "Toys",
      mixed: "Mixed",
      other: "Other"
    };
    statusMap = {
      available: "Available",
      limited: "Limited",
      soldout: "Sold Out"
    };
    settings = pgTable("settings", {
      id: serial("id").primaryKey(),
      key: text("key").notNull().unique(),
      value: text("value").notNull(),
      category: text("category").notNull(),
      // e.g., "appearance", "content", "contact"
      label: text("label").notNull(),
      // Human-readable label for UI
      description: text("description"),
      // Optional description for UI
      type: text("type").notNull(),
      // e.g., "text", "color", "image", "boolean"
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertSettingSchema = createInsertSchema(settings).omit({
      id: true,
      updatedAt: true
    });
    appointments = pgTable("appointments", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull(),
      phone: text("phone").notNull(),
      date: text("date").notNull(),
      time: text("time").notNull(),
      message: text("message"),
      status: text("status").default("pending"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertAppointmentSchema = createInsertSchema(appointments).omit({
      id: true,
      status: true,
      createdAt: true
    });
    visitorStats = pgTable("visitor_stats", {
      id: serial("id").primaryKey(),
      visitDate: timestamp("visit_date").notNull().defaultNow(),
      pageUrl: text("page_url").notNull(),
      visitorIp: text("visitor_ip").notNull(),
      userAgent: text("user_agent"),
      referrer: text("referrer"),
      countryCode: text("country_code"),
      deviceType: text("device_type"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertVisitorStatsSchema = createInsertSchema(visitorStats, {
      id: void 0,
      createdAt: void 0
    });
    notificationTypeEnum = pgEnum("notification_type", [
      "new_contact",
      "new_appointment",
      "status_update"
    ]);
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      type: notificationTypeEnum("type").notNull(),
      title: text("title").notNull(),
      message: text("message").notNull(),
      relatedId: integer("related_id"),
      isRead: boolean("is_read").default(false),
      created_at: timestamp("created_at").defaultNow()
    });
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      created_at: true
    });
    orderStatusEnum = pgEnum("order_status", [
      "pending",
      "processing",
      "completed",
      "cancelled",
      "refunded"
    ]);
    paymentStatusEnum = pgEnum("payment_status", [
      "pending",
      "paid",
      "failed",
      "refunded"
    ]);
    orders = pgTable("orders", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      status: orderStatusEnum("status").default("pending"),
      paymentStatus: paymentStatusEnum("payment_status").default("pending"),
      paymentIntentId: text("payment_intent_id"),
      subtotal: integer("subtotal").notNull().default(0),
      // Subtotal without shipping
      shippingCost: integer("shipping_cost").notNull().default(0),
      // Shipping cost
      total: integer("total").notNull(),
      // Total including shipping
      shippingAddress: text("shipping_address"),
      shippingCity: text("shipping_city"),
      shippingPostalCode: text("shipping_postal_code"),
      shippingCountry: text("shipping_country"),
      shippingProvince: text("shipping_province"),
      // Added province field
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertOrderSchema = createInsertSchema(orders).omit({
      id: true,
      paymentIntentId: true,
      createdAt: true,
      updatedAt: true
    });
    orderItems = pgTable("order_items", {
      id: serial("id").primaryKey(),
      orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
      productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
      quantity: integer("quantity").notNull(),
      pricePerUnit: integer("price_per_unit").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertOrderItemSchema = createInsertSchema(orderItems).omit({
      id: true,
      createdAt: true
    });
    carts = pgTable("carts", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      sessionId: text("session_id"),
      // For non-logged-in users
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertCartSchema = createInsertSchema(carts).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    cartItems = pgTable("cart_items", {
      id: serial("id").primaryKey(),
      cartId: integer("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
      productId: integer("product_id").notNull().references(() => products.id),
      quantity: integer("quantity").notNull().default(1),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertCartItemSchema = createInsertSchema(cartItems).omit({
      id: true,
      createdAt: true
    });
    shippingZones = pgTable("shipping_zones", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      maxDistanceLimit: integer("max_distance_limit").default(0),
      // 0 means no limit, otherwise max shipping distance in km
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertShippingZoneSchema = createInsertSchema(shippingZones).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    shippingRates = pgTable("shipping_rates", {
      id: serial("id").primaryKey(),
      zoneId: integer("zone_id").notNull().references(() => shippingZones.id, { onDelete: "cascade" }),
      minDistance: integer("min_distance").notNull(),
      // in kilometers
      maxDistance: integer("max_distance").notNull(),
      // in kilometers
      baseRate: integer("base_rate").notNull(),
      // Base shipping rate in cents
      additionalRatePerKm: integer("additional_rate_per_km").notNull(),
      // Additional rate per km in cents
      minWeight: integer("min_weight"),
      // in grams, optional
      maxWeight: integer("max_weight"),
      // in grams, optional
      additionalRatePerKg: integer("additional_rate_per_kg").default(0),
      // Additional rate per kg in cents
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertShippingRateSchema = createInsertSchema(shippingRates).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    locations = pgTable("locations", {
      id: serial("id").primaryKey(),
      city: text("city").notNull(),
      province: text("province").notNull(),
      country: text("country").notNull().default("Canada"),
      postalCode: text("postal_code"),
      latitude: text("latitude").notNull(),
      longitude: text("longitude").notNull(),
      isWarehouse: boolean("is_warehouse").default(false),
      // Is this a warehouse/fulfillment center
      zoneId: integer("zone_id").references(() => shippingZones.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertLocationSchema = createInsertSchema(locations).omit({
      id: true,
      createdAt: true
    });
    allowedCities = pgTable("allowed_cities", {
      id: serial("id").primaryKey(),
      cityName: text("city_name").notNull().unique(),
      province: text("province").notNull(),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    insertAllowedCitySchema = createInsertSchema(allowedCities).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq, asc, and, desc, sql, lte, gte, or } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_db();
    DatabaseStorage = class {
      sessionStore;
      constructor() {
        const PostgresSessionStore = connectPg(session);
        this.sessionStore = new PostgresSessionStore({
          pool,
          createTableIfMissing: true
        });
        this.initializeDatabase();
      }
      // User methods
      async getUser(id) {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result[0];
      }
      async getUserByUsername(username) {
        const result = await db.select().from(users).where(eq(users.username, username));
        return result[0];
      }
      async createUser(insertUser) {
        if (insertUser.isAdmin && !insertUser.roleType) {
          insertUser.roleType = "admin";
        } else if (!insertUser.roleType) {
          insertUser.roleType = "user";
        }
        const result = await db.insert(users).values(insertUser).returning();
        return result[0];
      }
      async getAllUsers() {
        return db.select().from(users).orderBy(asc(users.id));
      }
      async updateUser(id, userData) {
        const result = await db.update(users).set(userData).where(eq(users.id, id)).returning();
        return result[0];
      }
      async deleteUser(id) {
        const result = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
        return result.length > 0;
      }
      // Category methods
      async getAllCategories() {
        return db.select().from(categories).orderBy(asc(categories.displayOrder), asc(categories.id));
      }
      async getCategoryById(id) {
        const result = await db.select().from(categories).where(eq(categories.id, id));
        return result[0];
      }
      async getCategoryBySlug(slug) {
        const result = await db.select().from(categories).where(eq(categories.slug, slug));
        return result[0];
      }
      async createCategory(category) {
        const result = await db.insert(categories).values(category).returning();
        return result[0];
      }
      async updateCategory(id, categoryData) {
        const result = await db.update(categories).set(categoryData).where(eq(categories.id, id)).returning();
        return result[0];
      }
      async deleteCategory(id) {
        const result = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
        return result.length > 0;
      }
      // Product methods
      async getAllProducts() {
        return db.select().from(products).orderBy(asc(products.displayOrder), asc(products.id));
      }
      async getProductById(id) {
        const result = await db.select().from(products).where(eq(products.id, id));
        return result[0];
      }
      async getProductsByCategory(category) {
        const validCategory = category;
        return db.select().from(products).where(eq(products.category, validCategory)).orderBy(asc(products.displayOrder), asc(products.id));
      }
      async createProduct(product) {
        const result = await db.insert(products).values(product).returning();
        return result[0];
      }
      async updateProduct(id, productData) {
        const result = await db.update(products).set(productData).where(eq(products.id, id)).returning();
        return result[0];
      }
      async deleteProduct(id) {
        const result = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
        return result.length > 0;
      }
      // Product Images methods
      async getProductImages(productId) {
        return db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(asc(productImages.displayOrder), asc(productImages.id));
      }
      async getProductMainImage(productId) {
        const mainImage = await db.select().from(productImages).where(and(
          eq(productImages.productId, productId),
          eq(productImages.isMain, true)
        ));
        if (mainImage.length > 0) {
          return mainImage[0];
        }
        const images = await db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(asc(productImages.displayOrder), asc(productImages.id)).limit(1);
        return images[0];
      }
      async getProductImageById(imageId) {
        const result = await db.select().from(productImages).where(eq(productImages.id, imageId));
        return result[0];
      }
      async addProductImage(productImage) {
        const existingImages = await this.getProductImages(productImage.productId);
        if (existingImages.length === 0) {
          productImage.isMain = true;
        }
        const result = await db.insert(productImages).values(productImage).returning();
        return result[0];
      }
      async setMainProductImage(productId, imageId) {
        await db.update(productImages).set({ isMain: false }).where(eq(productImages.productId, productId));
        const result = await db.update(productImages).set({ isMain: true }).where(and(
          eq(productImages.id, imageId),
          eq(productImages.productId, productId)
        )).returning();
        if (result.length > 0) {
          const mainImageUrl = result[0].imageUrl;
          await db.update(products).set({ imageUrl: mainImageUrl }).where(eq(products.id, productId));
          return true;
        }
        return false;
      }
      async deleteProductImage(imageId) {
        const imageToDelete = await db.select().from(productImages).where(eq(productImages.id, imageId));
        if (imageToDelete.length === 0) {
          return false;
        }
        const { productId, isMain } = imageToDelete[0];
        const result = await db.delete(productImages).where(eq(productImages.id, imageId)).returning({ id: productImages.id });
        if (isMain) {
          const remainingImages = await db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(asc(productImages.displayOrder), asc(productImages.id)).limit(1);
          if (remainingImages.length > 0) {
            await this.setMainProductImage(productId, remainingImages[0].id);
          }
        }
        return result.length > 0;
      }
      // Contact methods
      async createContact(contact) {
        const result = await db.insert(contacts).values(contact).returning();
        return result[0];
      }
      async getAllContacts() {
        return db.select().from(contacts).orderBy(asc(contacts.id));
      }
      async getContactById(id) {
        const result = await db.select().from(contacts).where(eq(contacts.id, id));
        return result[0];
      }
      async updateContactReadStatus(id, isRead) {
        const result = await db.update(contacts).set({ isRead }).where(eq(contacts.id, id)).returning();
        return result[0];
      }
      async deleteContact(id) {
        const result = await db.delete(contacts).where(eq(contacts.id, id)).returning({ id: contacts.id });
        return result.length > 0;
      }
      // Subscriber methods
      async createSubscriber(subscriber) {
        try {
          if (subscriber.phone && (!subscriber.email || subscriber.email.trim() === "")) {
            const existingWithPhone = await db.select().from(subscribers).where(eq(subscribers.phone, subscriber.phone));
            if (existingWithPhone.length > 0) {
              return existingWithPhone[0];
            }
            const timestamp2 = (/* @__PURE__ */ new Date()).getTime();
            subscriber.email = `phone_subscriber_${timestamp2}@placeholder.com`;
          } else if (subscriber.email && subscriber.phone) {
            const existingWithEmail = await db.select().from(subscribers).where(eq(subscribers.email, subscriber.email));
            if (existingWithEmail.length > 0) {
              const existing = existingWithEmail[0];
              if (!existing.phone) {
                await this.updateSubscriber(existing.id, { phone: subscriber.phone });
                return { ...existing, phone: subscriber.phone };
              }
              return existing;
            }
            const existingWithPhone = await db.select().from(subscribers).where(eq(subscribers.phone, subscriber.phone));
            if (existingWithPhone.length > 0) {
              const existing = existingWithPhone[0];
              if (existing.email && existing.email.includes("phone_subscriber_")) {
                await this.updateSubscriber(existing.id, { email: subscriber.email });
                return { ...existing, email: subscriber.email };
              }
              return existing;
            }
          } else if (subscriber.email) {
            const existingWithEmail = await db.select().from(subscribers).where(eq(subscribers.email, subscriber.email));
            if (existingWithEmail.length > 0) {
              return existingWithEmail[0];
            }
          }
          const result = await db.insert(subscribers).values(subscriber).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating subscriber:", error);
          if (subscriber.email) {
            const existingSubscriber = await db.select().from(subscribers).where(eq(subscribers.email, subscriber.email));
            if (existingSubscriber.length > 0) {
              return existingSubscriber[0];
            }
          }
          throw error;
        }
      }
      async getAllSubscribers() {
        return db.select().from(subscribers).orderBy(asc(subscribers.id));
      }
      async updateSubscriber(id, data) {
        const result = await db.update(subscribers).set(data).where(eq(subscribers.id, id)).returning();
        return result[0];
      }
      // Settings methods
      async getSetting(key) {
        const result = await db.select().from(settings).where(eq(settings.key, key));
        return result[0];
      }
      async getAllSettings() {
        return db.select().from(settings).orderBy(asc(settings.id));
      }
      async getSettingsByCategory(category) {
        const result = await db.select().from(settings).where(eq(settings.category, category));
        return result;
      }
      async updateSetting(key, value) {
        const result = await db.update(settings).set({
          value,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(settings.key, key)).returning();
        return result[0];
      }
      async createSetting(setting) {
        const result = await db.insert(settings).values(setting).returning();
        return result[0];
      }
      // FAQ methods
      async getAllFaqs() {
        return db.select().from(faqs).orderBy(asc(faqs.displayOrder), asc(faqs.id));
      }
      async getFaqById(id) {
        const result = await db.select().from(faqs).where(eq(faqs.id, id));
        return result[0];
      }
      async createFaq(faq) {
        const result = await db.insert(faqs).values(faq).returning();
        return result[0];
      }
      async updateFaq(id, faqData) {
        const result = await db.update(faqs).set({
          ...faqData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(faqs.id, id)).returning();
        return result[0];
      }
      async deleteFaq(id) {
        const result = await db.delete(faqs).where(eq(faqs.id, id)).returning({ id: faqs.id });
        return result.length > 0;
      }
      // Appointment methods
      async createAppointment(appointment) {
        const result = await db.insert(appointments).values(appointment).returning();
        return result[0];
      }
      async getAllAppointments() {
        return db.select().from(appointments).orderBy(desc(appointments.createdAt));
      }
      async getAppointmentById(id) {
        const result = await db.select().from(appointments).where(eq(appointments.id, id));
        return result[0];
      }
      async updateAppointmentStatus(id, status) {
        const result = await db.update(appointments).set({ status }).where(eq(appointments.id, id)).returning();
        return result[0];
      }
      async deleteAppointment(id) {
        const result = await db.delete(appointments).where(eq(appointments.id, id)).returning({ id: appointments.id });
        return result.length > 0;
      }
      // Initialize the database with sample data if it's empty
      async initializeDatabase() {
        const adminExists = await this.getUserByUsername("admin");
        if (!adminExists) {
          await this.createUser({
            username: "admin",
            password: "admin123",
            // In a real app, this would be hashed
            isAdmin: true
          });
        }
        const publisherExists = await this.getUserByUsername("publisher");
        if (!publisherExists) {
          await this.createUser({
            username: "publisher",
            password: "publisher123",
            // In a real app, this would be hashed
            isAdmin: false,
            // Publishers are not admins
            roleType: "publisher"
            // Set publisher role explicitly
          });
        }
        const productsExist = await this.getAllProducts();
        if (productsExist.length === 0) {
          await this.seedProducts();
        }
        const settings2 = await this.getAllSettings();
        if (settings2.length === 0) {
          await this.seedSettings();
        }
      }
      // Seed default settings
      async seedSettings() {
        const defaultSettings = [
          // Appearance settings
          {
            key: "site_logo",
            value: "https://images.unsplash.com/photo-1586892477838-2b96e85e0f96?w=200",
            category: "appearance",
            label: "\u0634\u0639\u0627\u0631 \u0627\u0644\u0645\u0648\u0642\u0639",
            type: "image"
          },
          {
            key: "primary_color",
            value: "#16a34a",
            category: "appearance",
            label: "\u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
            type: "color"
          },
          {
            key: "secondary_color",
            value: "#0f766e",
            category: "appearance",
            label: "\u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u062B\u0627\u0646\u0648\u064A",
            type: "color"
          },
          {
            key: "font_family",
            value: "Tajawal, sans-serif",
            category: "appearance",
            label: "\u0646\u0648\u0639 \u0627\u0644\u062E\u0637",
            type: "select"
          },
          // Content settings
          {
            key: "site_name",
            value: "\u0648\u062D\u062F\u0629",
            category: "content",
            label: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0648\u0642\u0639",
            type: "text"
          },
          {
            key: "site_description",
            value: "\u0645\u0648\u0642\u0639 \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0628\u064A\u0639 \u0628\u0627\u0644\u0627\u062A \u0623\u0645\u0627\u0632\u0648\u0646 \u0627\u0644\u0645\u0631\u062A\u062C\u0639\u0629",
            category: "content",
            label: "\u0648\u0635\u0641 \u0627\u0644\u0645\u0648\u0642\u0639",
            type: "textarea"
          },
          {
            key: "hero_title",
            value: "\u0623\u0641\u0636\u0644 \u0628\u0627\u0644\u0627\u062A \u0623\u0645\u0627\u0632\u0648\u0646 \u0627\u0644\u0645\u0631\u062A\u062C\u0639\u0629",
            category: "content",
            label: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
            type: "text"
          },
          {
            key: "hero_subtitle",
            value: "\u0627\u0643\u062A\u0634\u0641 \u0645\u062C\u0645\u0648\u0639\u0629 \u0645\u062A\u0646\u0648\u0639\u0629 \u0645\u0646 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0628\u0623\u0633\u0639\u0627\u0631 \u0645\u0645\u064A\u0632\u0629",
            category: "content",
            label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0641\u0631\u0639\u064A \u0644\u0644\u0642\u0633\u0645 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
            type: "text"
          },
          // Contact settings
          {
            key: "contact_email",
            value: "info@unity-pallets.com",
            category: "contact",
            label: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0644\u0644\u062A\u0648\u0627\u0635\u0644",
            type: "email"
          },
          {
            key: "contact_phone",
            value: "+966-5XXXXXXXX",
            category: "contact",
            label: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0644\u0644\u062A\u0648\u0627\u0635\u0644",
            type: "tel"
          },
          {
            key: "instagram",
            value: "unity.pallets",
            category: "social",
            label: "\u062D\u0633\u0627\u0628 \u0627\u0646\u0633\u062A\u063A\u0631\u0627\u0645",
            type: "text"
          },
          {
            key: "twitter",
            value: "unitypallets",
            category: "social",
            label: "\u062D\u0633\u0627\u0628 \u062A\u0648\u064A\u062A\u0631",
            type: "text"
          }
        ];
        for (const setting of defaultSettings) {
          await this.createSetting(setting);
        }
      }
      // Seed sample products
      async seedProducts() {
        const sampleProducts = [
          {
            title: "Electronics Pallet",
            titleAr: "\u0628\u0627\u0644\u0629 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0645\u062A\u0646\u0648\u0639\u0629",
            description: "Contains headphones, chargers, and various electronic accessories.",
            descriptionAr: "\u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0633\u0645\u0627\u0639\u0627\u062A\u060C \u0623\u062C\u0647\u0632\u0629 \u0634\u062D\u0646\u060C \u0648\u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 \u0645\u062A\u0646\u0648\u0639\u0629.",
            category: "electronics",
            status: "available",
            price: 2500,
            imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
          },
          {
            title: "Home Appliances Pallet",
            titleAr: "\u0628\u0627\u0644\u0629 \u0623\u062F\u0648\u0627\u062A \u0645\u0646\u0632\u0644\u064A\u0629",
            description: "Contains kitchen tools, home accessories, and cleaning supplies.",
            descriptionAr: "\u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0623\u062F\u0648\u0627\u062A \u0645\u0637\u0628\u062E\u060C \u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A \u0645\u0646\u0632\u0644\u064A\u0629\u060C \u0648\u0623\u062F\u0648\u0627\u062A \u062A\u0646\u0638\u064A\u0641.",
            category: "home",
            status: "limited",
            price: 1800,
            imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c"
          },
          {
            title: "Toys and Gifts Pallet",
            titleAr: "\u0628\u0627\u0644\u0629 \u0623\u0644\u0639\u0627\u0628 \u0648\u0647\u062F\u0627\u064A\u0627",
            description: "Contains children's toys, educational toys, and electronic games.",
            descriptionAr: "\u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0623\u0644\u0639\u0627\u0628 \u0623\u0637\u0641\u0627\u0644\u060C \u0623\u0644\u0639\u0627\u0628 \u062A\u0639\u0644\u064A\u0645\u064A\u0629\u060C \u0648\u0623\u0644\u0639\u0627\u0628 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629.",
            category: "toys",
            status: "available",
            price: 3200,
            imageUrl: "https://images.unsplash.com/photo-1637159125357-4ca13ef3316b"
          },
          {
            title: "Mixed Accessories Pallet",
            titleAr: "\u0628\u0627\u0644\u0629 \u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A \u0645\u062A\u0646\u0648\u0639\u0629",
            description: "Contains phone accessories, bags, and various merchandise.",
            descriptionAr: "\u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A \u0644\u0644\u0647\u0648\u0627\u062A\u0641\u060C \u062D\u0642\u0627\u0626\u0628\u060C \u0648\u0633\u0644\u0639 \u0645\u062A\u0646\u0648\u0639\u0629.",
            category: "mixed",
            status: "soldout",
            price: 2e3,
            imageUrl: "https://images.unsplash.com/photo-1545127398-14699f92334b"
          }
        ];
        for (const product of sampleProducts) {
          await this.createProduct(product);
        }
      }
      // Visitor Stats Methods
      async addVisitorStat(stat) {
        const result = await db.insert(visitorStats).values(stat).returning();
        return result[0];
      }
      async getVisitorStatsByDate(startDate, endDate) {
        return db.select().from(visitorStats).where(
          and(
            // Using >= for start date and < for end date to get inclusive start, exclusive end
            sql`${visitorStats.visitDate} >= ${startDate.toISOString()}`,
            sql`${visitorStats.visitDate} < ${endDate.toISOString()}`
          )
        ).orderBy(desc(visitorStats.visitDate));
      }
      async getVisitorStatsCount() {
        const result = await db.select({ count: sql`count(*)` }).from(visitorStats);
        return result[0]?.count || 0;
      }
      async getPageViewsByUrl() {
        const result = await db.select({
          url: visitorStats.pageUrl,
          count: sql`count(*)`
        }).from(visitorStats).groupBy(visitorStats.pageUrl).orderBy(desc(sql`count(*)`));
        return result;
      }
      async getVisitorStatsByDateRange(days) {
        const endDate = /* @__PURE__ */ new Date();
        const startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - days);
        const result = await db.select({
          date: sql`to_char(${visitorStats.visitDate}, 'YYYY-MM-DD')`,
          count: sql`count(*)`
        }).from(visitorStats).where(
          and(
            sql`${visitorStats.visitDate} >= ${startDate.toISOString()}`,
            sql`${visitorStats.visitDate} <= ${endDate.toISOString()}`
          )
        ).groupBy(sql`to_char(${visitorStats.visitDate}, 'YYYY-MM-DD')`).orderBy(asc(sql`to_char(${visitorStats.visitDate}, 'YYYY-MM-DD')`));
        return result;
      }
      async getVisitorStatsByCountry() {
        const result = await db.select({
          country: visitorStats.countryCode,
          count: sql`count(*)`
        }).from(visitorStats).where(sql`${visitorStats.countryCode} IS NOT NULL`).groupBy(visitorStats.countryCode).orderBy(desc(sql`count(*)`));
        return result.filter((item) => item.country !== null).map((item) => ({
          country: item.country || "Unknown",
          count: item.count
        }));
      }
      async getVisitorStatsByDevice() {
        const result = await db.select({
          device: visitorStats.deviceType,
          count: sql`count(*)`
        }).from(visitorStats).where(sql`${visitorStats.deviceType} IS NOT NULL`).groupBy(visitorStats.deviceType).orderBy(desc(sql`count(*)`));
        return result.filter((item) => item.device !== null).map((item) => ({
          device: item.device || "Unknown",
          count: item.count
        }));
      }
      // Notification methods
      async createNotification(notification) {
        const result = await db.insert(notifications).values(notification).returning();
        return result[0];
      }
      async getNotificationsByUserId(userId) {
        return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.created_at));
      }
      async getUnreadNotificationsByUserId(userId) {
        return db.select().from(notifications).where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )).orderBy(desc(notifications.created_at));
      }
      async markNotificationAsRead(id) {
        const result = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
        return result.length > 0;
      }
      async markAllNotificationsAsRead(userId) {
        const result = await db.update(notifications).set({ isRead: true }).where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )).returning();
        return result.length > 0;
      }
      async deleteNotification(id) {
        const result = await db.delete(notifications).where(eq(notifications.id, id)).returning({ id: notifications.id });
        return result.length > 0;
      }
      // Order methods
      async createOrder(orderData) {
        try {
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
              "pending",
              "pending",
              orderData.shippingAddress || "",
              orderData.shippingCity || "",
              orderData.shippingPostalCode || "",
              orderData.shippingCountry || "",
              orderData.notes || ""
            ]
          );
          return result.rows[0];
        } catch (error) {
          console.error("Error creating order:", error);
          throw error;
        }
      }
      async getOrderById(id) {
        try {
          const [order] = await db.select().from(orders).where(eq(orders.id, id));
          return order;
        } catch (error) {
          console.error("Error getting order by ID:", error);
          throw error;
        }
      }
      async getOrdersByCustomerId(userId) {
        try {
          return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
        } catch (error) {
          console.error("Error getting orders by customer ID:", error);
          throw error;
        }
      }
      async updateOrderStatus(id, status) {
        try {
          const validStatus = status;
          const [updatedOrder] = await db.update(orders).set({ status: validStatus }).where(eq(orders.id, id)).returning();
          return updatedOrder;
        } catch (error) {
          console.error("Error updating order status:", error);
          throw error;
        }
      }
      async updateOrderPaymentStatus(id, paymentStatus) {
        try {
          const validPaymentStatus = paymentStatus;
          const [updatedOrder] = await db.update(orders).set({ paymentStatus: validPaymentStatus }).where(eq(orders.id, id)).returning();
          return updatedOrder;
        } catch (error) {
          console.error("Error updating order payment status:", error);
          throw error;
        }
      }
      async updateOrderPaymentIntent(id, paymentIntentId) {
        try {
          const [updatedOrder] = await db.update(orders).set({ paymentIntentId }).where(eq(orders.id, id)).returning();
          return updatedOrder;
        } catch (error) {
          console.error("Error updating order payment intent ID:", error);
          throw error;
        }
      }
      // Order Item methods
      async createOrderItem(orderItemData) {
        try {
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
          console.error("Error creating order item:", error);
          throw error;
        }
      }
      async getOrderItemsByOrderId(orderId) {
        try {
          return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
        } catch (error) {
          console.error("Error getting order items by order ID:", error);
          throw error;
        }
      }
      // Shipping Zone methods
      async createShippingZone(zoneData) {
        const result = await db.insert(shippingZones).values(zoneData).returning();
        return result[0];
      }
      async getShippingZoneById(id) {
        const result = await db.select().from(shippingZones).where(eq(shippingZones.id, id));
        return result[0];
      }
      async getAllShippingZones() {
        return db.select().from(shippingZones).orderBy(asc(shippingZones.name));
      }
      async updateShippingZone(id, zoneData) {
        const result = await db.update(shippingZones).set({
          ...zoneData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(shippingZones.id, id)).returning();
        return result[0];
      }
      async deleteShippingZone(id) {
        const result = await db.delete(shippingZones).where(eq(shippingZones.id, id)).returning({ id: shippingZones.id });
        return result.length > 0;
      }
      // Shipping Rate methods
      async createShippingRate(rateData) {
        const result = await db.insert(shippingRates).values(rateData).returning();
        return result[0];
      }
      async getShippingRateById(id) {
        const result = await db.select().from(shippingRates).where(eq(shippingRates.id, id));
        return result[0];
      }
      async getShippingRatesByZoneId(zoneId) {
        return db.select().from(shippingRates).where(eq(shippingRates.zoneId, zoneId)).orderBy(asc(shippingRates.minDistance));
      }
      async getAllShippingRates() {
        return db.select().from(shippingRates).orderBy(asc(shippingRates.zoneId), asc(shippingRates.minDistance));
      }
      async updateShippingRate(id, rateData) {
        const result = await db.update(shippingRates).set({
          ...rateData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(shippingRates.id, id)).returning();
        return result[0];
      }
      async deleteShippingRate(id) {
        const result = await db.delete(shippingRates).where(eq(shippingRates.id, id)).returning({ id: shippingRates.id });
        return result.length > 0;
      }
      // Location methods
      async createLocation(locationData) {
        const result = await db.insert(locations).values(locationData).returning();
        return result[0];
      }
      async getLocationById(id) {
        const result = await db.select().from(locations).where(eq(locations.id, id));
        return result[0];
      }
      async getAllLocations() {
        return db.select().from(locations).orderBy(asc(locations.city), asc(locations.province));
      }
      async getWarehouseLocations() {
        return db.select().from(locations).where(eq(locations.isWarehouse, true)).orderBy(asc(locations.city));
      }
      async updateLocation(id, locationData) {
        const result = await db.update(locations).set(locationData).where(eq(locations.id, id)).returning();
        return result[0];
      }
      async deleteLocation(id) {
        const result = await db.delete(locations).where(eq(locations.id, id)).returning({ id: locations.id });
        return result.length > 0;
      }
      // Calculate shipping cost based on distance
      async calculateShippingCost(fromLocationId, toLocationId, weight = 0) {
        try {
          console.log(`Calculating shipping cost from location ${fromLocationId} to location ${toLocationId} with weight ${weight}g`);
          if (toLocationId === -1) {
            console.log("Using flat rate for temporary location");
            return 3500;
          }
          const fromLocation = await this.getLocationById(fromLocationId);
          const toLocation = await this.getLocationById(toLocationId);
          console.log("From location:", fromLocation ? { id: fromLocation.id, city: fromLocation.city, isWarehouse: fromLocation.isWarehouse, zoneId: fromLocation.zoneId } : "Not found");
          console.log("To location:", toLocation ? { id: toLocation.id, city: toLocation.city, isWarehouse: toLocation.isWarehouse, zoneId: toLocation.zoneId } : "Not found");
          if (!fromLocation) {
            console.error(`From location with id ${fromLocationId} not found`);
            return 3e3;
          }
          if (!toLocation) {
            console.error(`To location with id ${toLocationId} not found`);
            return 3e3;
          }
          if (!fromLocation.latitude || !fromLocation.longitude || !toLocation.latitude || !toLocation.longitude) {
            console.error("Invalid coordinates", {
              fromLocationLat: fromLocation.latitude,
              fromLocationLng: fromLocation.longitude,
              toLocationLat: toLocation.latitude,
              toLocationLng: toLocation.longitude
            });
            return 3e3;
          }
          let zoneId = void 0;
          let maxDistanceLimit = 0;
          if (fromLocation.zoneId && toLocation.zoneId && fromLocation.zoneId === toLocation.zoneId) {
            zoneId = fromLocation.zoneId;
            if (zoneId) {
              const shippingZone = await this.getShippingZoneById(zoneId);
              if (shippingZone && shippingZone.maxDistanceLimit) {
                maxDistanceLimit = shippingZone.maxDistanceLimit;
                console.log(`Zone ${zoneId} has max distance limit of ${maxDistanceLimit}km`);
              }
            }
          } else if (fromLocation.zoneId) {
            const shippingZone = await this.getShippingZoneById(fromLocation.zoneId);
            if (shippingZone && shippingZone.maxDistanceLimit) {
              maxDistanceLimit = shippingZone.maxDistanceLimit;
              console.log(`From location's zone ${fromLocation.zoneId} has max distance limit of ${maxDistanceLimit}km`);
            }
          }
          console.log("Calculating shipping cost between locations:", {
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
          console.error("Error in calculateShippingCost:", error);
          throw error;
        }
      }
      async calculateShippingCostByCoordinates(fromLat, fromLng, toLat, toLng, zoneId, weight = 0, maxDistanceLimit = 0) {
        try {
          if (isNaN(fromLat) || isNaN(fromLng) || isNaN(toLat) || isNaN(toLng)) {
            console.error("Invalid coordinate values:", { fromLat, fromLng, toLat, toLng });
            throw new Error("Invalid coordinate values");
          }
          const R = 6371;
          const dLat = this.deg2rad(toLat - fromLat);
          const dLng = this.deg2rad(toLng - fromLng);
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.deg2rad(fromLat)) * Math.cos(this.deg2rad(toLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          console.log("Calculated distance:", distance, "km");
          if (maxDistanceLimit > 0 && distance > maxDistanceLimit) {
            console.log(`Distance ${distance}km exceeds max distance limit of ${maxDistanceLimit}km`);
            return -1;
          }
          let applicableRates = [];
          if (zoneId) {
            console.log("Looking for rates in zone:", zoneId, "for distance:", distance);
            applicableRates = await db.select().from(shippingRates).where(
              and(
                eq(shippingRates.zoneId, zoneId),
                eq(shippingRates.isActive, true),
                lte(shippingRates.minDistance, distance),
                gte(shippingRates.maxDistance, distance)
              )
            );
          }
          if (applicableRates.length === 0) {
            console.log("No zone-specific rates found, looking for any rate for distance:", distance);
            applicableRates = await db.select().from(shippingRates).where(
              and(
                eq(shippingRates.isActive, true),
                lte(shippingRates.minDistance, distance),
                gte(shippingRates.maxDistance, distance)
              )
            );
          }
          if (applicableRates.length === 0) {
            console.log("No distance-specific rates found, looking for highest maxDistance rate");
            applicableRates = await db.select().from(shippingRates).where(eq(shippingRates.isActive, true)).orderBy(desc(shippingRates.maxDistance)).limit(1);
          }
          if (applicableRates.length === 0) {
            console.log("No shipping rates found at all, using default cost");
            return 2e3;
          }
          const rate = applicableRates[0];
          console.log("Using shipping rate:", {
            id: rate.id,
            zoneId: rate.zoneId,
            minDistance: rate.minDistance,
            maxDistance: rate.maxDistance,
            baseRate: rate.baseRate,
            additionalRatePerKm: rate.additionalRatePerKm
          });
          let shippingCost = rate.baseRate;
          const additionalDistance = Math.max(0, distance - rate.minDistance);
          const distanceCost = Math.round(additionalDistance * rate.additionalRatePerKm);
          shippingCost += distanceCost;
          console.log("Distance-based cost calculation:", {
            baseRate: rate.baseRate,
            additionalDistance,
            distanceCost,
            subtotal: shippingCost
          });
          if (weight > 0 && rate.additionalRatePerKg && rate.additionalRatePerKg > 0) {
            const weightInKg = weight / 1e3;
            const weightCost = Math.round(weightInKg * rate.additionalRatePerKg);
            shippingCost += weightCost;
            console.log("Weight-based cost calculation:", {
              weight,
              weightInKg,
              additionalRatePerKg: rate.additionalRatePerKg,
              weightCost,
              total: shippingCost
            });
          }
          return shippingCost;
        } catch (error) {
          console.error("Error calculating shipping cost by coordinates:", error);
          return 2500;
        }
      }
      // Allowed Cities methods
      async createAllowedCity(cityData) {
        const result = await db.insert(allowedCities).values(cityData).returning();
        return result[0];
      }
      async getAllowedCityById(id) {
        const result = await db.select().from(allowedCities).where(eq(allowedCities.id, id));
        return result[0];
      }
      async getAllAllowedCities() {
        return db.select().from(allowedCities).orderBy(asc(allowedCities.cityName));
      }
      async getAllActiveAllowedCities() {
        return db.select().from(allowedCities).where(eq(allowedCities.isActive, true)).orderBy(asc(allowedCities.cityName));
      }
      async updateAllowedCity(id, cityData) {
        const result = await db.update(allowedCities).set(cityData).where(eq(allowedCities.id, id)).returning();
        return result[0];
      }
      async deleteAllowedCity(id) {
        const result = await db.delete(allowedCities).where(eq(allowedCities.id, id)).returning({ id: allowedCities.id });
        return result.length > 0;
      }
      async isCityAllowed(cityName) {
        if (!cityName) return false;
        const normalizedCityName = cityName.toLowerCase().trim();
        const exactMatches = await db.select().from(allowedCities).where(and(
          sql`LOWER(${allowedCities.cityName}) = ${normalizedCityName}`,
          eq(allowedCities.isActive, true)
        ));
        if (exactMatches.length > 0) {
          return true;
        }
        const partialMatches = await db.select().from(allowedCities).where(and(
          or(
            sql`LOWER(${allowedCities.cityName}) LIKE ${`%${normalizedCityName}%`}`,
            sql`${normalizedCityName} LIKE CONCAT('%', LOWER(${allowedCities.cityName}), '%')`
          ),
          eq(allowedCities.isActive, true)
        ));
        return partialMatches.length > 0;
      }
      // Helper method to convert degrees to radians
      deg2rad(degrees) {
        return degrees * (Math.PI / 180);
      }
      // Initialize the database with initial allowed cities
      async initializeDatabase() {
        try {
          const existingCities = await this.getAllAllowedCities();
          if (existingCities.length === 0) {
            const initialCities = [
              { cityName: "Brampton", province: "Ontario", isActive: true },
              { cityName: "Mississauga", province: "Ontario", isActive: true },
              { cityName: "Toronto", province: "Ontario", isActive: true }
            ];
            for (const city of initialCities) {
              await this.createAllowedCity(city);
            }
            console.log("Initialized allowed cities with:", initialCities.map((c) => c.cityName).join(", "));
          }
        } catch (error) {
          console.error("Error initializing allowed cities:", error);
        }
      }
      // Backup methods for data export
      async getAllProductImages() {
        return db.select().from(productImages).orderBy(asc(productImages.id));
      }
      async getAllOrderItems() {
        return db.select().from(orderItems).orderBy(asc(orderItems.id));
      }
      async getAllOrders() {
        return db.select().from(orders).orderBy(desc(orders.createdAt));
      }
      async getAllNotifications() {
        return db.select().from(notifications).orderBy(desc(notifications.created_at));
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/email.ts
import { MailService } from "@sendgrid/mail";
async function sendEmail(params) {
  try {
    console.log("Preparing to send email with params:", {
      to: Array.isArray(params.to) ? `${params.to.length} recipients` : params.to,
      from: params.from,
      subject: params.subject,
      hasText: !!params.text,
      hasHtml: !!params.html
    });
    const msg = {
      to: params.to,
      from: {
        email: params.from,
        name: "Jaberco Pallets"
        // Using store name improves deliverability
      },
      subject: params.subject,
      // Setting these spam prevention headers
      headers: {
        "List-Unsubscribe": "<https://jaberco.com/unsubscribe>",
        "Precedence": "Bulk"
      },
      // Categories help with tracking in SendGrid
      categories: ["newsletter"],
      // Using SendGrid tracking features
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
        subscriptionTracking: { enable: false }
      }
    };
    if (params.text) msg.text = params.text;
    if (params.html) {
      let htmlContent = params.html;
      if (!htmlContent.includes("<!DOCTYPE html>")) {
        htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${htmlContent}
  <br><br>
  <p style="font-size: 12px; color: #777;">
    You received this email because you subscribed to updates from Jaberco Pallets.
    <br>
    If you no longer wish to receive these emails, you can <a href="https://jaberco.com/unsubscribe" style="color: #777;">unsubscribe here</a>.
  </p>
</body>
</html>`;
      }
      msg.html = htmlContent;
    }
    console.log("Sending email via SendGrid...");
    const result = await mailService.send(msg);
    console.log("SendGrid response:", result);
    return true;
  } catch (error) {
    console.error("SendGrid email error details:", error);
    if (error.response) {
      console.error("SendGrid API response error:", {
        body: error.response.body,
        statusCode: error.response.statusCode
      });
    }
    return false;
  }
}
async function sendBulkEmails(emails, from, subject, content, isHtml = false) {
  if (!emails.length) {
    return { success: false, message: "No recipient emails provided" };
  }
  console.log(`Starting bulk email send to ${emails.length} recipients`);
  console.log(`From: ${from}, Subject: ${subject}, Content type: ${isHtml ? "HTML" : "Text"}`);
  try {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) {
      console.error("Invalid sender email format:", from);
      return {
        success: false,
        message: `Invalid sender email format: ${from}`
      };
    }
    const chunkSize = 900;
    const emailChunks = [];
    for (let i = 0; i < emails.length; i += chunkSize) {
      emailChunks.push(emails.slice(i, i + chunkSize));
    }
    console.log(`Split recipients into ${emailChunks.length} chunks`);
    let successCount = 0;
    let failureCount = 0;
    for (let i = 0; i < emailChunks.length; i++) {
      const chunk = emailChunks[i];
      console.log(`Sending chunk ${i + 1}/${emailChunks.length} with ${chunk.length} recipients`);
      const emailParams = {
        to: chunk,
        from,
        subject,
        ...isHtml ? { html: content } : { text: content }
      };
      const success = await sendEmail(emailParams);
      if (success) {
        successCount += chunk.length;
        console.log(`Successfully sent to chunk ${i + 1}/${emailChunks.length}`);
      } else {
        failureCount += chunk.length;
        console.error(`Failed to send to chunk ${i + 1}/${emailChunks.length}`);
      }
    }
    if (failureCount > 0) {
      const message2 = `Partial success: sent to ${successCount} of ${emails.length} subscribers (${failureCount} failed)`;
      console.warn(message2);
      return {
        success: successCount > 0,
        message: message2
      };
    }
    const message = `Email sent successfully to ${emails.length} subscribers`;
    console.log(message);
    return {
      success: true,
      message
    };
  } catch (error) {
    console.error("Bulk email error:", error);
    return {
      success: false,
      message: `Failed to send emails: ${error.message || "Unknown error"}`
    };
  }
}
var mailService;
var init_email = __esm({
  "server/email.ts"() {
    "use strict";
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY environment variable must be set");
    }
    mailService = new MailService();
    mailService.setApiKey(process.env.SENDGRID_API_KEY);
  }
});

// server/sms.ts
import twilio from "twilio";
async function sendSMS(to, body) {
  try {
    if (!client) {
      console.error("Twilio client not initialized");
      return {
        success: false,
        error: "Twilio client not initialized",
        message: "SMS service is not configured correctly"
      };
    }
    let formattedNumber = to.trim();
    if (!formattedNumber.startsWith("+")) {
      formattedNumber = "+" + formattedNumber;
      console.log(`Reformatted phone number to international format: ${formattedNumber}`);
    }
    console.log(`Attempting to send SMS to ${formattedNumber} using Twilio number ${process.env.TWILIO_PHONE_NUMBER}`);
    console.log(`SMS content: "${body.substring(0, 50)}${body.length > 50 ? "..." : ""}"`);
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });
    console.log(`SMS sent successfully to ${formattedNumber}. Message SID: ${message.sid}`);
    return {
      success: true,
      messageId: message.sid,
      message: "Message sent successfully",
      to: formattedNumber
    };
  } catch (error) {
    console.error(`Error sending SMS to ${to}:`, error.message);
    const errorDetails = {
      code: error.code || "unknown",
      status: error.status || "unknown",
      moreInfo: error.moreInfo || "No additional information",
      details: error.details || []
    };
    console.error("Detailed SMS error:", JSON.stringify(errorDetails, null, 2));
    return {
      success: false,
      error: error.message,
      errorDetails,
      message: "Failed to send message",
      to
    };
  }
}
async function sendBulkSMS(to, body) {
  const results = [];
  if (!client) {
    console.error("Twilio client not initialized");
    return to.map((recipient) => ({
      to: recipient,
      success: false,
      error: "Twilio client not initialized",
      message: "SMS service is not configured correctly"
    }));
  }
  for (const recipient of to) {
    try {
      const message = await client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: recipient
      });
      results.push({
        to: recipient,
        success: true,
        messageId: message.sid
      });
    } catch (error) {
      results.push({
        to: recipient,
        success: false,
        error: error.message
      });
    }
  }
  return results;
}
var client;
var init_sms = __esm({
  "server/sms.ts"() {
    "use strict";
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.error("Missing required Twilio environment variables");
    }
    client = null;
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
      if (accountSid && accountSid.startsWith("AC")) {
        client = twilio(accountSid, process.env.TWILIO_AUTH_TOKEN || "");
        console.log("Twilio client initialized successfully");
      } else {
        console.error('Twilio account SID must start with "AC"');
      }
    } catch (error) {
      console.error("Error initializing Twilio client:", error);
    }
  }
});

// server/utils/format.ts
function formatCurrency(amount, decimalPlaces = 2) {
  return amount.toFixed(decimalPlaces);
}
var init_format = __esm({
  "server/utils/format.ts"() {
    "use strict";
  }
});

// server/notifications/order-notifications.ts
var order_notifications_exports = {};
__export(order_notifications_exports, {
  sendOrderConfirmationEmail: () => sendOrderConfirmationEmail,
  sendOrderConfirmationNotifications: () => sendOrderConfirmationNotifications,
  sendOrderConfirmationSMS: () => sendOrderConfirmationSMS
});
async function sendOrderConfirmationEmail(order, orderItems2, customerEmail, customerName) {
  try {
    console.log(`Preparing to send order confirmation email to ${customerEmail} for order #${order.id}`);
    const orderItemsWithProducts = await Promise.all(
      orderItems2.map(async (item) => {
        const product = await storage.getProductById(item.productId);
        return {
          ...item,
          productTitle: product?.title || "Product"
        };
      })
    );
    const itemsList = orderItemsWithProducts.map((item) => {
      const totalPrice = (item.quantity || 1) * (item.pricePerUnit || 0);
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productTitle}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">C$${formatCurrency(item.pricePerUnit || 0)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">C$${formatCurrency(totalPrice)}</td>
        </tr>
      `;
    }).join("");
    const emailContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-bottom: 3px solid #e50000;">
          <h1 style="color: #333; margin: 0;">Order Confirmation</h1>
        </div>
        
        <div style="padding: 20px; background-color: #fff;">
          <p>Hello ${customerName},</p>
          
          <p>Thank you for your order! We're pleased to confirm that your payment has been successfully processed.</p>
          
          <div style="background-color: #f8f8f8; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h2 style="margin-top: 0; font-size: 18px; color: #333;">Order Summary</h2>
            <p><strong>Order Number:</strong> #${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt || /* @__PURE__ */ new Date()).toLocaleDateString()}</p>
            <p><strong>Payment Status:</strong> Paid</p>
            <p><strong>Order Status:</strong> ${order.status || "Processing"}</p>
          </div>
          
          <h3 style="margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px; color: #333;">Order Details</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Quantity</th>
                <th style="padding: 10px; text-align: right;">Unit Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
                <td style="padding: 10px; text-align: right;">C$${formatCurrency(order.total - (order.shippingCost || 0))}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Shipping:</td>
                <td style="padding: 10px; text-align: right;">C$${formatCurrency(order.shippingCost || 0)}</td>
              </tr>
              <tr style="background-color: #f5f5f5; font-weight: bold;">
                <td colspan="3" style="padding: 10px; text-align: right;">Total:</td>
                <td style="padding: 10px; text-align: right;">C$${formatCurrency(order.total)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <h3 style="color: #333;">Shipping Information</h3>
            <p>
              <strong>Address:</strong> ${order.shippingAddress || ""}<br>
              <strong>City:</strong> ${order.shippingCity || ""}<br>
              <strong>Postal Code:</strong> ${order.shippingPostalCode || ""}<br>
              <strong>Country:</strong> ${order.shippingCountry || ""}
            </p>
          </div>
          
          <div style="margin-top: 30px; background-color: #f8f8f8; padding: 15px; border-radius: 5px;">
            <p style="margin-top: 0;">If you have any questions about your order, please contact our customer support team.</p>
            <p style="margin-bottom: 0;">Thank you for shopping with Unity Pallets!</p>
          </div>
        </div>
        
        <div style="padding: 20px; background-color: #333; color: #fff; text-align: center; font-size: 14px;">
          <p>&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Unity Pallets. All rights reserved.</p>
        </div>
      </div>
    `;
    return await sendEmail({
      to: customerEmail,
      from: "orders@unity-pallets.com",
      subject: `Order Confirmation #${order.id} - Unity Pallets`,
      html: emailContent
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
}
async function sendOrderConfirmationSMS(order, customerPhone, customerName) {
  try {
    console.log(`Preparing to send order confirmation SMS to ${customerPhone} for order #${order.id}`);
    if (!customerPhone || !customerPhone.startsWith("+")) {
      console.log(`Invalid phone number ${customerPhone} for SMS. Must start with +`);
      return { success: false };
    }
    const message = `Hello ${customerName}, your order #${order.id} with Unity Pallets has been confirmed and payment received. Total: C$${formatCurrency(order.total)}. Thank you for your purchase!`;
    const result = await sendSMS(customerPhone, message);
    return result;
  } catch (error) {
    console.error("Error sending order confirmation SMS:", error);
    return { success: false };
  }
}
async function sendOrderConfirmationNotifications(orderId) {
  try {
    console.log(`Processing order confirmation notifications for order #${orderId}`);
    const order = await storage.getOrderById(orderId);
    if (!order) {
      console.error(`Order #${orderId} not found when trying to send confirmation notifications`);
      return { emailSent: false, smsSent: false };
    }
    const orderItems2 = await storage.getOrderItemsByOrderId(orderId);
    const customer = await storage.getUser(order.userId);
    if (!customer) {
      console.error(`Customer with ID ${order.userId} not found for order #${orderId}`);
      return { emailSent: false, smsSent: false };
    }
    const customerName = customer.fullName || customer.username || "Valued Customer";
    const customerEmail = customer.email;
    console.log(`Customer data for order #${orderId}:`, JSON.stringify(customer, null, 2));
    let customerPhone = null;
    if (customer.phone) customerPhone = customer.phone;
    else if (customer.phoneNumber) customerPhone = customer.phoneNumber;
    else if (customer.contact) customerPhone = customer.contact;
    console.log(`Customer contact information for order #${orderId}:`, {
      name: customerName,
      email: customerEmail || "Not provided",
      phone: customerPhone || "Not provided"
    });
    let emailSent = false;
    let smsSent = false;
    if (customerEmail) {
      emailSent = await sendOrderConfirmationEmail(order, orderItems2, customerEmail, customerName);
      console.log(`Order confirmation email for order #${orderId} ${emailSent ? "sent successfully" : "failed to send"}`);
    } else {
      console.log(`Customer has no email address for order #${orderId}`);
    }
    if (customerPhone) {
      const smsResult = await sendOrderConfirmationSMS(order, customerPhone, customerName);
      smsSent = smsResult.success;
      console.log(`Order confirmation SMS for order #${orderId} ${smsSent ? "sent successfully" : "failed to send"}`);
    } else {
      console.log(`Customer has no phone number for order #${orderId}`);
    }
    return { emailSent, smsSent };
  } catch (error) {
    console.error("Error in sendOrderConfirmationNotifications:", error);
    return { emailSent: false, smsSent: false };
  }
}
var init_order_notifications = __esm({
  "server/notifications/order-notifications.ts"() {
    "use strict";
    init_email();
    init_sms();
    init_storage();
    init_format();
  }
});

// server/middleware/auth.ts
function requireAdmin(req, res, next) {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).json({ error: "Access denied. Admin role required." });
  }
  next();
}
function authenticateCustomer(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated as customer" });
  }
  next();
}
var init_auth = __esm({
  "server/middleware/auth.ts"() {
    "use strict";
  }
});

// server/routes/admin-allowed-cities.ts
var admin_allowed_cities_exports = {};
__export(admin_allowed_cities_exports, {
  default: () => admin_allowed_cities_default
});
import express5 from "express";
import { z as z3 } from "zod";
var router11, admin_allowed_cities_default;
var init_admin_allowed_cities = __esm({
  "server/routes/admin-allowed-cities.ts"() {
    "use strict";
    init_storage();
    init_auth();
    init_schema();
    router11 = express5.Router();
    router11.get("/api/admin/allowed-cities", requireAdmin, async (req, res) => {
      try {
        const cities = await storage.getAllAllowedCities();
        res.json(cities);
      } catch (error) {
        console.error("Error fetching allowed cities:", error);
        res.status(500).json({ error: "Failed to fetch allowed cities", details: error.message });
      }
    });
    router11.get("/api/admin/allowed-cities/:id", requireAdmin, async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const city = await storage.getAllowedCityById(id);
        if (!city) {
          return res.status(404).json({ error: "City not found" });
        }
        res.json(city);
      } catch (error) {
        console.error(`Error fetching allowed city with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to fetch city", details: error.message });
      }
    });
    router11.post("/api/admin/allowed-cities", requireAdmin, async (req, res) => {
      try {
        const cityData = insertAllowedCitySchema.parse(req.body);
        cityData.cityName = cityData.cityName.trim();
        const newCity = await storage.createAllowedCity(cityData);
        res.status(201).json(newCity);
      } catch (error) {
        if (error instanceof z3.ZodError) {
          res.status(400).json({ error: "Invalid city data", details: error.errors });
        } else if (error.code === "23505") {
          res.status(409).json({ error: "City already exists", details: "A city with this name already exists" });
        } else {
          console.error("Error creating allowed city:", error);
          res.status(500).json({ error: "Failed to create city", details: error.message });
        }
      }
    });
    router11.put("/api/admin/allowed-cities/:id", requireAdmin, async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const cityData = insertAllowedCitySchema.parse(req.body);
        cityData.cityName = cityData.cityName.trim();
        const updatedCity = await storage.updateAllowedCity(id, cityData);
        if (!updatedCity) {
          return res.status(404).json({ error: "City not found" });
        }
        res.json(updatedCity);
      } catch (error) {
        if (error instanceof z3.ZodError) {
          res.status(400).json({ error: "Invalid city data", details: error.errors });
        } else if (error.code === "23505") {
          res.status(409).json({ error: "City name conflict", details: "A city with this name already exists" });
        } else {
          console.error(`Error updating allowed city with ID ${req.params.id}:`, error);
          res.status(500).json({ error: "Failed to update city", details: error.message });
        }
      }
    });
    router11.patch("/api/admin/allowed-cities/:id/status", requireAdmin, async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const { isActive } = req.body;
        if (typeof isActive !== "boolean") {
          return res.status(400).json({ error: "Invalid status value", details: "Status must be a boolean" });
        }
        const updatedCity = await storage.updateAllowedCity(id, { isActive });
        if (!updatedCity) {
          return res.status(404).json({ error: "City not found" });
        }
        res.json(updatedCity);
      } catch (error) {
        console.error(`Error updating city status with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to update city status", details: error.message });
      }
    });
    router11.delete("/api/admin/allowed-cities/:id", requireAdmin, async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const deleted = await storage.deleteAllowedCity(id);
        if (!deleted) {
          return res.status(404).json({ error: "City not found" });
        }
        res.status(200).json({ success: true, message: "City deleted successfully" });
      } catch (error) {
        console.error(`Error deleting allowed city with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to delete city", details: error.message });
      }
    });
    router11.get("/api/shipping/is-city-allowed", async (req, res) => {
      try {
        const { city } = req.query;
        if (!city || typeof city !== "string") {
          return res.status(400).json({
            error: "Missing city parameter",
            details: "City name must be provided"
          });
        }
        const isAllowed = await storage.isCityAllowed(city);
        res.json({
          city: city.trim(),
          isAllowed,
          message: isAllowed ? "Delivery is available to this location" : "Sorry, we do not deliver to this location"
        });
      } catch (error) {
        console.error("Error checking if city is allowed:", error);
        res.status(500).json({ error: "Failed to check city status", details: error.message });
      }
    });
    router11.get("/api/shipping/allowed-cities", async (req, res) => {
      try {
        const cities = await storage.getAllActiveAllowedCities();
        res.json(cities);
      } catch (error) {
        console.error("Error fetching active allowed cities:", error);
        res.status(500).json({ error: "Failed to fetch allowed cities", details: error.message });
      }
    });
    admin_allowed_cities_default = router11;
  }
});

// server/notifications/test.ts
var test_exports = {};
__export(test_exports, {
  testNotificationServices: () => testNotificationServices
});
async function testNotificationServices(email, phone) {
  const results = {
    email: { tested: false, success: false, error: null },
    sms: { tested: false, success: false, error: null }
  };
  if (email) {
    results.email.tested = true;
    try {
      console.log(`Testing email service by sending test message to ${email}`);
      const emailResult = await sendEmail({
        to: email,
        from: "test@unity-pallets.com",
        subject: "Unity Pallets - Notification Test",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #e50000;">Unity Pallets Notification Test</h1>
            <p>This is a test email to verify that our notification system is working correctly.</p>
            <p>If you received this email, it means our email delivery system is functioning properly.</p>
            <p>Time sent: ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
            <p>Thank you for your assistance in testing our system.</p>
            <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
              <p style="margin: 0; font-size: 12px; color: #777;">
                This is an automated test message. Please do not reply.
              </p>
            </div>
          </div>
        `
      });
      results.email.success = emailResult;
      if (!emailResult) {
        results.email.error = "Email delivery failed - check SendGrid API key and configuration";
      }
    } catch (error) {
      results.email.success = false;
      results.email.error = error.message || "Unknown error during email test";
      console.error("Email test error:", error);
    }
  }
  if (phone) {
    results.sms.tested = true;
    try {
      console.log(`Testing SMS service by sending test message to ${phone}`);
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+" + formattedPhone;
      }
      const smsResult = await sendSMS(
        formattedPhone,
        `Unity Pallets notification test - This is a test message sent at ${(/* @__PURE__ */ new Date()).toLocaleString()} to verify our SMS system is working correctly.`
      );
      results.sms.success = smsResult.success;
      if (!smsResult.success) {
        results.sms.error = smsResult.error || "SMS delivery failed - check Twilio API key and configuration";
      }
    } catch (error) {
      results.sms.success = false;
      results.sms.error = error.message || "Unknown error during SMS test";
      console.error("SMS test error:", error);
    }
  }
  return results;
}
var init_test = __esm({
  "server/notifications/test.ts"() {
    "use strict";
    init_email();
    init_sms();
  }
});

// server/routes/admin-notifications.ts
var admin_notifications_exports = {};
__export(admin_notifications_exports, {
  default: () => admin_notifications_default
});
import express6 from "express";
var router12, admin_notifications_default;
var init_admin_notifications = __esm({
  "server/routes/admin-notifications.ts"() {
    "use strict";
    init_auth();
    router12 = express6.Router();
    router12.post("/test-order-notifications/:orderId", requireAdmin, async (req, res) => {
      try {
        const orderId = parseInt(req.params.orderId);
        if (isNaN(orderId)) {
          return res.status(400).json({ error: "Invalid order ID" });
        }
        const { sendOrderConfirmationNotifications: sendOrderConfirmationNotifications2 } = await Promise.resolve().then(() => (init_order_notifications(), order_notifications_exports));
        console.log(`Admin requested test notifications for order #${orderId}`);
        const result = await sendOrderConfirmationNotifications2(orderId);
        res.json({
          success: true,
          emailSent: result.emailSent,
          smsSent: result.smsSent,
          message: `Notifications ${result.emailSent || result.smsSent ? "sent" : "failed"} for order #${orderId}`
        });
      } catch (error) {
        console.error("Error sending test notifications:", error);
        res.status(500).json({
          success: false,
          error: error.message || "Unknown error"
        });
      }
    });
    router12.post("/test-services", requireAdmin, async (req, res) => {
      try {
        const { email, phone } = req.body;
        if (!email && !phone) {
          return res.status(400).json({
            success: false,
            error: "At least one of email or phone must be provided"
          });
        }
        const { testNotificationServices: testNotificationServices2 } = await Promise.resolve().then(() => (init_test(), test_exports));
        console.log(`Admin requested service test. Email: ${email || "Not provided"}, Phone: ${phone || "Not provided"}`);
        const result = await testNotificationServices2(email, phone);
        res.json({
          success: true,
          results: result,
          message: "Notification service test completed"
        });
      } catch (error) {
        console.error("Error testing notification services:", error);
        res.status(500).json({
          success: false,
          error: error.message || "Unknown error"
        });
      }
    });
    admin_notifications_default = router12;
  }
});

// server/index.ts
import { config } from "dotenv";
import express8 from "express";

// server/routes.ts
init_storage();
init_schema();
import express7 from "express";
import { createServer } from "http";

// server/routes/visitor-stats.ts
import { Router } from "express";

// server/visitor-stats.ts
init_db();
init_schema();
import { asc as asc2, and as and2, desc as desc2, sql as sql2 } from "drizzle-orm";
async function addVisitorStat(stat) {
  const result = await db.insert(visitorStats).values(stat).returning();
  return result[0];
}
async function getVisitorStatsCount() {
  const result = await db.select({ count: sql2`count(*)` }).from(visitorStats);
  return result[0]?.count || 0;
}
async function getPageViewsByUrl() {
  const result = await db.select({
    url: visitorStats.pageUrl,
    count: sql2`count(*)`
  }).from(visitorStats).groupBy(visitorStats.pageUrl).orderBy(desc2(sql2`count(*)`));
  return result;
}
async function getVisitorStatsByDateRange(days) {
  const endDate = /* @__PURE__ */ new Date();
  const startDate = /* @__PURE__ */ new Date();
  startDate.setDate(startDate.getDate() - days);
  const result = await db.select({
    date: sql2`to_char(${visitorStats.visitDate}, 'YYYY-MM-DD')`,
    count: sql2`count(*)`
  }).from(visitorStats).where(
    and2(
      sql2`${visitorStats.visitDate} >= ${startDate.toISOString()}`,
      sql2`${visitorStats.visitDate} <= ${endDate.toISOString()}`
    )
  ).groupBy(sql2`to_char(${visitorStats.visitDate}, 'YYYY-MM-DD')`).orderBy(asc2(sql2`to_char(${visitorStats.visitDate}, 'YYYY-MM-DD')`));
  return result;
}
async function getVisitorStatsByCountry() {
  const result = await db.select({
    country: visitorStats.countryCode,
    count: sql2`count(*)`
  }).from(visitorStats).where(sql2`${visitorStats.countryCode} IS NOT NULL`).groupBy(visitorStats.countryCode).orderBy(desc2(sql2`count(*)`));
  return result.filter((item) => item.country !== null).map((item) => ({
    country: item.country || "Unknown",
    count: item.count
  }));
}
async function getVisitorStatsByDevice() {
  const result = await db.select({
    device: visitorStats.deviceType,
    count: sql2`count(*)`
  }).from(visitorStats).where(sql2`${visitorStats.deviceType} IS NOT NULL`).groupBy(visitorStats.deviceType).orderBy(desc2(sql2`count(*)`));
  return result.filter((item) => item.device !== null).map((item) => ({
    device: item.device || "Unknown",
    count: item.count
  }));
}

// server/routes/visitor-stats.ts
import { UAParser } from "ua-parser-js";
import fetch from "node-fetch";
var router = Router();
router.post("/api/visitor-stats", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip || "0.0.0.0";
    const ipAddress = Array.isArray(ip) ? ip[0] : ip.split(",")[0].trim();
    const userAgentString = req.headers["user-agent"] || "";
    const parser = new UAParser(userAgentString);
    const uaResult = parser.getResult();
    let deviceType = "desktop";
    if (uaResult.device.type) {
      if (uaResult.device.type === "mobile" || uaResult.device.type === "tablet") {
        deviceType = uaResult.device.type;
      }
    }
    let countryCode = null;
    try {
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      if (response.ok) {
        const data = await response.json();
        countryCode = data.country_code || null;
      }
    } catch (error) {
      console.error("Error fetching country from IP:", error);
    }
    const visitorData = {
      visitDate: /* @__PURE__ */ new Date(),
      pageUrl: req.body.pageUrl || req.headers.referer || "/",
      visitorIp: ipAddress,
      userAgent: userAgentString,
      referrer: req.headers.referer || null,
      countryCode,
      deviceType
    };
    const result = await addVisitorStat(visitorData);
    res.status(201).json({ success: true, id: result.id });
  } catch (error) {
    console.error("Error recording visitor stat:", error);
    res.status(500).json({ success: false, error: "Failed to record visitor statistics" });
  }
});
router.get("/api/admin/visitor-stats/date-range", async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const result = await getVisitorStatsByDateRange(days);
    res.json(result);
  } catch (error) {
    console.error("Error getting visitor stats by date range:", error);
    res.status(500).json({ error: "Failed to fetch visitor statistics" });
  }
});
router.get("/api/admin/visitor-stats/count", async (req, res) => {
  try {
    const count = await getVisitorStatsCount();
    res.json({ count });
  } catch (error) {
    console.error("Error getting visitor count:", error);
    res.status(500).json({ error: "Failed to fetch visitor count" });
  }
});
router.get("/api/admin/visitor-stats/pages", async (req, res) => {
  try {
    const result = await getPageViewsByUrl();
    res.json(result);
  } catch (error) {
    console.error("Error getting page views:", error);
    res.status(500).json({ error: "Failed to fetch page views" });
  }
});
router.get("/api/admin/visitor-stats/countries", async (req, res) => {
  try {
    const result = await getVisitorStatsByCountry();
    res.json(result);
  } catch (error) {
    console.error("Error getting visitor stats by country:", error);
    res.status(500).json({ error: "Failed to fetch visitor statistics by country" });
  }
});
router.get("/api/admin/visitor-stats/devices", async (req, res) => {
  try {
    const result = await getVisitorStatsByDevice();
    res.json(result);
  } catch (error) {
    console.error("Error getting visitor stats by device:", error);
    res.status(500).json({ error: "Failed to fetch visitor statistics by device" });
  }
});
var visitor_stats_default = router;

// server/routes/notifications.ts
init_storage();
init_schema();
import { Router as Router2 } from "express";
import { z as z2 } from "zod";

// server/websocket.ts
import { WebSocketServer, WebSocket } from "ws";

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/websocket.ts
var userConnections = /* @__PURE__ */ new Map();
function setupWebSocket(server) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  log("WebSocket server initialized");
  wss.on("connection", (ws3) => {
    log("WebSocket connection established");
    ws3.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "auth") {
          ws3.userId = data.userId;
          ws3.isAdmin = data.isAdmin;
          ws3.isPublisher = data.isPublisher;
          log(`WebSocket authenticated: User ID ${ws3.userId}, isAdmin: ${ws3.isAdmin}, isPublisher: ${ws3.isPublisher}`);
          if (ws3.userId) {
            if (!userConnections.has(ws3.userId)) {
              userConnections.set(ws3.userId, []);
            }
            userConnections.get(ws3.userId)?.push(ws3);
          }
          ws3.send(JSON.stringify({ type: "auth_success" }));
        }
      } catch (err) {
        log(`WebSocket message error: ${err}`);
      }
    });
    ws3.on("close", () => {
      if (ws3.userId) {
        const connections = userConnections.get(ws3.userId) || [];
        const index = connections.indexOf(ws3);
        if (index !== -1) {
          connections.splice(index, 1);
        }
        if (connections.length === 0) {
          userConnections.delete(ws3.userId);
        }
      }
      log("WebSocket connection closed");
    });
  });
  return wss;
}
function sendNotificationToUser(userId, notification) {
  const connections = userConnections.get(userId);
  if (connections && connections.length > 0) {
    const message = JSON.stringify({
      type: "notification",
      notification
    });
    connections.forEach((ws3) => {
      if (ws3.readyState === WebSocket.OPEN) {
        ws3.send(message);
      }
    });
    log(`Notification sent to user ${userId}`);
    return true;
  }
  log(`No active connections for user ${userId}`);
  return false;
}
function sendNotificationToAdmins(notification) {
  let sentToAnyone = false;
  userConnections.forEach((connections, userId) => {
    connections.forEach((ws3) => {
      if (ws3.isAdmin && ws3.readyState === WebSocket.OPEN) {
        ws3.send(JSON.stringify({
          type: "notification",
          notification
        }));
        sentToAnyone = true;
      }
    });
  });
  log(`Notification sent to all admins: ${sentToAnyone}`);
  return sentToAnyone;
}
function sendNotificationToPublishers(notification) {
  let sentToAnyone = false;
  userConnections.forEach((connections, userId) => {
    connections.forEach((ws3) => {
      if ((ws3.isPublisher || ws3.isAdmin) && ws3.readyState === WebSocket.OPEN) {
        ws3.send(JSON.stringify({
          type: "notification",
          notification
        }));
        sentToAnyone = true;
      }
    });
  });
  log(`Notification sent to all publishers: ${sentToAnyone}`);
  return sentToAnyone;
}

// server/routes/notifications.ts
var router2 = Router2();
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
router2.get("/api/notifications", requireAuth, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const notifications2 = await storage.getNotificationsByUserId(userId);
  res.json(notifications2);
});
router2.get("/api/notifications/unread", requireAuth, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const notifications2 = await storage.getUnreadNotificationsByUserId(userId);
  res.json(notifications2);
});
router2.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
  const notificationId = parseInt(req.params.id);
  if (isNaN(notificationId)) {
    return res.status(400).json({ error: "Invalid notification ID" });
  }
  const success = await storage.markNotificationAsRead(notificationId);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Notification not found" });
  }
});
router2.post("/api/notifications/read-all", requireAuth, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const success = await storage.markAllNotificationsAsRead(userId);
  res.json({ success });
});
router2.delete("/api/notifications/:id", requireAuth, async (req, res) => {
  const notificationId = parseInt(req.params.id);
  if (isNaN(notificationId)) {
    return res.status(400).json({ error: "Invalid notification ID" });
  }
  const success = await storage.deleteNotification(notificationId);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Notification not found" });
  }
});
router2.post("/api/admin/notifications/user/:userId", requireAuth, async (req, res) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  try {
    const validatedData = insertNotificationSchema.parse({
      ...req.body,
      userId
    });
    const notification = await storage.createNotification(validatedData);
    sendNotificationToUser(userId, notification);
    res.status(201).json(notification);
  } catch (error) {
    if (error instanceof z2.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create notification" });
    }
  }
});
router2.post("/api/admin/notifications/admins", requireAuth, async (req, res) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const users2 = await storage.getAllUsers();
    const adminUsers = users2.filter((user) => user.isAdmin);
    const notifications2 = [];
    for (const admin of adminUsers) {
      const validatedData = insertNotificationSchema.parse({
        ...req.body,
        userId: admin.id
      });
      const notification = await storage.createNotification(validatedData);
      notifications2.push(notification);
    }
    if (notifications2.length > 0) {
      sendNotificationToAdmins(notifications2[0]);
    }
    res.status(201).json({ success: true, count: notifications2.length });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create notifications" });
    }
  }
});
router2.post("/api/admin/notifications/publishers", requireAuth, async (req, res) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const users2 = await storage.getAllUsers();
    const publisherUsers = users2.filter((user) => user.roleType === "publisher" || user.isAdmin);
    const notifications2 = [];
    for (const publisher of publisherUsers) {
      const validatedData = insertNotificationSchema.parse({
        ...req.body,
        userId: publisher.id
      });
      const notification = await storage.createNotification(validatedData);
      notifications2.push(notification);
    }
    if (notifications2.length > 0) {
      sendNotificationToPublishers(notifications2[0]);
    }
    res.status(201).json({ success: true, count: notifications2.length });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create notifications" });
    }
  }
});
var notifications_default = router2;

// server/routes/customer.ts
init_storage();
init_schema();
init_db();
import { Router as Router3 } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var router3 = Router3();
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
router3.get("/", (req, res) => {
  if (req.isAuthenticated() && req.user.roleType === "customer") {
    return res.json(req.user);
  }
  return res.status(401).json({ error: "Not authenticated as customer" });
});
router3.post("/register", async (req, res) => {
  try {
    const validationResult = customerRegistrationSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.format()
      });
    }
    const { username, password, confirmPassword, email, fullName, phone } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const { address, city, postalCode, country } = req.body;
    const hashedPassword = await hashPassword(password);
    const newUser = await storage.createUser({
      username,
      password: hashedPassword,
      email,
      fullName,
      phone,
      address,
      city,
      postalCode,
      country,
      roleType: "customer",
      isAdmin: false
    });
    req.login(newUser, (err) => {
      if (err) {
        return res.status(500).json({ error: "Login failed after registration" });
      }
      return res.status(201).json(newUser);
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
});
router3.post("/login", async (req, res, next) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.format()
      });
    }
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json(user);
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
});
router3.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    return res.json({ success: true });
  });
});
router3.patch("/profile", async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user.roleType !== "customer") {
      return res.status(401).json({ error: "Not authenticated as customer" });
    }
    const { fullName, email, phone, address, city, postalCode, country } = req.body;
    const updateData = {};
    if (fullName !== void 0) updateData.full_name = fullName;
    if (email !== void 0) updateData.email = email;
    if (phone !== void 0) updateData.phone = phone;
    if (address !== void 0) updateData.address = address;
    if (city !== void 0) updateData.city = city;
    if (postalCode !== void 0) updateData.postal_code = postalCode;
    if (country !== void 0) updateData.country = country;
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }
    try {
      const updateFields = Object.keys(updateData).map((key, i) => `${key} = $${i + 2}`).join(", ");
      const values = [req.user.id, ...Object.values(updateData)];
      const result = await pool.query(
        `UPDATE users SET ${updateFields} WHERE id = $1 RETURNING *`,
        values
      );
      if (result.rows && result.rows.length > 0) {
        const updatedUser = result.rows[0];
        req.login(updatedUser, (err) => {
          if (err) {
            return res.status(500).json({ error: "Failed to update session" });
          }
          return res.json(updatedUser);
        });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } catch (dbError) {
      console.error("Database update error:", dbError);
      return res.status(500).json({ error: "Failed to update profile" });
    }
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ error: "Profile update failed" });
  }
});
router3.get("/orders", async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user.roleType !== "customer") {
      return res.status(401).json({ error: "Not authenticated as customer" });
    }
    try {
      const result = await pool.query(
        `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
        [req.user.id]
      );
      const orders2 = result.rows || [];
      if (orders2.length > 0) {
        for (const order of orders2) {
          try {
            const itemsResult = await pool.query(
              `SELECT oi.*, p.title, p.price FROM order_items oi 
               JOIN products p ON oi.product_id = p.id 
               WHERE oi.order_id = $1`,
              [order.id]
            );
            order.items = itemsResult.rows || [];
          } catch (itemError) {
            console.error(`Error fetching items for order ${order.id}:`, itemError);
            order.items = [];
          }
        }
      }
      return res.json(orders2);
    } catch (sqlError) {
      console.error("Database query error:", sqlError);
      try {
        const userOrders = await storage.getOrdersByCustomerId(req.user.id);
        return res.json(userOrders || []);
      } catch (storageError) {
        console.error("Storage fallback error:", storageError);
        return res.status(500).json({ error: "Failed to fetch orders" });
      }
    }
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});
router3.get("/orders/:id", async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user.roleType !== "customer") {
      return res.status(401).json({ error: "Not authenticated as customer" });
    }
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }
    const orderResults = await pool.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [orderId, req.user.id]
    );
    if (!orderResults.rows || orderResults.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = orderResults.rows[0];
    const orderItemsResults = await pool.query(
      `SELECT oi.*, p.title, p.price, p.image_url FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [orderId]
    );
    order.items = orderItemsResults.rows || [];
    return res.json(order);
  } catch (error) {
    console.error("Error fetching customer order:", error);
    return res.status(500).json({ error: "Failed to fetch order details" });
  }
});
var customer_default = router3;

// server/routes/stripe.ts
init_storage();
import { Router as Router4 } from "express";
import Stripe from "stripe";
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required environment variable: STRIPE_SECRET_KEY");
}
var secretKey = process.env.STRIPE_SECRET_KEY;
console.log("Initializing Stripe with key type:", secretKey.startsWith("sk_") ? "Secret Key" : "Wrong Key Type");
var stripe = new Stripe(secretKey, {
  apiVersion: "2023-10-16"
});
var router4 = Router4();
function requireCustomer(req, res, next) {
  if (req.isAuthenticated() && req.user.roleType === "customer") {
    return next();
  }
  return res.status(401).json({ error: "Authentication required" });
}
router4.post("/create-payment-intent", requireCustomer, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const { amount, orderId } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    console.log(`Creating Stripe checkout for order #${orderId} with amount: ${amount}`);
    const order = await storage.getOrderById(Number(orderId));
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const orderItems2 = await storage.getOrderItemsByOrderId(Number(orderId));
    const productTotal = order.total - order.shippingCost;
    const productTotalInCents = productTotal * 100;
    const shippingCostInCents = order.shippingCost * 100;
    console.log(`Original product total: ${productTotal}, converted to cents: ${productTotalInCents}`);
    console.log(`Original shipping cost: ${order.shippingCost}, converted to cents: ${shippingCostInCents}`);
    const lineItems = [];
    lineItems.push({
      price_data: {
        currency: "cad",
        product_data: {
          name: `Order #${orderId} - ${orderItems2.length} items`,
          description: `Purchase from Jaberco Pallets`
        },
        unit_amount: productTotalInCents
        // Product amount in cents
      },
      quantity: 1
    });
    if (order.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "cad",
          product_data: {
            name: "Shipping",
            description: "Shipping and handling fees"
          },
          unit_amount: shippingCostInCents
          // Shipping amount in cents
        },
        quantity: 1
      });
    }
    console.log("Stripe checkout line items:", lineItems);
    const session3 = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.origin}/account?order_success=true&order_id=${orderId}`,
      cancel_url: `${req.headers.origin}/checkout?canceled=true`,
      metadata: {
        orderId: orderId || "manual_checkout",
        userId: req.user.id.toString()
      }
    });
    res.json({
      sessionId: session3.id,
      url: session3.url
    });
  } catch (error) {
    console.error("Error creating payment session:", error);
    res.status(500).json({ error: error.message });
  }
});
router4.post("/webhook", async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn("STRIPE_WEBHOOK_SECRET is not set. Webhook verification is disabled.");
    event = req.body;
  } else {
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      if (paymentIntent.metadata.orderId && paymentIntent.metadata.orderId !== "manual_checkout") {
        try {
          const orderId = parseInt(paymentIntent.metadata.orderId);
          await storage.updateOrderPaymentStatus(orderId, "paid");
          await storage.updateOrderStatus(orderId, "processing");
          await storage.updateOrderPaymentIntent(orderId, paymentIntent.id);
          console.log(`Payment for order ${orderId} succeeded. Payment ID: ${paymentIntent.id}`);
          const { sendOrderConfirmationNotifications: sendOrderConfirmationNotifications2 } = await Promise.resolve().then(() => (init_order_notifications(), order_notifications_exports));
          const notificationResults = await sendOrderConfirmationNotifications2(orderId);
          console.log(`Order confirmation notifications for order ${orderId}:`, {
            emailSent: notificationResults.emailSent,
            smsSent: notificationResults.smsSent
          });
        } catch (error) {
          console.error("Error processing successful payment:", error);
        }
      }
      break;
    case "checkout.session.completed":
      const session3 = event.data.object;
      if (session3.metadata && session3.metadata.orderId && session3.metadata.orderId !== "manual_checkout") {
        try {
          const orderId = parseInt(session3.metadata.orderId);
          await storage.updateOrderPaymentStatus(orderId, "paid");
          await storage.updateOrderStatus(orderId, "processing");
          if (session3.payment_intent) {
            await storage.updateOrderPaymentIntent(
              orderId,
              typeof session3.payment_intent === "string" ? session3.payment_intent : session3.payment_intent.id
            );
          }
          console.log(`Checkout completed for order ${orderId}. Payment status updated to 'paid', order status updated to 'processing'. Session ID: ${session3.id}`);
          const { sendOrderConfirmationNotifications: sendOrderConfirmationNotifications2 } = await Promise.resolve().then(() => (init_order_notifications(), order_notifications_exports));
          const notificationResults = await sendOrderConfirmationNotifications2(orderId);
          console.log(`Order confirmation notifications for order ${orderId}:`, {
            emailSent: notificationResults.emailSent,
            smsSent: notificationResults.smsSent
          });
        } catch (error) {
          console.error("Error processing completed checkout:", error);
        }
      }
      break;
    case "checkout.session.expired":
      const expiredSession = event.data.object;
      if (expiredSession.metadata && expiredSession.metadata.orderId && expiredSession.metadata.orderId !== "manual_checkout") {
        try {
          const orderId = parseInt(expiredSession.metadata.orderId);
          await storage.updateOrderPaymentStatus(orderId, "failed");
          await storage.updateOrderStatus(orderId, "cancelled");
          console.log(`Checkout session expired for order ${orderId}. Payment status updated to 'failed', order status updated to 'cancelled'. Session ID: ${expiredSession.id}`);
        } catch (error) {
          console.error("Error processing expired checkout:", error);
        }
      }
      break;
    case "payment_intent.payment_failed":
      const failedPaymentIntent = event.data.object;
      if (failedPaymentIntent.metadata.orderId && failedPaymentIntent.metadata.orderId !== "manual_checkout") {
        try {
          const orderId = parseInt(failedPaymentIntent.metadata.orderId);
          await storage.updateOrderPaymentStatus(orderId, "failed");
          await storage.updateOrderStatus(orderId, "cancelled");
          await storage.updateOrderPaymentIntent(orderId, failedPaymentIntent.id);
          console.log(`Payment failed for order ${orderId}. Order cancelled. Payment ID: ${failedPaymentIntent.id}`);
        } catch (error) {
          console.error("Error processing failed payment:", error);
        }
      }
      break;
    case "payment_intent.canceled":
      const canceledPaymentIntent = event.data.object;
      if (canceledPaymentIntent.metadata.orderId && canceledPaymentIntent.metadata.orderId !== "manual_checkout") {
        try {
          const orderId = parseInt(canceledPaymentIntent.metadata.orderId);
          await storage.updateOrderPaymentStatus(orderId, "failed");
          await storage.updateOrderStatus(orderId, "cancelled");
          await storage.updateOrderPaymentIntent(orderId, canceledPaymentIntent.id);
          console.log(`Payment intent canceled for order ${orderId}. Order cancelled. Payment ID: ${canceledPaymentIntent.id}`);
        } catch (error) {
          console.error("Error processing canceled payment intent:", error);
        }
      }
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  res.json({ received: true });
});
router4.post("/create-stripe-customer", requireCustomer, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (req.user.stripeCustomerId) {
      return res.status(400).json({ error: "Customer already exists in Stripe" });
    }
    const customer = await stripe.customers.create({
      email: req.user.email || void 0,
      name: req.user.fullName || req.user.username,
      metadata: {
        userId: req.user.id.toString()
      }
    });
    await storage.updateUser(req.user.id, {
      // Use any type to bypass TypeScript's property checking
      ...customer.id ? { stripeCustomerId: customer.id } : {}
    });
    res.json({ success: true, customerId: customer.id });
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    res.status(500).json({ error: error.message });
  }
});
var stripe_default = router4;

// server/routes/cart.ts
init_db();
init_schema();
import { Router as Router5 } from "express";
import { eq as eq3, and as and3 } from "drizzle-orm";
import { randomBytes as randomBytes2 } from "crypto";
var router5 = Router5();
async function ensureCartExists(req, res, next) {
  try {
    if (req.isAuthenticated()) {
      const userId = req.user.id;
      const [existingCart2] = await db.select().from(carts).where(eq3(carts.userId, userId));
      if (existingCart2) {
        req.cartId = existingCart2.id;
        return next();
      }
      const [newCart2] = await db.insert(carts).values({ userId }).returning();
      req.cartId = newCart2.id;
      return next();
    }
    if (!req.session.cartSessionId) {
      req.session.cartSessionId = randomBytes2(16).toString("hex");
    }
    const sessionId = req.session.cartSessionId;
    const [existingCart] = await db.select().from(carts).where(eq3(carts.sessionId, sessionId));
    if (existingCart) {
      req.cartId = existingCart.id;
      return next();
    }
    const [newCart] = await db.insert(carts).values({ sessionId }).returning();
    req.cartId = newCart.id;
    return next();
  } catch (error) {
    console.error("Error ensuring cart exists:", error);
    return res.status(500).json({ error: "Failed to process cart" });
  }
}
router5.get("/", ensureCartExists, async (req, res) => {
  try {
    const items = await db.select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      product: {
        id: products.id,
        title: products.title,
        titleAr: products.titleAr,
        price: products.price,
        imageUrl: products.imageUrl,
        status: products.status
      }
    }).from(cartItems).where(eq3(cartItems.cartId, req.cartId)).innerJoin(products, eq3(cartItems.productId, products.id));
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    res.json({
      items,
      total,
      itemCount: items.length
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});
router5.post("/items", ensureCartExists, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }
    const [product] = await db.select().from(products).where(eq3(products.id, productId));
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (product.status === "soldout") {
      return res.status(400).json({ error: "Product is sold out" });
    }
    const [existingItem] = await db.select().from(cartItems).where(and3(
      eq3(cartItems.cartId, req.cartId),
      eq3(cartItems.productId, productId)
    ));
    if (existingItem) {
      const [updatedItem] = await db.update(cartItems).set({ quantity: existingItem.quantity + quantity }).where(eq3(cartItems.id, existingItem.id)).returning();
      return res.json(updatedItem);
    }
    const [newItem] = await db.insert(cartItems).values({
      cartId: req.cartId,
      productId,
      quantity
    }).returning();
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
});
router5.patch("/items/:itemId", ensureCartExists, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }
    const [cartItem] = await db.select().from(cartItems).where(and3(
      eq3(cartItems.id, parseInt(itemId)),
      eq3(cartItems.cartId, req.cartId)
    ));
    if (!cartItem) {
      return res.status(404).json({ error: "Item not found in cart" });
    }
    const [updatedItem] = await db.update(cartItems).set({ quantity }).where(eq3(cartItems.id, parseInt(itemId))).returning();
    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: "Failed to update cart item" });
  }
});
router5.delete("/items/:itemId", ensureCartExists, async (req, res) => {
  try {
    const { itemId } = req.params;
    const [cartItem] = await db.select().from(cartItems).where(and3(
      eq3(cartItems.id, parseInt(itemId)),
      eq3(cartItems.cartId, req.cartId)
    ));
    if (!cartItem) {
      return res.status(404).json({ error: "Item not found in cart" });
    }
    await db.delete(cartItems).where(eq3(cartItems.id, parseInt(itemId)));
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
});
router5.delete("/", ensureCartExists, async (req, res) => {
  try {
    await db.delete(cartItems).where(eq3(cartItems.cartId, req.cartId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});
router5.post("/transfer", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!req.session.cartSessionId) {
      return res.json({ success: true, message: "No anonymous cart to transfer" });
    }
    const sessionId = req.session.cartSessionId;
    const userId = req.user.id;
    const [anonymousCart] = await db.select().from(carts).where(eq3(carts.sessionId, sessionId));
    if (!anonymousCart) {
      return res.json({ success: true, message: "No anonymous cart found" });
    }
    let [userCart] = await db.select().from(carts).where(eq3(carts.userId, userId));
    if (!userCart) {
      [userCart] = await db.insert(carts).values({ userId }).returning();
    }
    const anonymousItems = await db.select().from(cartItems).where(eq3(cartItems.cartId, anonymousCart.id));
    const userItems = await db.select().from(cartItems).where(eq3(cartItems.cartId, userCart.id));
    for (const item of anonymousItems) {
      const existingItem = userItems.find((i) => i.productId === item.productId);
      if (existingItem) {
        await db.update(cartItems).set({ quantity: existingItem.quantity + item.quantity }).where(eq3(cartItems.id, existingItem.id));
      } else {
        await db.insert(cartItems).values({
          cartId: userCart.id,
          productId: item.productId,
          quantity: item.quantity
        });
      }
    }
    await db.delete(cartItems).where(eq3(cartItems.cartId, anonymousCart.id));
    await db.delete(carts).where(eq3(carts.id, anonymousCart.id));
    delete req.session.cartSessionId;
    res.json({ success: true });
  } catch (error) {
    console.error("Error transferring cart:", error);
    res.status(500).json({ error: "Failed to transfer cart" });
  }
});
router5.delete("/clear", ensureCartExists, async (req, res) => {
  try {
    if (req.isAuthenticated() && req.user) {
      const userId = req.user.id;
      const [cart] = await db.select().from(carts).where(eq3(carts.userId, userId));
      if (cart) {
        await db.delete(cartItems).where(eq3(cartItems.cartId, cart.id));
        res.status(200).json({ success: true, message: "Cart cleared successfully" });
        return;
      }
    }
    if (req.session.cartSessionId) {
      const sessionId = req.session.cartSessionId;
      const [cart] = await db.select().from(carts).where(eq3(carts.sessionId, sessionId));
      if (cart) {
        await db.delete(cartItems).where(eq3(cartItems.cartId, cart.id));
      }
    }
    res.status(200).json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});
var cart_default = router5;

// server/routes/order.ts
init_storage();
init_auth();
import express2 from "express";
import fetch2 from "node-fetch";
var router6 = express2.Router();
router6.get("/", authenticateCustomer, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const customerId = req.user.id;
    const orders2 = await storage.getOrdersByCustomerId(customerId);
    res.json(orders2);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});
router6.post("/", authenticateCustomer, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const customerId = req.user.id;
    const response = await fetch2(`http://localhost:5000/api/cart`, {
      headers: {
        Cookie: req.headers.cookie || ""
      }
    });
    if (!response.ok) {
      return res.status(400).json({ error: "Failed to fetch cart" });
    }
    const cart = await response.json();
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    const {
      fullName,
      email,
      phone,
      address,
      city,
      province,
      postalCode,
      country,
      notes,
      paymentMethod,
      shippingCost
    } = req.body;
    const fullAddress = `${address}, ${city}, ${province}, ${postalCode}, ${country}`;
    const contactInfo = `Contact: ${fullName}, ${email}, ${phone}`;
    const cartTotal = cart.total || 0;
    const finalShippingCost = shippingCost || 0;
    const orderTotal = cartTotal + finalShippingCost;
    console.log("Order creation details:");
    console.log("Cart total:", cartTotal);
    console.log("Shipping cost:", finalShippingCost);
    console.log("Final order total (with shipping):", orderTotal);
    const orderData = {
      userId: customerId,
      total: orderTotal,
      // Total now includes shipping cost
      status: "pending",
      paymentStatus: "pending",
      shippingAddress: `${fullAddress}. ${contactInfo}`,
      shippingCity: city,
      shippingPostalCode: postalCode,
      shippingCountry: country,
      shippingCost: finalShippingCost,
      notes: notes ? `${notes}. Payment: ${paymentMethod || "cash_on_delivery"}` : `Payment: ${paymentMethod || "cash_on_delivery"}`
    };
    const order = await storage.createOrder(orderData);
    const cartItems2 = Array.isArray(cart.items) ? cart.items : [];
    for (const item of cartItems2) {
      if (item && item.productId && item.quantity && item.product && item.product.price) {
        const orderItem = {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          pricePerUnit: item.product.price
        };
        await storage.createOrderItem(orderItem);
      }
    }
    if (paymentMethod === "cash_on_delivery") {
      try {
        console.log("Sending immediate notification for COD order:", order.id);
        const { sendOrderConfirmationNotifications: sendOrderConfirmationNotifications2 } = await Promise.resolve().then(() => (init_order_notifications(), order_notifications_exports));
        const notificationResults = await sendOrderConfirmationNotifications2(order.id);
        console.log(`Order confirmation notifications for COD order ${order.id}:`, {
          emailSent: notificationResults.emailSent,
          smsSent: notificationResults.smsSent
        });
      } catch (error) {
        console.error("Error sending COD order notifications:", error);
      }
    }
    await fetch2(`http://localhost:5000/api/cart/clear`, {
      method: "DELETE",
      headers: {
        Cookie: req.headers.cookie || "",
        "Content-Type": "application/json"
      }
    });
    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});
router6.get("/:id", authenticateCustomer, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const orderId = Number(req.params.id);
    const customerId = req.user.id;
    const order = await storage.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.userId !== customerId) {
      return res.status(403).json({ error: "Not authorized to view this order" });
    }
    const orderItems2 = await storage.getOrderItemsByOrderId(orderId);
    res.json({
      ...order,
      items: orderItems2
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});
router6.get("/:id/items", authenticateCustomer, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const orderId = Number(req.params.id);
    const customerId = req.user.id;
    const order = await storage.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.userId !== customerId) {
      return res.status(403).json({ error: "Not authorized to view this order" });
    }
    const orderItems2 = await storage.getOrderItemsByOrderId(orderId);
    res.json(orderItems2);
  } catch (error) {
    console.error("Error fetching order items:", error);
    res.status(500).json({ error: "Failed to fetch order items" });
  }
});
router6.patch("/:id/cancel", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const order = await storage.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const updatedOrder = await storage.updateOrderStatus(orderId, "cancelled");
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});
router6.patch("/:id/status", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const order = await storage.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const updatedOrder = await storage.updateOrderStatus(orderId, status);
    const orderItems2 = await storage.getOrderItemsByOrderId(orderId);
    res.json({
      ...updatedOrder,
      items: orderItems2
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});
router6.patch("/:id/payment", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { paymentStatus } = req.body;
    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }
    const order = await storage.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const updatedOrder = await storage.updateOrderPaymentStatus(orderId, paymentStatus);
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ error: "Failed to update payment status" });
  }
});
var order_default = router6;

// server/routes/admin-orders.ts
init_db();
import { Router as Router6 } from "express";
var router7 = Router6();
router7.get("/", async (req, res) => {
  try {
    const orders2 = await pool.query(
      `SELECT o.*, u.email, u.full_name, u.phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    ).then((result) => result.rows);
    if (orders2 && orders2.length > 0) {
      for (const order of orders2) {
        try {
          const orderItems2 = await pool.query(
            `SELECT oi.*, p.title, p.price, p.image_url FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = $1`,
            [order.id]
          ).then((result) => result.rows);
          order.items = orderItems2 || [];
        } catch (error) {
          console.error(`Error fetching items for order ${order.id}:`, error);
          order.items = [];
        }
      }
    }
    return res.json(orders2 || []);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});
router7.get("/:id", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }
    const rows = await pool.query(
      `SELECT o.*, u.email, u.full_name, u.phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [orderId]
    ).then((result) => result.rows);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = rows[0];
    const orderItems2 = await pool.query(
      `SELECT oi.*, p.title, p.price, p.image_url FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [orderId]
    ).then((result) => result.rows);
    order.items = orderItems2 || [];
    return res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ error: "Failed to fetch order details" });
  }
});
router7.patch("/:id/status", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const rows = await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, orderId]
    ).then((result) => result.rows);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const orderItems2 = await pool.query(
      `SELECT oi.*, p.title, p.price, p.image_url FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [orderId]
    ).then((result) => result.rows);
    const updatedOrder = rows[0];
    updatedOrder.items = orderItems2 || [];
    return res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ error: "Failed to update order status" });
  }
});
router7.patch("/:id/payment-status", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }
    const { paymentStatus } = req.body;
    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }
    const rows = await pool.query(
      `UPDATE orders SET payment_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [paymentStatus, orderId]
    ).then((result) => result.rows);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res.status(500).json({ error: "Failed to update payment status" });
  }
});
var admin_orders_default = router7;

// server/routes/admin-shipping.ts
init_storage();
init_schema();
import express3 from "express";
var router8 = express3.Router();
router8.get("/zones", async (req, res) => {
  try {
    const zones = await storage.getAllShippingZones();
    res.json(zones);
  } catch (error) {
    console.error("Error getting shipping zones:", error);
    res.status(500).json({ error: "Failed to get shipping zones" });
  }
});
router8.get("/zones/:id", async (req, res) => {
  try {
    const zoneId = parseInt(req.params.id);
    const zone = await storage.getShippingZoneById(zoneId);
    if (!zone) {
      return res.status(404).json({ error: "Shipping zone not found" });
    }
    res.json(zone);
  } catch (error) {
    console.error("Error getting shipping zone:", error);
    res.status(500).json({ error: "Failed to get shipping zone" });
  }
});
router8.post("/zones", async (req, res) => {
  try {
    const zoneData = insertShippingZoneSchema.parse(req.body);
    const newZone = await storage.createShippingZone(zoneData);
    res.status(201).json(newZone);
  } catch (error) {
    console.error("Error creating shipping zone:", error);
    res.status(400).json({ error: "Failed to create shipping zone", details: error.toString() });
  }
});
router8.put("/zones/:id", async (req, res) => {
  try {
    const zoneId = parseInt(req.params.id);
    const zoneData = insertShippingZoneSchema.partial().parse(req.body);
    const updatedZone = await storage.updateShippingZone(zoneId, zoneData);
    if (!updatedZone) {
      return res.status(404).json({ error: "Shipping zone not found" });
    }
    res.json(updatedZone);
  } catch (error) {
    console.error("Error updating shipping zone:", error);
    res.status(400).json({ error: "Failed to update shipping zone", details: error.toString() });
  }
});
router8.delete("/zones/:id", async (req, res) => {
  try {
    const zoneId = parseInt(req.params.id);
    const success = await storage.deleteShippingZone(zoneId);
    if (!success) {
      return res.status(404).json({ error: "Shipping zone not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting shipping zone:", error);
    res.status(500).json({ error: "Failed to delete shipping zone" });
  }
});
router8.get("/rates", async (req, res) => {
  try {
    const rates = await storage.getAllShippingRates();
    res.json(rates);
  } catch (error) {
    console.error("Error getting shipping rates:", error);
    res.status(500).json({ error: "Failed to get shipping rates" });
  }
});
router8.get("/zones/:zoneId/rates", async (req, res) => {
  try {
    const zoneId = parseInt(req.params.zoneId);
    const rates = await storage.getShippingRatesByZoneId(zoneId);
    res.json(rates);
  } catch (error) {
    console.error("Error getting shipping rates for zone:", error);
    res.status(500).json({ error: "Failed to get shipping rates for zone" });
  }
});
router8.get("/rates/:id", async (req, res) => {
  try {
    const rateId = parseInt(req.params.id);
    const rate = await storage.getShippingRateById(rateId);
    if (!rate) {
      return res.status(404).json({ error: "Shipping rate not found" });
    }
    res.json(rate);
  } catch (error) {
    console.error("Error getting shipping rate:", error);
    res.status(500).json({ error: "Failed to get shipping rate" });
  }
});
router8.post("/rates", async (req, res) => {
  try {
    const rateData = insertShippingRateSchema.parse(req.body);
    const newRate = await storage.createShippingRate(rateData);
    res.status(201).json(newRate);
  } catch (error) {
    console.error("Error creating shipping rate:", error);
    res.status(400).json({ error: "Failed to create shipping rate", details: error.toString() });
  }
});
router8.put("/rates/:id", async (req, res) => {
  try {
    const rateId = parseInt(req.params.id);
    const rateData = insertShippingRateSchema.partial().parse(req.body);
    const updatedRate = await storage.updateShippingRate(rateId, rateData);
    if (!updatedRate) {
      return res.status(404).json({ error: "Shipping rate not found" });
    }
    res.json(updatedRate);
  } catch (error) {
    console.error("Error updating shipping rate:", error);
    res.status(400).json({ error: "Failed to update shipping rate", details: error.toString() });
  }
});
router8.delete("/rates/:id", async (req, res) => {
  try {
    const rateId = parseInt(req.params.id);
    const success = await storage.deleteShippingRate(rateId);
    if (!success) {
      return res.status(404).json({ error: "Shipping rate not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting shipping rate:", error);
    res.status(500).json({ error: "Failed to delete shipping rate" });
  }
});
router8.get("/locations", async (req, res) => {
  try {
    const locations2 = await storage.getAllLocations();
    res.json(locations2);
  } catch (error) {
    console.error("Error getting locations:", error);
    res.status(500).json({ error: "Failed to get locations" });
  }
});
router8.get("/locations/warehouses", async (req, res) => {
  try {
    const warehouses = await storage.getWarehouseLocations();
    res.json(warehouses);
  } catch (error) {
    console.error("Error getting warehouse locations:", error);
    res.status(500).json({ error: "Failed to get warehouse locations" });
  }
});
router8.get("/locations/:id", async (req, res) => {
  try {
    const locationId = parseInt(req.params.id);
    const location = await storage.getLocationById(locationId);
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }
    res.json(location);
  } catch (error) {
    console.error("Error getting location:", error);
    res.status(500).json({ error: "Failed to get location" });
  }
});
router8.post("/locations", async (req, res) => {
  try {
    const locationData = insertLocationSchema.parse(req.body);
    const newLocation = await storage.createLocation(locationData);
    res.status(201).json(newLocation);
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(400).json({ error: "Failed to create location", details: error.toString() });
  }
});
router8.put("/locations/:id", async (req, res) => {
  try {
    const locationId = parseInt(req.params.id);
    const locationData = insertLocationSchema.partial().parse(req.body);
    const updatedLocation = await storage.updateLocation(locationId, locationData);
    if (!updatedLocation) {
      return res.status(404).json({ error: "Location not found" });
    }
    res.json(updatedLocation);
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(400).json({ error: "Failed to update location", details: error.toString() });
  }
});
router8.delete("/locations/:id", async (req, res) => {
  try {
    const locationId = parseInt(req.params.id);
    const success = await storage.deleteLocation(locationId);
    if (!success) {
      return res.status(404).json({ error: "Location not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ error: "Failed to delete location" });
  }
});
router8.post("/calculate-shipping", async (req, res) => {
  try {
    const { fromLocationId, toLocationId, weight } = req.body;
    if (!fromLocationId || !toLocationId) {
      return res.status(400).json({ error: "From and to location IDs are required" });
    }
    const shippingCost = await storage.calculateShippingCost(
      parseInt(fromLocationId),
      parseInt(toLocationId),
      weight ? parseInt(weight) : void 0
    );
    res.json({ cost: shippingCost });
  } catch (error) {
    console.error("Error calculating shipping cost:", error);
    res.status(500).json({ error: "Failed to calculate shipping cost", details: error.toString() });
  }
});
var admin_shipping_default = router8;

// server/routes/shipping.ts
init_storage();
import express4 from "express";
var router9 = express4.Router();
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return parseFloat(distance.toFixed(2));
}
router9.post("/calculate", async (req, res) => {
  try {
    console.log("Shipping calculation request:", req.body);
    const {
      city,
      province,
      postalCode,
      country
    } = req.body;
    if (!city || !province || !country) {
      console.log("Missing required fields:", { city, province, country });
      return res.status(400).json({ error: "City, province and country are required" });
    }
    const warehouses = await storage.getWarehouseLocations();
    console.log("Found warehouses:", warehouses.length);
    if (warehouses.length === 0) {
      console.log("No warehouses configured, using default cost");
      return res.json({ shippingCost: 2e3 });
    }
    const allLocations = await storage.getAllLocations();
    console.log("All locations:", allLocations.length);
    console.log("Creating temporary location based on customer input");
    const referenceLocation = warehouses.length > 0 ? warehouses[0] : allLocations[0];
    if (!referenceLocation) {
      console.log("No reference location found for coordinates");
      return res.status(400).json({
        error: "Shipping unavailable",
        details: "Unable to calculate shipping to your location"
      });
    }
    const warehouse = warehouses[0];
    if (!warehouse.zoneId) {
      console.log("Warehouse has no zoneId set");
      return res.status(400).json({
        error: "Shipping unavailable",
        details: "Shipping configuration issue - please contact support"
      });
    }
    const warehouseZone = await storage.getShippingZoneById(warehouse.zoneId);
    if (!warehouseZone || !warehouseZone.maxDistanceLimit) {
      console.log("No max distance limit set for warehouse zone");
      return res.status(400).json({
        error: "Shipping unavailable",
        details: "Shipping configuration issue - please contact support"
      });
    }
    const maxDistanceLimit = Math.min(warehouseZone.maxDistanceLimit, 60);
    console.log(`Setting strict maximum distance limit to ${maxDistanceLimit}km`);
    let customLatitude, customLongitude;
    const cityCoordinates = {
      "toronto": { lat: "43.6532", lon: "-79.3832" },
      "montreal": { lat: "45.5017", lon: "-73.5673" },
      "vancouver": { lat: "49.2827", lon: "-123.1207" },
      "calgary": { lat: "51.0447", lon: "-114.0719" },
      "edmonton": { lat: "53.5461", lon: "-113.4938" },
      "ottawa": { lat: "45.4215", lon: "-75.6972" },
      "winnipeg": { lat: "49.8951", lon: "-97.1384" },
      "quebec city": { lat: "46.8139", lon: "-71.2080" },
      "hamilton": { lat: "43.2557", lon: "-79.8711" },
      "brampton": { lat: "43.7315", lon: "-79.7624" },
      "kitchener": { lat: "43.4516", lon: "-80.4925" },
      "london": { lat: "42.9849", lon: "-81.2453" },
      "victoria": { lat: "48.4284", lon: "-123.3656" },
      "halifax": { lat: "44.6488", lon: "-63.5752" },
      "niagara falls": { lat: "43.0896", lon: "-79.0849" },
      "windsor": { lat: "42.3149", lon: "-83.0364" },
      "oshawa": { lat: "43.8971", lon: "-78.8658" },
      "saskatoon": { lat: "52.1332", lon: "-106.6700" },
      "barrie": { lat: "44.3894", lon: "-79.6903" },
      "guelph": { lat: "43.5448", lon: "-80.2482" },
      "kingston": { lat: "44.2312", lon: "-76.4860" },
      "regina": { lat: "50.4452", lon: "-104.6189" },
      "burnaby": { lat: "49.2488", lon: "-122.9805" },
      "mississauga": { lat: "43.5890", lon: "-79.6441" },
      "markham": { lat: "43.8561", lon: "-79.3370" }
    };
    const normalizedCity = city.toLowerCase().trim();
    const isAllowed = await storage.isCityAllowed(normalizedCity);
    if (!isAllowed) {
      console.log(`City ${city} is not in the allowed cities list`);
      const activeCities = await storage.getAllActiveAllowedCities();
      const cityNames = activeCities.map((c) => c.cityName).join(", ");
      return res.status(400).json({
        error: "Out of service",
        details: `Your location is outside our delivery range - we only deliver to: ${cityNames || "select cities"}`
      });
    }
    if (cityCoordinates[normalizedCity]) {
      customLatitude = cityCoordinates[normalizedCity].lat;
      customLongitude = cityCoordinates[normalizedCity].lon;
      console.log(`Found coordinates for ${city}: lat=${customLatitude}, lon=${customLongitude}`);
    } else {
      const partialMatch = Object.keys(cityCoordinates).find(
        (key) => normalizedCity.includes(key) || key.includes(normalizedCity)
      );
      if (partialMatch) {
        customLatitude = cityCoordinates[partialMatch].lat;
        customLongitude = cityCoordinates[partialMatch].lon;
        console.log(`Found partial match coordinates for ${city} using ${partialMatch}: lat=${customLatitude}, lon=${customLongitude}`);
      } else {
        console.log("No coordinate match found for apparently allowed city - reject anyway");
        const activeCities = await storage.getAllActiveAllowedCities();
        const cityNames = activeCities.map((c) => c.cityName).join(", ");
        return res.status(400).json({
          error: "Out of service",
          details: `Your location is outside our delivery range - we only deliver to: ${cityNames || "select cities"}`
        });
      }
    }
    const distanceFromWarehouse = calculateDistance(
      parseFloat(warehouse.latitude),
      parseFloat(warehouse.longitude),
      parseFloat(customLatitude || warehouse.latitude),
      parseFloat(customLongitude || warehouse.longitude)
    );
    console.log(`Distance from warehouse: ${distanceFromWarehouse}km, Max allowed: ${maxDistanceLimit}km`);
    if (distanceFromWarehouse > maxDistanceLimit) {
      console.log("Location exceeds maximum delivery distance");
      return res.status(400).json({
        error: "Out of service",
        details: "Your location is outside our delivery range - maximum 60km distance"
      });
    }
    const customerLocation = {
      id: -999,
      // Special temporary ID for custom locations
      city,
      province,
      country,
      postalCode: postalCode || "",
      latitude: customLatitude || warehouse.latitude,
      longitude: customLongitude || warehouse.longitude,
      isWarehouse: false,
      zoneId: warehouse.zoneId,
      createdAt: /* @__PURE__ */ new Date()
    };
    console.log("Found customer location:", {
      id: customerLocation.id,
      city: customerLocation.city,
      province: customerLocation.province
    });
    const shippingCosts = await Promise.all(
      warehouses.map(async (warehouse2) => {
        console.log("Calculating shipping from warehouse:", warehouse2.id, "to custom location:", customerLocation.city);
        try {
          let zoneId = warehouse2.zoneId;
          if (!zoneId) {
            console.log("Warehouse has no zone ID, using default shipping");
            return 2500;
          }
          const rates = await storage.getShippingRatesByZoneId(zoneId);
          if (!rates || rates.length === 0) {
            console.log("No shipping rates defined for zone", zoneId);
            return 2e3;
          }
          const distance = calculateDistance(
            parseFloat(warehouse2.latitude),
            parseFloat(warehouse2.longitude),
            parseFloat(customLatitude || warehouse2.latitude),
            parseFloat(customLongitude || warehouse2.longitude)
          );
          console.log(`Calculated distance from warehouse ${warehouse2.id} to ${customerLocation.city}: ${distance}km`);
          if (distance > maxDistanceLimit) {
            console.log(`Distance ${distance}km exceeds zone limit of ${maxDistanceLimit}km`);
            return -1;
          }
          const applicableRate = rates.find(
            (rate) => distance >= rate.minDistance && distance <= rate.maxDistance && rate.isActive
          );
          if (!applicableRate) {
            console.log("No applicable shipping rate found for distance", distance);
            return -1;
          }
          let cost = applicableRate.baseRate;
          const additionalDistance = Math.max(0, distance - applicableRate.minDistance);
          const additionalCost = Math.round(additionalDistance * applicableRate.additionalRatePerKm);
          cost += additionalCost;
          console.log("Calculated shipping cost:", {
            baseRate: applicableRate.baseRate,
            additionalDistance,
            additionalCost,
            totalCost: cost
          });
          return cost;
        } catch (err) {
          console.error("Error calculating shipping cost:", err);
          return Number.MAX_SAFE_INTEGER;
        }
      })
    );
    console.log("All shipping costs:", shippingCosts);
    const allOutsideRange = shippingCosts.every((cost) => cost === -1);
    if (allOutsideRange) {
      console.log("All warehouses are too far away - outside maximum delivery range");
      return res.status(400).json({
        error: "Shipping unavailable",
        details: "Your location is outside our delivery range"
      });
    }
    if (shippingCosts.length === 0 || shippingCosts.every((cost) => cost === Number.MAX_SAFE_INTEGER)) {
      console.log("All shipping calculations failed - treating as outside range");
      return res.status(400).json({
        error: "Shipping unavailable",
        details: "Unable to calculate shipping to your location"
      });
    }
    const outsideRangeCounts = shippingCosts.filter((cost) => cost === -1).length;
    if (outsideRangeCounts > 0 && outsideRangeCounts >= Math.ceil(shippingCosts.length / 2)) {
      console.log(`${outsideRangeCounts} of ${shippingCosts.length} warehouses indicate location is outside range - treating as outside range`);
      return res.status(400).json({
        error: "Shipping unavailable",
        details: "Your location is outside our delivery range"
      });
    }
    const validCosts = shippingCosts.filter((cost) => cost !== Number.MAX_SAFE_INTEGER && cost !== -1);
    if (validCosts.length === 0) {
      console.log("No valid shipping costs found - treating as outside range");
      return res.status(400).json({
        error: "Shipping unavailable",
        details: "Your location is outside our delivery range"
      });
    }
    const shippingCost = Math.min(...validCosts);
    if (shippingCost <= 0) {
      console.log("Invalid shipping cost detected:", shippingCost);
      return res.status(400).json({
        error: "Shipping unavailable",
        details: "Invalid shipping cost calculated for your location"
      });
    }
    console.log("Final shipping cost:", shippingCost);
    res.json({ shippingCost });
  } catch (error) {
    console.error("Error calculating shipping cost:", error);
    res.status(500).json({
      error: "Failed to calculate shipping cost",
      details: error.message || error.toString()
    });
  }
});
var shipping_default = router9;

// server/routes/categories.ts
init_db();
init_schema();
init_auth();
import { Router as Router7 } from "express";
import { eq as eq4 } from "drizzle-orm";
import slugify from "slugify";

// server/middleware/validation.ts
function validateSchema(schema) {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const formattedErrors = result.error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message
        }));
        return res.status(400).json({
          error: "Validation failed",
          details: formattedErrors
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({ error: "Server error during validation" });
    }
  };
}

// server/routes/categories.ts
var router10 = Router7();
router10.get("/api/categories", async (_req, res) => {
  try {
    const allCategories = await db.select().from(categories);
    res.json(allCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});
router10.get("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }
    const [category] = await db.select().from(categories).where(eq4(categories.id, categoryId));
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
});
router10.post(
  "/api/admin/categories",
  requireAdmin,
  validateSchema(insertCategorySchema),
  async (req, res) => {
    try {
      let { name, nameAr, slug, description, descriptionAr, displayOrder } = req.body;
      if (!slug) {
        slug = slugify(name, { lower: true, strict: true });
      }
      const [existingCategory] = await db.select().from(categories).where(eq4(categories.slug, slug));
      if (existingCategory) {
        return res.status(400).json({ error: "Slug already in use" });
      }
      if (displayOrder === void 0) {
        const result = await db.execute(
          `SELECT MAX(display_order) as "maxOrder" FROM categories`
        );
        const maxOrder = result.rows[0]?.maxOrder ? parseInt(result.rows[0].maxOrder) : 0;
        displayOrder = maxOrder + 10;
      }
      const [newCategory] = await db.insert(categories).values({
        name,
        nameAr,
        slug,
        description,
        descriptionAr,
        displayOrder
      }).returning();
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  }
);
router10.put(
  "/api/admin/categories/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const categoryId = parseInt(id);
      if (isNaN(categoryId)) {
        return res.status(400).json({ error: "Invalid category ID" });
      }
      const [category] = await db.select().from(categories).where(eq4(categories.id, categoryId));
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      let { name, nameAr, slug, description, descriptionAr, displayOrder } = req.body;
      if (name !== category.name && !slug) {
        slug = slugify(name, { lower: true, strict: true });
      }
      if (slug && slug !== category.slug) {
        const [existingCategory] = await db.select().from(categories).where(eq4(categories.slug, slug));
        if (existingCategory && existingCategory.id !== categoryId) {
          return res.status(400).json({ error: "Slug already in use" });
        }
      }
      const [updatedCategory] = await db.update(categories).set({
        name: name || category.name,
        nameAr: nameAr || category.nameAr,
        slug: slug || category.slug,
        description: description !== void 0 ? description : category.description,
        descriptionAr: descriptionAr !== void 0 ? descriptionAr : category.descriptionAr,
        displayOrder: displayOrder !== void 0 ? displayOrder : category.displayOrder
      }).where(eq4(categories.id, categoryId)).returning();
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  }
);
router10.delete(
  "/api/admin/categories/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const categoryId = parseInt(id);
      if (isNaN(categoryId)) {
        return res.status(400).json({ error: "Invalid category ID" });
      }
      const [category] = await db.select().from(categories).where(eq4(categories.id, categoryId));
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      await db.delete(categories).where(eq4(categories.id, categoryId));
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  }
);
var categories_default = router10;

// server/notifications.ts
init_storage();
async function createContactNotification(contactId, name, message) {
  try {
    const users2 = await storage.getAllUsers();
    const adminUsers = users2.filter((user) => user.isAdmin);
    const notifications2 = [];
    for (const admin of adminUsers) {
      const notificationData = {
        userId: admin.id,
        type: "new_contact",
        title: "New Contact Message",
        message: `New message from ${name}: ${message.substring(0, 50)}${message.length > 50 ? "..." : ""}`,
        relatedId: contactId,
        isRead: false
      };
      const notification = await storage.createNotification(notificationData);
      notifications2.push(notification);
    }
    if (notifications2.length > 0) {
      sendNotificationToAdmins(notifications2[0]);
    }
    return { success: true, count: notifications2.length };
  } catch (error) {
    console.error("Failed to create contact notification:", error);
    return { success: false, error };
  }
}
async function createAppointmentNotification(appointmentId, name, date) {
  try {
    const users2 = await storage.getAllUsers();
    const staffUsers = users2.filter((user) => user.isAdmin || user.roleType === "publisher");
    const notifications2 = [];
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    for (const staff of staffUsers) {
      const notificationData = {
        userId: staff.id,
        type: "new_appointment",
        title: "New Appointment Request",
        message: `New appointment request from ${name} for ${formattedDate}`,
        relatedId: appointmentId,
        isRead: false
      };
      const notification = await storage.createNotification(notificationData);
      notifications2.push(notification);
      sendNotificationToUser(staff.id, notification);
    }
    if (notifications2.length > 0) {
      sendNotificationToAdmins(notifications2[0]);
      sendNotificationToPublishers(notifications2[0]);
      console.log(`Appointment notification sent to ${notifications2.length} staff members`);
    }
    return { success: true, count: notifications2.length };
  } catch (error) {
    console.error("Failed to create appointment notification:", error);
    return { success: false, error };
  }
}
async function createAppointmentStatusNotification(appointmentId, status, userId, appointmentDate) {
  try {
    const users2 = await storage.getAllUsers();
    const staffUsers = users2.filter(
      (user) => (user.isAdmin || user.roleType === "publisher") && user.id !== userId
    );
    const notifications2 = [];
    const formattedDate = appointmentDate.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    for (const staff of staffUsers) {
      const notificationData = {
        userId: staff.id,
        type: "status_update",
        title: "Appointment Status Changed",
        message: `Appointment for ${formattedDate} status changed to ${status}`,
        relatedId: appointmentId,
        isRead: false
      };
      const notification = await storage.createNotification(notificationData);
      notifications2.push(notification);
      sendNotificationToUser(staff.id, notification);
    }
    if (notifications2.length > 0) {
      sendNotificationToAdmins(notifications2[0]);
      sendNotificationToPublishers(notifications2[0]);
      console.log(`Appointment status notification sent to ${notifications2.length} staff members`);
    }
    return { success: true, count: notifications2.length };
  } catch (error) {
    console.error("Failed to create appointment status notification:", error);
    return { success: false, error };
  }
}

// server/routes.ts
init_email();
init_sms();
import { z as z4 } from "zod";

// server/upload.ts
import multer from "multer";
import path3 from "path";
import fs2 from "fs";
var uploadsDir = path3.join(process.cwd(), "tmp/uploads");
if (!fs2.existsSync(uploadsDir)) {
  fs2.mkdirSync(uploadsDir, { recursive: true });
}
var storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path3.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});
var fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};
var upload = multer({
  storage: storage2,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB max file size
  }
});
var handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: true,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      error: true,
      message: err.message
    });
  }
  next();
};

// server/routes.ts
import path4 from "path";
import fs4 from "fs";

// server/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import fs3 from "fs";
var cloudName;
var apiKey;
var apiSecret;
if (process.env.CLOUDINARY_URL) {
  console.log("Using CLOUDINARY_URL for configuration");
  try {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (match) {
      apiKey = match[1];
      apiSecret = match[2];
      cloudName = match[3];
      console.log(`Extracted Cloudinary config from URL - cloud_name: ${cloudName}`);
    } else {
      console.error("Invalid CLOUDINARY_URL format");
    }
  } catch (error) {
    console.error("Error parsing CLOUDINARY_URL:", error);
  }
} else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  console.log("Using individual Cloudinary environment variables");
  cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  apiKey = process.env.CLOUDINARY_API_KEY;
  apiSecret = process.env.CLOUDINARY_API_SECRET;
} else {
  console.error("Missing required Cloudinary environment variables");
}
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});
console.log(`Cloudinary initialized with:
- cloud_name: ${cloudName}
- api_key exists: ${Boolean(apiKey)}
- api_secret exists: ${Boolean(apiSecret)}
`);
var PRODUCT_IMAGES_FOLDER = "jaberco_ecommerce/products";
var uploadImage = async (filePath, publicId) => {
  try {
    console.log(`Attempting to upload image from ${filePath} to Cloudinary...`);
    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Cloudinary configuration is incomplete:");
      console.error(`- cloud_name exists: ${Boolean(cloudName)}`);
      console.error(`- api_key exists: ${Boolean(apiKey)}`);
      console.error(`- api_secret exists: ${Boolean(apiSecret)}`);
      return {
        success: false,
        error: "Cloudinary configuration is incomplete. Check environment variables."
      };
    }
    if (!filePath) {
      console.error("No file path provided for upload");
      return {
        success: false,
        error: "No file path provided for upload"
      };
    }
    if (!fs3.existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      return {
        success: false,
        error: `File not found at path: ${filePath}`
      };
    }
    return new Promise((resolve) => {
      const options = {
        folder: PRODUCT_IMAGES_FOLDER,
        resource_type: "auto",
        // Optimize performance and reduce image size
        quality: "auto",
        fetch_format: "auto"
      };
      if (publicId) {
        options.public_id = publicId;
      }
      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          resolve({
            success: false,
            error: error.message || "Unknown Cloudinary upload error"
          });
          return;
        }
        console.log("Image uploaded successfully to Cloudinary");
        console.log("Image URL:", result?.secure_url);
        console.log("Public ID:", result?.public_id);
        if (!result?.secure_url) {
          console.error("Warning: No secure_url returned from Cloudinary");
        }
        resolve({
          success: true,
          imageUrl: result?.secure_url,
          publicId: result?.public_id,
          format: result?.format,
          width: result?.width,
          height: result?.height
        });
      });
      const fileStream = fs3.createReadStream(filePath);
      fileStream.pipe(uploadStream);
      fileStream.on("error", (error) => {
        console.error("Error reading file:", error);
        resolve({
          success: false,
          error: `Error reading file: ${error.message}`
        });
      });
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    console.error("Upload error details:", JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error.message || "Unknown Cloudinary upload error"
    };
  }
};
var deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      return { success: false, error: "No public ID provided" };
    }
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === "ok",
      message: result.result
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
var extractPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) {
    return "";
  }
  try {
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return matches ? matches[1] : "";
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return "";
  }
};

// server/auth.ts
init_storage();
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt as scrypt2, randomBytes as randomBytes3, timingSafeEqual as timingSafeEqual2 } from "crypto";
import { promisify as promisify2 } from "util";
var scryptAsync2 = promisify2(scrypt2);
async function hashPassword2(password) {
  const salt = randomBytes3(16).toString("hex");
  const buf = await scryptAsync2(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords2(supplied, stored) {
  try {
    console.log("Comparing passwords, stored format:", stored ? stored.substring(0, 10) + "..." : "null");
    if (!stored || !stored.includes(".")) {
      console.error("Invalid stored password format, missing salt separator");
      return false;
    }
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.error("Invalid stored password, missing hash or salt");
      return false;
    }
    console.log("Password verification debug:", {
      hashedLength: hashed.length,
      saltLength: salt.length,
      algorithm: "scrypt",
      keyLength: 64
    });
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync2(supplied, salt, 64);
    if (hashedBuf.length !== suppliedBuf.length) {
      console.error("Hash length mismatch", {
        hashedLength: hashedBuf.length,
        suppliedLength: suppliedBuf.length
      });
      return false;
    }
    const result = timingSafeEqual2(hashedBuf, suppliedBuf);
    console.log("Password verification result:", result);
    return result;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}
function setupAuth(app2) {
  const generateSecureSecret = () => {
    const bytes = randomBytes3(32);
    return "jaberco-secure-key-" + bytes.toString("hex");
  };
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || generateSecureSecret(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1e3,
      // 1 day
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true
      // Prevents client-side JS from reading the cookie
    },
    store: storage.sessionStore
  };
  if (process.env.NODE_ENV === "production") {
    app2.set("trust proxy", 1);
  }
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username" });
        }
        const isValidPassword = await comparePasswords2(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  const requireAdmin2 = (req, res, next) => {
    const user = req.user;
    if (!req.isAuthenticated() || !(user?.isAdmin || user?.roleType === "admin")) {
      return res.status(401).json({ message: "Unauthorized - Admin access required" });
    }
    next();
  };
  const requirePublisher = (req, res, next) => {
    const user = req.user;
    if (!req.isAuthenticated() || !(user?.isAdmin || user?.roleType === "admin" || user?.roleType === "publisher")) {
      return res.status(401).json({ message: "Unauthorized - Publisher access required" });
    }
    next();
  };
  const canManageProducts = (req, res, next) => {
    const user = req.user;
    if (!req.isAuthenticated() || !(user?.isAdmin || user?.roleType === "admin" || user?.roleType === "publisher")) {
      return res.status(401).json({ message: "Unauthorized - Cannot manage products" });
    }
    next();
  };
  const canViewContacts = (req, res, next) => {
    const user = req.user;
    if (!req.isAuthenticated() || !(user?.isAdmin || user?.roleType === "admin" || user?.roleType === "publisher")) {
      return res.status(401).json({ message: "Unauthorized - Cannot view contacts" });
    }
    next();
  };
  const canManageAppointments = (req, res, next) => {
    const user = req.user;
    if (!req.isAuthenticated() || !(user?.isAdmin || user?.roleType === "admin" || user?.roleType === "publisher")) {
      return res.status(401).json({ message: "Unauthorized - Cannot manage appointments" });
    }
    next();
  };
  app2.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, roleType = "user" } = req.body;
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already exists"
        });
      }
      const hashedPassword = await hashPassword2(password);
      const isAdmin = roleType === "admin";
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        isAdmin,
        roleType
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
            roleType: user.roleType
          }
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: `Registration failed: ${error.message || "Unknown error"}`
      });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({
          success: false,
          message: "Internal server error during login"
        });
      }
      if (!user) {
        return res.status(401).json({
          success: false,
          message: info?.message || "Invalid username or password"
        });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Session creation error:", loginErr);
          return res.status(500).json({
            success: false,
            message: "Failed to create session"
          });
        }
        res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
            roleType: user.roleType
          }
        });
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
          success: false,
          message: "Error during logout"
        });
      }
      res.json({
        success: true,
        message: "Successfully logged out"
      });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const user = req.user;
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        roleType: user.roleType
      }
    });
  });
  app2.get("/api/session", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user;
      console.log("Session check - authenticated:", user.username);
      const hasAdminAccess = user.isAdmin || user.roleType === "admin" || user.roleType === "publisher";
      if (!hasAdminAccess && req.path?.startsWith("/admin")) {
        console.log("Non-admin user attempting to access admin dashboard, rejecting");
        return res.json({
          authenticated: false
        });
      }
      return res.json({
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
          roleType: user.roleType
        }
      });
    } else {
      console.log("Session check - not authenticated");
      return res.json({
        authenticated: false
      });
    }
  });
  return { requireAdmin: requireAdmin2, requirePublisher, canManageProducts, canViewContacts, canManageAppointments };
}

// server/backup.ts
init_storage();
import { Pool as Pool2 } from "@neondatabase/serverless";
import ws2 from "ws";
var neonConfig2 = { webSocketConstructor: ws2 };
async function createBackup() {
  try {
    const backupUrl = process.env.NEW_DATABASE_URL;
    if (!backupUrl) {
      return {
        success: false,
        message: "\u0639\u0630\u0631\u0627\u064B\u060C \u0631\u0627\u0628\u0637 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631",
        error: "NEW_DATABASE_URL not configured"
      };
    }
    const backupDb = new Pool2({
      connectionString: backupUrl,
      ...neonConfig2
    });
    console.log("\u0628\u062F\u0621 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0645\u0639 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u0634\u0627\u0645\u0644...");
    await ensureTablesExist(backupDb);
    const tables = [
      { name: "users", method: "getAllUsers" },
      { name: "products", method: "getAllProducts" },
      { name: "product_images", method: "getAllProductImages" },
      { name: "settings", method: "getAllSettings" },
      { name: "contacts", method: "getAllContacts" },
      { name: "appointments", method: "getAllAppointments" },
      { name: "faqs", method: "getAllFaqs" }
    ];
    let totalRecords = 0;
    const tablesBackedUp = [];
    const verificationResults = [];
    for (const table of tables) {
      try {
        console.log(`\u0646\u0633\u062E \u062C\u062F\u0648\u0644: ${table.name}`);
        let data = [];
        try {
          switch (table.name) {
            case "users":
              data = await storage.getAllUsers();
              break;
            case "products":
              data = await storage.getAllProducts();
              break;
            case "product_images":
              data = await storage.getAllProductImages();
              break;
            case "settings":
              data = await storage.getAllSettings();
              break;
            case "contacts":
              data = await storage.getAllContacts();
              break;
            case "appointments":
              data = await storage.getAllAppointments();
              break;
            case "faqs":
              data = await storage.getAllFaqs();
              break;
            default:
              console.log(`Skipping table ${table.name} - method not available`);
              continue;
          }
        } catch (methodError) {
          console.log(`Method not available for ${table.name}, skipping...`);
          continue;
        }
        if (data.length > 0) {
          await backupDb.query(`DELETE FROM ${table.name}`);
          let insertedCount = 0;
          for (const record of data) {
            try {
              const cleanRecord = cleanRecordForInsert(record);
              const allowedColumns = await getTableColumns(backupDb, table.name);
              const filteredRecord = {};
              Object.keys(cleanRecord).forEach((key) => {
                if (allowedColumns.includes(key.toLowerCase())) {
                  filteredRecord[key] = cleanRecord[key];
                }
              });
              if (Object.keys(filteredRecord).length === 0) {
                console.log(`\u062A\u062E\u0637\u064A \u0633\u062C\u0644 \u0641\u0627\u0631\u063A \u0645\u0646 ${table.name}`);
                continue;
              }
              const columns = Object.keys(filteredRecord);
              const values = Object.values(filteredRecord);
              const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
              const insertQuery = `
                INSERT INTO ${table.name} (${columns.join(", ")})
                VALUES (${placeholders})
                ON CONFLICT DO NOTHING
              `;
              const result = await backupDb.query(insertQuery, values);
              if (result.rowCount && result.rowCount > 0) {
                insertedCount++;
              }
            } catch (insertError) {
              console.error(`\u062E\u0637\u0623 \u0641\u064A \u0625\u062F\u0631\u0627\u062C \u0633\u062C\u0644 \u0645\u0646 ${table.name}:`, insertError);
            }
          }
          const verifyResult = await backupDb.query(`SELECT COUNT(*) as count FROM ${table.name}`);
          const backupCount = parseInt(verifyResult.rows[0].count);
          console.log(`\u062A\u0645 \u0646\u0633\u062E ${insertedCount} \u0635\u0641 \u0645\u0646 ${data.length} \u0625\u0644\u0649 \u062C\u062F\u0648\u0644 ${table.name}`);
          console.log(`\u0627\u0644\u062A\u062D\u0642\u0642: \u064A\u0648\u062C\u062F ${backupCount} \u0635\u0641 \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629`);
          verificationResults.push(`${table.name}: ${data.length} \u2192 ${backupCount} (${insertedCount} \u0645\u062F\u0631\u062C)`);
          totalRecords += insertedCount;
          tablesBackedUp.push(table.name);
        } else {
          console.log(`\u062C\u062F\u0648\u0644 ${table.name} \u0641\u0627\u0631\u063A`);
          verificationResults.push(`${table.name}: \u0641\u0627\u0631\u063A`);
        }
      } catch (error) {
        console.error(`\u062E\u0637\u0623 \u0641\u064A \u0646\u0633\u062E \u062C\u062F\u0648\u0644 ${table.name}:`, error);
        verificationResults.push(`${table.name}: \u062E\u0637\u0623 - ${error}`);
      }
    }
    await backupDb.end();
    const message = `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0628\u0646\u062C\u0627\u062D. \u062A\u0645 \u0646\u0633\u062E ${totalRecords} \u0633\u062C\u0644 \u0645\u0646 ${tablesBackedUp.length} \u062C\u062F\u0648\u0644.

\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062A\u062D\u0642\u0642:
${verificationResults.join("\n")}`;
    return {
      success: true,
      message,
      totalRecords,
      tablesBackedUp
    };
  } catch (error) {
    console.error("\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629:", error);
    return {
      success: false,
      message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
function cleanRecordForInsert(record) {
  const cleaned = {};
  for (const [key, value] of Object.entries(record)) {
    if (value !== void 0 && value !== null) {
      let correctedKey = key;
      if (key === "productId") correctedKey = "product_id";
      if (key === "imageUrl") correctedKey = "image_url";
      if (key === "isMain") correctedKey = "is_main";
      if (key === "displayOrder") correctedKey = "display_order";
      if (key === "createdAt") correctedKey = "created_at";
      if (key === "updatedAt") correctedKey = "updated_at";
      if (key === "updatedat") correctedKey = "updated_at";
      if (key === "isAdmin") correctedKey = "is_admin";
      if (key === "roleType") correctedKey = "role_type";
      if (key === "fullName") correctedKey = "full_name";
      if (key === "stripeCustomerId") correctedKey = "stripe_customer_id";
      if (key === "stripeSubscriptionId") correctedKey = "stripe_subscription_id";
      if (key === "postalCode") correctedKey = "postal_code";
      if (key === "titleAr") correctedKey = "title_ar";
      if (key === "descriptionAr") correctedKey = "description_ar";
      if (key === "isRead") correctedKey = "is_read";
      if (key === "questionAr") correctedKey = "question_ar";
      if (key === "answerAr") correctedKey = "answer_ar";
      if (key === "isActive") correctedKey = "is_active";
      cleaned[correctedKey] = value;
    }
  }
  return cleaned;
}
async function ensureTablesExist(backupDb) {
  const createTablesSQL = `
    -- \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062C\u062F\u0627\u0648\u0644 \u0625\u0630\u0627 \u0644\u0645 \u062A\u0643\u0646 \u0645\u0648\u062C\u0648\u062F\u0629
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT false,
      role_type VARCHAR(50) DEFAULT 'customer',
      email VARCHAR(255),
      full_name VARCHAR(255),
      phone VARCHAR(50),
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      address TEXT,
      city VARCHAR(255),
      postal_code VARCHAR(20),
      country VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      title_ar TEXT,
      description TEXT,
      description_ar TEXT,
      category VARCHAR(255),
      status VARCHAR(50) DEFAULT 'available',
      price DECIMAL(10,2),
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      display_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      is_main BOOLEAN DEFAULT false,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(255) UNIQUE NOT NULL,
      value TEXT,
      category VARCHAR(255),
      label VARCHAR(255),
      type VARCHAR(50),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      subject VARCHAR(255),
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      date DATE NOT NULL,
      time TIME NOT NULL,
      message TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      question_ar TEXT,
      answer TEXT NOT NULL,
      answer_ar TEXT,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await backupDb.query(createTablesSQL);
    console.log("\u062A\u0645 \u0627\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0648\u062C\u0648\u062F \u062C\u0645\u064A\u0639 \u0627\u0644\u062C\u062F\u0627\u0648\u0644 \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629");
  } catch (error) {
    console.error("\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062C\u062F\u0627\u0648\u0644:", error);
    throw error;
  }
}
async function getBackupStatus() {
  try {
    const backupUrl = process.env.NEW_DATABASE_URL;
    console.log("Checking backup URL availability:", !!backupUrl);
    if (!backupUrl) {
      console.log("NEW_DATABASE_URL not found");
      return { available: false };
    }
    const backupDb = new Pool2({
      connectionString: backupUrl,
      ...neonConfig2
    });
    const testQuery = await backupDb.query("SELECT 1 as test");
    console.log("Backup database connection test:", testQuery.rows[0]);
    let hasData = false;
    try {
      const result = await backupDb.query("SELECT COUNT(*) as count FROM users");
      hasData = parseInt(result.rows[0].count) > 0;
      console.log("Users in backup database:", result.rows[0].count);
    } catch (tableError) {
      console.log("Users table does not exist in backup database yet");
    }
    await backupDb.end();
    return {
      available: true,
      lastBackup: hasData ? /* @__PURE__ */ new Date() : void 0
    };
  } catch (error) {
    console.error("Backup status check error:", error);
    return { available: false };
  }
}
async function getTableColumns(backupDb, tableName) {
  try {
    const result = await backupDb.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);
    return result.rows.map((row) => row.column_name.toLowerCase());
  } catch (error) {
    console.error(`\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0623\u0639\u0645\u062F\u0629 \u0627\u0644\u062C\u062F\u0648\u0644 ${tableName}:`, error);
    return [];
  }
}

// server/jobs/backup-scheduler.ts
import cron from "node-cron";
var isBackupRunning = false;
function startBackupScheduler() {
  console.log("\u062A\u0634\u063A\u064A\u0644 \u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A...");
  cron.schedule("0 2 * * *", async () => {
    if (isBackupRunning) {
      console.log("\u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u0642\u064A\u062F \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0628\u0627\u0644\u0641\u0639\u0644\u060C \u062A\u062E\u0637\u064A \u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u0629");
      return;
    }
    console.log("\u0628\u062F\u0621 \u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A \u0627\u0644\u064A\u0648\u0645\u064A...");
    isBackupRunning = true;
    try {
      const status = await getBackupStatus();
      if (!status.available) {
        console.log("\u0646\u0638\u0627\u0645 \u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631\u060C \u062A\u062E\u0637\u064A \u0627\u0644\u0646\u0633\u062E \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A");
        return;
      }
      const result = await createBackup();
      if (result.success) {
        console.log("\u2705 \u062A\u0645 \u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A \u0628\u0646\u062C\u0627\u062D");
        console.log(`\u062A\u0645 \u0646\u0633\u062E ${result.totalRecords} \u0633\u062C\u0644 \u0645\u0646 ${result.tablesBackedUp?.length} \u062C\u062F\u0648\u0644`);
      } else {
        console.error("\u274C \u0641\u0634\u0644 \u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A:", result.message);
      }
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A:", error);
    } finally {
      isBackupRunning = false;
    }
  }, {
    timezone: "America/Toronto"
    // توقيت كندا
  });
  setTimeout(async () => {
    console.log("\u0641\u062D\u0635 \u0625\u0645\u0643\u0627\u0646\u064A\u0629 \u0625\u062C\u0631\u0627\u0621 \u0646\u0633\u062E \u0627\u062D\u062A\u064A\u0627\u0637\u064A \u0623\u0648\u0644\u064A...");
    try {
      const status = await getBackupStatus();
      if (status.available && !status.lastBackup) {
        console.log("\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0646\u0633\u062E \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0633\u0627\u0628\u0642\u0629\u060C \u0628\u062F\u0621 \u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0623\u0648\u0644\u064A...");
        isBackupRunning = true;
        const result = await createBackup();
        if (result.success) {
          console.log("\u2705 \u062A\u0645 \u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u0627\u0644\u0623\u0648\u0644\u064A \u0628\u0646\u062C\u0627\u062D");
        }
        isBackupRunning = false;
      }
    } catch (error) {
      console.log("\u062A\u062E\u0637\u064A \u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u0627\u0644\u0623\u0648\u0644\u064A:", error instanceof Error ? error.message : "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641");
      isBackupRunning = false;
    }
  }, 1e4);
  console.log("\u062A\u0645 \u062A\u0643\u0648\u064A\u0646 \u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A \u0644\u064A\u0639\u0645\u0644 \u064A\u0648\u0645\u064A\u0627\u064B \u0641\u064A \u0627\u0644\u0633\u0627\u0639\u0629 2:00 \u0635\u0628\u0627\u062D\u0627\u064B (\u062A\u0648\u0642\u064A\u062A \u0643\u0646\u062F\u0627)");
}
function getBackupSchedulerStatus() {
  return {
    isRunning: !isBackupRunning,
    nextRun: getNextBackupTime(),
    timezone: "America/Toronto"
  };
}
function getNextBackupTime() {
  const now = /* @__PURE__ */ new Date();
  const nextBackup = /* @__PURE__ */ new Date();
  nextBackup.setHours(2, 0, 0, 0);
  if (now.getHours() >= 2) {
    nextBackup.setDate(nextBackup.getDate() + 1);
  }
  return nextBackup.toLocaleString("ar-EG", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// server/routes.ts
async function registerRoutes(app2) {
  const { requireAdmin: requireAdmin2, requirePublisher, canManageProducts, canViewContacts, canManageAppointments } = setupAuth(app2);
  const httpServer = createServer(app2);
  setupWebSocket(httpServer);
  app2.use(visitor_stats_default);
  app2.use(notifications_default);
  app2.use(categories_default);
  app2.use("/api/customer", customer_default);
  app2.use("/api/stripe", stripe_default);
  app2.use("/api/cart", cart_default);
  app2.use("/api/orders", order_default);
  app2.use("/api/shipping", shipping_default);
  app2.use("/api/admin/orders", requireAdmin2, admin_orders_default);
  app2.use("/api/admin/shipping", requireAdmin2, admin_shipping_default);
  const adminAllowedCitiesRouter = (await Promise.resolve().then(() => (init_admin_allowed_cities(), admin_allowed_cities_exports))).default;
  app2.use(adminAllowedCitiesRouter);
  const adminNotificationsRouter = (await Promise.resolve().then(() => (init_admin_notifications(), admin_notifications_exports))).default;
  app2.use("/api/admin/notifications", requireAdmin2, adminNotificationsRouter);
  app2.get("/api/products", async (_req, res) => {
    try {
      const products2 = await storage.getAllProducts();
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  app2.get("/api/products/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const products2 = await storage.getProductsByCategory(category);
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });
  app2.post("/api/admin/products", canManageProducts, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z4.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  app2.put("/api/admin/products/:id", canManageProducts, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const validatedData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(id, validatedData);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z4.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  app2.patch("/api/admin/products/:id", canManageProducts, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const displayOrder = parseInt(req.body.displayOrder);
      if (isNaN(displayOrder) || displayOrder < 0) {
        return res.status(400).json({ message: "Display order must be a non-negative number" });
      }
      const updatedProduct = await storage.updateProduct(id, { displayOrder });
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product display order:", error);
      res.status(500).json({ message: "Failed to update product display order" });
    }
  });
  app2.delete("/api/admin/products/:id", requireAdmin2, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      await createContactNotification(contact.id, contact.name, contact.message);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z4.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });
  app2.get("/api/admin/contacts", canViewContacts, async (_req, res) => {
    try {
      const contacts2 = await storage.getAllContacts();
      res.json(contacts2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });
  app2.get("/api/admin/contacts/:id", canViewContacts, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContactById(contactId);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });
  app2.patch("/api/admin/contacts/:id/read", requireAdmin2, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const { isRead } = req.body;
      const contact = await storage.getContactById(contactId);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      const updatedContact = await storage.updateContactReadStatus(contactId, isRead);
      res.json(updatedContact);
    } catch (error) {
      res.status(500).json({ message: "Failed to update contact read status" });
    }
  });
  app2.delete("/api/admin/contacts/:id", requireAdmin2, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContactById(contactId);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      await storage.deleteContact(contactId);
      res.json({ success: true, message: "Contact deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });
  app2.post("/api/subscribe", async (req, res) => {
    try {
      const validatedData = insertSubscriberSchema.parse(req.body);
      const subscriber = await storage.createSubscriber(validatedData);
      res.status(201).json(subscriber);
    } catch (error) {
      if (error instanceof z4.ZodError) {
        return res.status(400).json({ message: "Invalid subscriber data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to subscribe" });
    }
  });
  app2.get("/api/admin/subscribers", requireAdmin2, async (_req, res) => {
    try {
      const subscribers2 = await storage.getAllSubscribers();
      res.json(subscribers2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });
  app2.post("/api/admin/subscribers/import-contacts", requireAdmin2, async (_req, res) => {
    try {
      const contacts2 = await storage.getAllContacts();
      if (contacts2.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No contacts found to import"
        });
      }
      const existingSubscribers = await storage.getAllSubscribers();
      const existingEmails = new Set(existingSubscribers.map((sub) => sub.email));
      const existingPhones = new Set(existingSubscribers.filter((sub) => sub.phone).map((sub) => sub.phone));
      let imported = 0;
      let skipped = 0;
      for (const contact of contacts2) {
        if (!contact.phone || existingPhones.has(contact.phone)) {
          skipped++;
          continue;
        }
        const existingWithEmail = existingEmails.has(contact.email);
        if (existingWithEmail) {
          const subToUpdate = existingSubscribers.find((sub) => sub.email === contact.email);
          if (subToUpdate && !subToUpdate.phone) {
            await storage.updateSubscriber(subToUpdate.id, { phone: contact.phone });
            imported++;
          } else {
            skipped++;
          }
        } else {
          await storage.createSubscriber({
            email: contact.email,
            phone: contact.phone
          });
          imported++;
          existingEmails.add(contact.email);
          existingPhones.add(contact.phone);
        }
      }
      res.status(200).json({
        success: true,
        message: `Successfully imported ${imported} contacts to subscribers. ${skipped} contacts were skipped (already exist or missing phone).`,
        imported,
        skipped
      });
    } catch (error) {
      console.error("Contact import error:", error);
      res.status(500).json({
        success: false,
        message: `Failed to import contacts: ${error.message || "Unknown error"}`
      });
    }
  });
  app2.post("/api/admin/subscribers/import-from-messages", requireAdmin2, async (_req, res) => {
    try {
      const contacts2 = await storage.getAllContacts();
      if (contacts2.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No contacts found to import"
        });
      }
      const existingSubscribers = await storage.getAllSubscribers();
      const existingPhones = new Set(existingSubscribers.filter((sub) => sub.phone).map((sub) => sub.phone));
      const phoneRegex = /(?:\+)?[0-9]{10,15}/g;
      let imported = 0;
      let skipped = 0;
      for (const contact of contacts2) {
        if (contact.phone && contact.phone.trim()) {
          let contactPhone = contact.phone.trim();
          if (!contactPhone.startsWith("+")) {
            contactPhone = "+" + contactPhone;
          }
          if (existingPhones.has(contactPhone)) {
            skipped++;
          } else {
            await storage.createSubscriber({
              email: contact.email || "",
              phone: contactPhone
            });
            imported++;
            existingPhones.add(contactPhone);
          }
        }
        if (contact.message && contact.message.trim()) {
          const message = contact.message.trim();
          const matches = message.match(phoneRegex);
          if (matches && matches.length > 0) {
            for (const match of matches) {
              let phoneNumber = match.replace(/\s/g, "").trim();
              if (!phoneNumber.startsWith("+")) {
                phoneNumber = "+" + phoneNumber;
              }
              if (existingPhones.has(phoneNumber)) {
                skipped++;
                continue;
              }
              await storage.createSubscriber({
                email: contact.email || "",
                phone: phoneNumber
              });
              imported++;
              existingPhones.add(phoneNumber);
            }
          }
        }
      }
      res.status(200).json({
        success: true,
        message: `Successfully imported ${imported} phone numbers from messages. ${skipped} numbers were skipped (already exist).`,
        imported,
        skipped
      });
    } catch (error) {
      console.error("Message phone import error:", error);
      res.status(500).json({
        success: false,
        message: `Failed to import phone numbers from messages: ${error.message || "Unknown error"}`
      });
    }
  });
  app2.post("/api/admin/sms/send", requireAdmin2, async (req, res) => {
    try {
      const { to, body } = req.body;
      if (!to || !body) {
        const missingFields = [];
        if (!to) missingFields.push("to");
        if (!body) missingFields.push("body");
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`
        });
      }
      const phoneRegex = /^\+[0-9]{10,15}$/;
      if (!phoneRegex.test(to)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format. Must be in international format starting with + (e.g., +1234567890)"
        });
      }
      const result = await sendSMS(to, body);
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error("SMS send error:", error);
      res.status(500).json({
        success: false,
        message: `Failed to send SMS: ${error.message || "Unknown error"}`
      });
    }
  });
  app2.post("/api/admin/sms/bulk", requireAdmin2, async (req, res) => {
    try {
      const { to, body } = req.body;
      if (!to || !Array.isArray(to) || to.length === 0 || !body) {
        const errors = [];
        if (!to) errors.push('Missing "to" field');
        else if (!Array.isArray(to)) errors.push('"to" must be an array');
        else if (to.length === 0) errors.push('"to" array cannot be empty');
        if (!body) errors.push('Missing "body" field');
        return res.status(400).json({
          success: false,
          message: `Validation error: ${errors.join(", ")}`
        });
      }
      const phoneRegex = /^\+[0-9]{10,15}$/;
      const invalidNumbers = to.filter((number) => !phoneRegex.test(number));
      if (invalidNumbers.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format detected. All numbers must be in international format starting with + (e.g., +1234567890)",
          invalidNumbers
        });
      }
      const results = await sendBulkSMS(to, body);
      const allSuccessful = results.every((result) => result.success);
      if (allSuccessful) {
        res.status(200).json({
          success: true,
          message: `Successfully sent ${results.length} messages`,
          results
        });
      } else {
        const successCount = results.filter((r) => r.success).length;
        const failureCount = results.length - successCount;
        res.status(207).json({
          success: false,
          message: `Partially successful: ${successCount} sent, ${failureCount} failed`,
          results
        });
      }
    } catch (error) {
      console.error("Bulk SMS send error:", error);
      res.status(500).json({
        success: false,
        message: `Failed to send bulk SMS: ${error.message || "Unknown error"}`
      });
    }
  });
  app2.post("/api/admin/sms/subscribers", requireAdmin2, async (req, res) => {
    try {
      const { body } = req.body;
      if (!body) {
        return res.status(400).json({
          success: false,
          message: "Missing required field: body"
        });
      }
      const subscribers2 = await storage.getAllSubscribers();
      if (subscribers2.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No subscribers found to send SMS to"
        });
      }
      const subscribersWithPhone = subscribers2.filter((sub) => sub.phone && sub.phone.startsWith("+"));
      if (subscribersWithPhone.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No subscribers with valid phone numbers found"
        });
      }
      const phoneNumbers = subscribersWithPhone.map((sub) => sub.phone);
      const results = await sendBulkSMS(phoneNumbers, body);
      const allSuccessful = results.every((result) => result.success);
      if (allSuccessful) {
        res.status(200).json({
          success: true,
          message: `Successfully sent ${results.length} messages to subscribers`,
          results
        });
      } else {
        const successCount = results.filter((r) => r.success).length;
        const failureCount = results.length - successCount;
        res.status(207).json({
          success: false,
          message: `Partially successful: ${successCount} sent, ${failureCount} failed`,
          results
        });
      }
    } catch (error) {
      console.error("Subscriber SMS send error:", error);
      res.status(500).json({
        success: false,
        message: `Failed to send SMS to subscribers: ${error.message || "Unknown error"}`
      });
    }
  });
  app2.post("/api/admin/subscribers/email", requireAdmin2, async (req, res) => {
    try {
      console.log("Newsletter request received:", {
        hasSubject: !!req.body.subject,
        hasContent: !!req.body.content,
        isHtml: !!req.body.isHtml,
        fromEmail: req.body.fromEmail
      });
      const { subject, content, isHtml = false, fromEmail } = req.body;
      if (!subject || !content || !fromEmail) {
        const missingFields = [];
        if (!subject) missingFields.push("subject");
        if (!content) missingFields.push("content");
        if (!fromEmail) missingFields.push("fromEmail");
        console.warn("Missing required newsletter fields:", missingFields);
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} required`
        });
      }
      const subscribers2 = await storage.getAllSubscribers();
      console.log(`Found ${subscribers2.length} subscribers`);
      if (subscribers2.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No subscribers found to send email to"
        });
      }
      const emails = subscribers2.map((subscriber) => subscriber.email).filter(Boolean);
      console.log(`Processing ${emails.length} subscriber emails`);
      console.log("Calling sendBulkEmails function...");
      const result = await sendBulkEmails(
        emails,
        fromEmail,
        subject,
        content,
        isHtml
      );
      console.log("sendBulkEmails result:", result);
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json({
          ...result,
          diagnosticInfo: {
            senderEmail: fromEmail,
            receiverCount: emails.length,
            contentType: isHtml ? "HTML" : "Plain Text",
            apiKeyConfigured: !!process.env.SENDGRID_API_KEY
          }
        });
      }
    } catch (error) {
      console.error("Newsletter route error:", error);
      res.status(500).json({
        success: false,
        message: `Failed to send newsletter: ${error.message || "Unknown error"}`,
        stack: process.env.NODE_ENV === "development" ? error.stack : void 0
      });
    }
  });
  app2.get("/api/settings", async (req, res) => {
    try {
      const category = req.query.category;
      const settings2 = category ? await storage.getSettingsByCategory(category) : await storage.getAllSettings();
      res.json(settings2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  app2.get("/api/settings/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const setting = await storage.getSetting(key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });
  app2.patch("/api/settings/:key", requireAdmin2, async (req, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }
      const setting = await storage.updateSetting(key, value);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });
  app2.post("/api/settings/upload-logo", requireAdmin2, upload.single("logo"), handleUploadError, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }
      const logoPublicId = `jaberco_site_logo_${Date.now()}`;
      const uploadResult = await uploadImage(req.file.path, logoPublicId);
      fs4.unlinkSync(req.file.path);
      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload logo to cloud storage",
          error: uploadResult.error
        });
      }
      const logoUrl = uploadResult.imageUrl || "";
      const setting = await storage.updateSetting("site_logo", logoUrl);
      if (!setting) {
        return res.status(404).json({ success: false, message: "Site logo setting not found" });
      }
      res.json({
        success: true,
        setting,
        logoUrl
      });
    } catch (error) {
      console.error("Error uploading site logo:", error);
      res.status(500).json({ success: false, message: "Error uploading site logo" });
    }
  });
  app2.post("/api/settings/upload-image", requireAdmin2, upload.single("image"), handleUploadError, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }
      const settingKey = req.body.settingKey;
      if (!settingKey) {
        return res.status(400).json({ success: false, message: "Setting key is required" });
      }
      const existingSetting = await storage.getSetting(settingKey);
      if (!existingSetting) {
        return res.status(404).json({ success: false, message: "Setting not found" });
      }
      const publicId = `jaberco_setting_${settingKey}_${Date.now()}`;
      const uploadResult = await uploadImage(req.file.path, publicId);
      fs4.unlinkSync(req.file.path);
      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to cloud storage",
          error: uploadResult.error
        });
      }
      const imageUrl = uploadResult.imageUrl || "";
      const setting = await storage.updateSetting(settingKey, imageUrl);
      if (!setting) {
        return res.status(404).json({ success: false, message: "Setting update failed" });
      }
      res.json({
        success: true,
        setting,
        imageUrl
      });
    } catch (error) {
      console.error("Error uploading setting image:", error);
      res.status(500).json({ success: false, message: "Error uploading image" });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    import("passport").then((passportModule) => {
      const passport2 = passportModule.default;
      passport2.authenticate("local", (err, user, info) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({
            success: false,
            message: "Internal server error during login"
          });
        }
        if (!user) {
          return res.status(401).json({
            success: false,
            message: info?.message || "Invalid username or password"
          });
        }
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error("Session creation error:", loginErr);
            return res.status(500).json({
              success: false,
              message: "Failed to create session"
            });
          }
          console.log("User logged in successfully:", user.username);
          return res.status(200).json({
            success: true,
            message: "Login successful",
            user
          });
        });
      })(req, res, next);
    });
  });
  app2.post("/api/logout", (req, res) => {
    const username = req.user?.username;
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to logout"
        });
      }
      console.log("User logged out successfully:", username);
      res.status(200).json({
        success: true,
        message: "Logged out successfully"
      });
    });
  });
  app2.get("/api/session", (req, res) => {
    try {
      if (req.isAuthenticated()) {
        const user = req.user;
        console.log("Session check - authenticated:", user?.username);
        return res.json({
          authenticated: true,
          user,
          sessionID: req.sessionID
        });
      }
      console.log("Session check - not authenticated");
      res.json({
        authenticated: false,
        sessionID: req.sessionID
      });
    } catch (error) {
      console.error("Session check error:", error);
      res.status(500).json({
        authenticated: false,
        error: "Failed to check authentication status"
      });
    }
  });
  app2.use("/uploads", express7.static(path4.join(process.cwd(), "public/uploads")));
  app2.post("/api/upload", requireAdmin2, upload.single("image"), handleUploadError, async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    try {
      const uploadResult = await uploadImage(req.file.path);
      fs4.unlinkSync(req.file.path);
      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to cloud storage",
          error: uploadResult.error
        });
      }
      return res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        fileUrl: uploadResult.imageUrl,
        publicId: uploadResult.publicId
      });
    } catch (error) {
      console.error("Error uploading file to cloud storage:", error);
      return res.status(500).json({
        success: false,
        message: "Error uploading file",
        error: error.message
      });
    }
  });
  app2.post("/api/admin/products/:id/image", canManageProducts, upload.single("image"), handleUploadError, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      try {
        const productPublicId = `product_${id}_${Date.now()}`;
        const uploadResult = await uploadImage(req.file.path, productPublicId);
        fs4.unlinkSync(req.file.path);
        if (!uploadResult.success) {
          return res.status(500).json({
            success: false,
            message: "Failed to upload image to cloud storage",
            error: uploadResult.error
          });
        }
        const fileUrl = uploadResult.imageUrl;
        console.log("File URL from Cloudinary:", fileUrl);
        const isMain = req.body.isMain === "true";
        let displayOrder = 0;
        if (req.body.displayOrder) {
          displayOrder = parseInt(req.body.displayOrder);
          if (isNaN(displayOrder)) displayOrder = 0;
        }
        const cloudinaryData = {
          publicId: uploadResult.publicId,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format
        };
        const productImage = await storage.addProductImage({
          productId: id,
          imageUrl: fileUrl || "",
          // نتأكد من أن fileUrl ليس undefined
          isMain: isMain || false,
          displayOrder: displayOrder || 0
        });
        if (isMain) {
          await storage.setMainProductImage(id, productImage.id);
        }
        const existingImages = await storage.getProductImages(id);
        if (isMain || existingImages.length === 1) {
          await storage.updateProduct(id, { imageUrl: fileUrl });
        }
        return res.status(200).json({
          success: true,
          message: "Product image added successfully",
          image: productImage
        });
      } catch (uploadError) {
        console.error("Error uploading product image to cloud storage:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading product image to cloud storage",
          error: uploadError.message
        });
      }
    } catch (error) {
      console.error("Product image upload error:", error);
      return res.status(500).json({ success: false, message: "Failed to add product image", error: error.message });
    }
  });
  app2.get("/api/products/:id/images", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const images = await storage.getProductImages(id);
      return res.status(200).json(images);
    } catch (error) {
      console.error("Error getting product images:", error);
      return res.status(500).json({ message: "Error retrieving product images" });
    }
  });
  app2.patch("/api/admin/products/:productId/images/:imageId/main", canManageProducts, async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const imageId = parseInt(req.params.imageId);
      if (isNaN(productId) || isNaN(imageId)) {
        return res.status(400).json({ message: "Invalid product or image ID" });
      }
      const success = await storage.setMainProductImage(productId, imageId);
      if (success) {
        return res.status(200).json({ success: true, message: "Main product image updated" });
      } else {
        return res.status(404).json({ success: false, message: "Product image not found" });
      }
    } catch (error) {
      console.error("Error setting main product image:", error);
      return res.status(500).json({ message: "Error updating main product image" });
    }
  });
  app2.delete("/api/admin/products/images/:imageId", canManageProducts, async (req, res) => {
    try {
      const imageId = parseInt(req.params.imageId);
      if (isNaN(imageId)) {
        return res.status(400).json({ message: "Invalid image ID" });
      }
      const imageDetails = await storage.getProductImageById(imageId);
      if (!imageDetails) {
        return res.status(404).json({ success: false, message: "Product image not found" });
      }
      const success = await storage.deleteProductImage(imageId);
      if (success) {
        if (imageDetails.imageUrl && imageDetails.imageUrl.includes("cloudinary.com")) {
          try {
            const publicId = extractPublicIdFromUrl(imageDetails.imageUrl);
            if (publicId) {
              await deleteImage(publicId);
              console.log(`Deleted image from Cloudinary: ${publicId}`);
            }
          } catch (cloudinaryError) {
            console.error("Error deleting image from Cloudinary:", cloudinaryError);
          }
        }
        return res.status(200).json({ success: true, message: "Product image deleted" });
      } else {
        return res.status(404).json({ success: false, message: "Failed to delete product image" });
      }
    } catch (error) {
      console.error("Error deleting product image:", error);
      return res.status(500).json({
        message: "Error deleting product image",
        error: error.message
      });
    }
  });
  app2.get("/api/faqs", async (req, res) => {
    try {
      const faqs2 = await storage.getAllFaqs();
      res.json(faqs2);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });
  app2.get("/api/admin/faqs", requireAdmin2, async (req, res) => {
    try {
      const faqs2 = await storage.getAllFaqs();
      res.json(faqs2);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });
  app2.get("/api/admin/faqs/:id", requireAdmin2, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid FAQ ID" });
      }
      const faq = await storage.getFaqById(id);
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json(faq);
    } catch (error) {
      console.error("Error fetching FAQ:", error);
      res.status(500).json({ message: "Failed to fetch FAQ" });
    }
  });
  app2.post("/api/admin/faqs", requireAdmin2, async (req, res) => {
    try {
      const validatedData = insertFaqSchema.parse(req.body);
      const faq = await storage.createFaq(validatedData);
      res.status(201).json(faq);
    } catch (error) {
      if (error instanceof z4.ZodError) {
        return res.status(400).json({ message: "Invalid FAQ data", errors: error.errors });
      }
      console.error("Error creating FAQ:", error);
      res.status(500).json({ message: "Failed to create FAQ" });
    }
  });
  app2.put("/api/admin/faqs/:id", requireAdmin2, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid FAQ ID" });
      }
      const validatedData = insertFaqSchema.partial().parse(req.body);
      const updatedFaq = await storage.updateFaq(id, validatedData);
      if (!updatedFaq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json(updatedFaq);
    } catch (error) {
      if (error instanceof z4.ZodError) {
        return res.status(400).json({ message: "Invalid FAQ data", errors: error.errors });
      }
      console.error("Error updating FAQ:", error);
      res.status(500).json({ message: "Failed to update FAQ" });
    }
  });
  app2.delete("/api/admin/faqs/:id", requireAdmin2, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid FAQ ID" });
      }
      const success = await storage.deleteFaq(id);
      if (!success) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      res.status(500).json({ message: "Failed to delete FAQ" });
    }
  });
  app2.post("/api/appointments", async (req, res) => {
    try {
      const result = await storage.createAppointment(req.body);
      const appointmentDateTime = /* @__PURE__ */ new Date(`${result.date} ${result.time}`);
      await createAppointmentNotification(
        result.id,
        result.name,
        appointmentDateTime
      );
      res.status(201).json({ success: true, appointment: result });
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ success: false, message: "Failed to create appointment" });
    }
  });
  app2.get("/api/admin/appointments", canManageAppointments, async (req, res) => {
    try {
      const appointments2 = await storage.getAllAppointments();
      res.status(200).json(appointments2);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ success: false, message: "Failed to fetch appointments" });
    }
  });
  app2.get("/api/admin/appointments/:id", canManageAppointments, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      const appointment = await storage.getAppointmentById(id);
      if (appointment) {
        res.status(200).json(appointment);
      } else {
        res.status(404).json({ success: false, message: "Appointment not found" });
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
      res.status(500).json({ success: false, message: "Failed to fetch appointment" });
    }
  });
  app2.patch("/api/admin/appointments/:id/status", canManageAppointments, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: "Status is required" });
      }
      const appointment = await storage.updateAppointmentStatus(id, status);
      if (appointment) {
        const appointmentDateTime = /* @__PURE__ */ new Date(`${appointment.date} ${appointment.time}`);
        await createAppointmentStatusNotification(
          id,
          status,
          req.user?.id || 0,
          appointmentDateTime
        );
        res.status(200).json({ success: true, appointment });
      } else {
        res.status(404).json({ success: false, message: "Appointment not found" });
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ success: false, message: "Failed to update appointment status" });
    }
  });
  app2.delete("/api/admin/appointments/:id", canManageAppointments, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      const result = await storage.deleteAppointment(id);
      if (result) {
        res.status(200).json({ success: true, message: "Appointment deleted successfully" });
      } else {
        res.status(404).json({ success: false, message: "Appointment not found" });
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ success: false, message: "Failed to delete appointment" });
    }
  });
  app2.get("/api/admin/users", requireAdmin2, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/admin/users", requireAdmin2, async (req, res) => {
    try {
      const { username, password, roleType } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const isAdmin = roleType === "admin";
      const hashedPassword = await hashPassword2(password);
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        isAdmin,
        roleType
      });
      res.status(201).json({
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
          isAdmin: newUser.isAdmin,
          roleType: newUser.roleType
        }
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.patch("/api/admin/users/:id", requireAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const { username, password, roleType } = req.body;
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (username !== user.username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      const isAdmin = roleType === "admin";
      const updateData = {
        username,
        isAdmin,
        roleType
      };
      if (password) {
        updateData.password = await hashPassword2(password);
      }
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          isAdmin: updatedUser.isAdmin,
          roleType: updatedUser.roleType
        }
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.delete("/api/admin/users/:id", requireAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(userId);
      if (user && user.username === "admin") {
        return res.status(403).json({ message: "Cannot delete the main admin user" });
      }
      const result = await storage.deleteUser(userId);
      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.get("/api/admin/backup/status", requireAdmin2, async (req, res) => {
    try {
      const status = await getBackupStatus();
      res.json(status);
    } catch (error) {
      console.error("Error checking backup status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check backup status"
      });
    }
  });
  app2.post("/api/admin/backup/create", requireAdmin2, async (req, res) => {
    try {
      console.log("Creating backup requested by user:", req.user?.username);
      const result = await createBackup();
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create backup",
        error: error.message
      });
    }
  });
  app2.get("/api/admin/backup/scheduler", requireAdmin2, async (req, res) => {
    try {
      const schedulerStatus = getBackupSchedulerStatus();
      res.json(schedulerStatus);
    } catch (error) {
      console.error("Error getting scheduler status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get scheduler status",
        error: error.message
      });
    }
  });
  return httpServer;
}

// server/jobs/order-cleanup.ts
init_storage();
init_db();
init_schema();
import { eq as eq5, and as and4, lt } from "drizzle-orm";
async function cleanupAbandonedOrders() {
  try {
    console.log("Running abandoned order cleanup job");
    const thresholdTime = /* @__PURE__ */ new Date();
    thresholdTime.setHours(thresholdTime.getHours() - 1);
    const abandonedOrders = await db.select().from(orders).where(
      and4(
        eq5(orders.status, "pending"),
        eq5(orders.paymentStatus, "pending"),
        lt(orders.createdAt, thresholdTime)
      )
    );
    console.log(`Found ${abandonedOrders.length} abandoned orders to clean up`);
    for (const order of abandonedOrders) {
      try {
        await storage.updateOrderStatus(order.id, "cancelled");
        await storage.updateOrderPaymentStatus(order.id, "failed");
        console.log(`Cleaned up abandoned order #${order.id} (created at ${order.createdAt})`);
      } catch (error) {
        console.error(`Error cleaning up order #${order.id}:`, error);
      }
    }
    return abandonedOrders.length;
  } catch (error) {
    console.error("Error in abandoned order cleanup job:", error);
    throw error;
  }
}
function scheduleOrderCleanupJob(intervalMinutes = 15) {
  console.log(`Scheduling abandoned order cleanup job to run every ${intervalMinutes} minutes`);
  setTimeout(() => {
    cleanupAbandonedOrders().catch((err) => {
      console.error("Error in initial abandoned order cleanup job:", err);
    });
  }, 60 * 1e3);
  setInterval(() => {
    cleanupAbandonedOrders().catch((err) => {
      console.error("Error in scheduled abandoned order cleanup job:", err);
    });
  }, intervalMinutes * 60 * 1e3);
}

// server/middleware/security.ts
function securityHeaders(req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://replit.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https://*.cloudinary.com https://*.amazonaws.com https://images.unsplash.com https://upload.wikimedia.org https://res.cloudinary.com https://img.youtube.com https://*.google.com https://*.googleapis.com https://maps.gstatic.com; connect-src 'self' https://api.stripe.com https://*.cloudinary.com https://*.google.com https://*.googleapis.com; frame-src 'self' https://js.stripe.com https://www.google.com https://*.google.com https://maps.google.com https://*.googleapis.com https://www.youtube.com; object-src 'none'; base-uri 'self';"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=(self)"
  );
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
  next();
}
function corsHeaders(req, res, next) {
  const allowedOrigins = process.env.NODE_ENV === "production" ? ["https://jaberco.com", "https://www.jaberco.com"] : "*";
  res.setHeader(
    "Access-Control-Allow-Origin",
    Array.isArray(allowedOrigins) ? allowedOrigins.join(", ") : allowedOrigins
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
}

// server/middleware/bruteForce.ts
var loginAttempts = /* @__PURE__ */ new Map();
var MAX_ATTEMPTS = 5;
var LOCK_WINDOW = 15 * 60 * 1e3;
var ATTEMPT_WINDOW = 60 * 60 * 1e3;
function cleanupLoginAttempts() {
  const now = Date.now();
  loginAttempts.forEach((attempt, key) => {
    if (attempt.lockUntil !== null && attempt.lockUntil < now || attempt.lastAttempt < now - ATTEMPT_WINDOW) {
      loginAttempts.delete(key);
    }
  });
}
setInterval(cleanupLoginAttempts, 60 * 60 * 1e3);
function bruteForceProtection(keyGenerator = (req) => req.ip || "unknown") {
  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    if (!req.path.includes("/login") && !req.path.includes("/register")) {
      return next();
    }
    let attempt = loginAttempts.get(key);
    if (!attempt) {
      attempt = {
        attempts: 0,
        lastAttempt: now,
        lockUntil: null
      };
      loginAttempts.set(key, attempt);
    }
    if (attempt.lockUntil !== null && attempt.lockUntil > now) {
      const waitMinutes = Math.ceil((attempt.lockUntil - now) / (60 * 1e3));
      return res.status(429).json({
        error: "Too many failed attempts",
        message: `Account is temporarily locked. Please try again in ${waitMinutes} minute(s).`
      });
    }
    req.on("end", () => {
      if (res.statusCode === 401) {
        attempt = loginAttempts.get(key) || {
          attempts: 0,
          lastAttempt: now,
          lockUntil: null
        };
        attempt.attempts += 1;
        attempt.lastAttempt = now;
        if (attempt.attempts >= MAX_ATTEMPTS) {
          attempt.lockUntil = now + LOCK_WINDOW;
        }
        loginAttempts.set(key, attempt);
      } else if (res.statusCode === 200 || res.statusCode === 201) {
        loginAttempts.delete(key);
      }
    });
    next();
  };
}
function usernameBruteForceProtection() {
  return bruteForceProtection((req) => {
    const body = req.body || {};
    return body.username || req.ip || "unknown";
  });
}
function ipBruteForceProtection() {
  return bruteForceProtection((req) => req.ip || "unknown");
}

// server/index.ts
config();
var app = express8();
app.use(express8.json());
app.use(express8.urlencoded({ extended: false }));
app.use(securityHeaders);
app.use(corsHeaders);
app.use(usernameBruteForceProtection());
app.use(ipBruteForceProtection());
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  console.log("\u{1F50D} Validating environment configuration...");
  if (!process.env.SESSION_SECRET) {
    console.error("\u274C SESSION_SECRET not properly configured");
    console.log("Please ensure SESSION_SECRET is set in your environment variables");
    process.exit(1);
  }
  console.log("\u2705 Environment configuration validated");
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === "development";
    const message = isDevelopment ? err.message || "Internal Server Error" : "Internal Server Error";
    console.error("[ERROR]", err);
    const response = { message };
    if (isDevelopment) {
      response.stack = err.stack;
      if (err.details) {
        response.details = err.details;
      }
    }
    res.status(status).json(response);
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
    scheduleOrderCleanupJob(15);
    startBackupScheduler();
  });
})();
