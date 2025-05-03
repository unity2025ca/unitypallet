import { pgTable, text, serial, integer, varchar, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for authentication - keep backward compatibility for now
export const users = pgTable("users", {
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

// Customer registration schema (simplified for public registration)
export const customerRegistrationSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    email: true,
    fullName: true,
    phone: true,
    address: true,
    city: true,
    postalCode: true,
    country: true,
  })
  .extend({
    confirmPassword: z.string(),
  });

// Products Categories schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

// Category enum for product categories (for backward compatibility)
export const categoryEnum = pgEnum("category", [
  "electronics",
  "home",
  "toys",
  "mixed",
  "other",
]);

// Status enum for product availability
export const statusEnum = pgEnum("status", [
  "available",
  "limited",
  "soldout",
]);

// Products schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  description: text("description").notNull(),
  descriptionAr: text("description_ar").notNull(),
  category: categoryEnum("category").notNull(),
  status: statusEnum("status").default("available"),
  price: integer("price").notNull(), // Price in Canadian dollars
  imageUrl: text("image_url").notNull(), // Main product image (for backward compatibility)
  displayOrder: integer("display_order").default(0), // Display order for sorting products
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

// Product Images schema - for multiple images per product
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  imageUrl: text("image_url").notNull(),
  isMain: boolean("is_main").default(false), // Whether this is the main product image
  displayOrder: integer("display_order").default(0), // Order to display images
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductImageSchema = createInsertSchema(productImages).omit({
  id: true,
  createdAt: true,
});

// Contact messages schema
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

// Subscribe emails schema
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").unique(), // Made optional but still unique
  phone: text("phone"), // Phone number in international format (e.g. +1234567890)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
  createdAt: true,
});

// FAQ schema
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  displayOrder: integer("display_order").default(0), // Order to display FAQs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types export
// Authentication schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password is required"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type CustomerRegistration = z.infer<typeof customerRegistrationSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = z.infer<typeof insertProductImageSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;

export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = z.infer<typeof insertFaqSchema>;

// Category mapping for UI
export const categoryMap = {
  electronics: "Electronics",
  home: "Home",
  toys: "Toys",
  mixed: "Mixed",
  other: "Other",
};

// Status mapping for UI
export const statusMap = {
  available: "Available",
  limited: "Limited",
  soldout: "Sold Out",
};

// Site settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  category: text("category").notNull(), // e.g., "appearance", "content", "contact"
  label: text("label").notNull(), // Human-readable label for UI
  description: text("description"), // Optional description for UI
  type: text("type").notNull(), // e.g., "text", "color", "image", "boolean"
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Appointments schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  message: text("message"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// إضافة جدول لمتابعة الزوار
export const visitorStats = pgTable("visitor_stats", {
  id: serial("id").primaryKey(),
  visitDate: timestamp("visit_date").notNull().defaultNow(),
  pageUrl: text("page_url").notNull(),
  visitorIp: text("visitor_ip").notNull(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  countryCode: text("country_code"),
  deviceType: text("device_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVisitorStatsSchema = createInsertSchema(visitorStats, {
  id: undefined,
  createdAt: undefined,
});

export type VisitorStat = typeof visitorStats.$inferSelect;
export type InsertVisitorStat = z.infer<typeof insertVisitorStatsSchema>;

// Notifications schema
export const notificationTypeEnum = pgEnum("notification_type", [
  "new_contact", 
  "new_appointment", 
  "status_update"
]);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedId: integer("related_id"),
  isRead: boolean("is_read").default(false),
  created_at: timestamp("created_at").defaultNow()
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  created_at: true
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Order status enum
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "refunded",
]);

// Payment status enum
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending", 
  "paid",
  "failed",
  "refunded",
]);

// Orders schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  status: orderStatusEnum("status").default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),
  paymentIntentId: text("payment_intent_id"),
  subtotal: integer("subtotal").notNull().default(0), // Subtotal without shipping
  shippingCost: integer("shipping_cost").notNull().default(0), // Shipping cost
  total: integer("total").notNull(), // Total including shipping
  shippingAddress: text("shipping_address"),
  shippingCity: text("shipping_city"), 
  shippingPostalCode: text("shipping_postal_code"),
  shippingCountry: text("shipping_country"),
  shippingProvince: text("shipping_province"), // Added province field
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  paymentIntentId: true,
  createdAt: true,
  updatedAt: true,
});

// Order Items schema
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer("quantity").notNull(),
  pricePerUnit: integer("price_per_unit").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

// Cart schema (for shopping cart functionality)
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id"), // For non-logged-in users
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCartSchema = createInsertSchema(carts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Cart Items schema
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull().references(() => carts.id, { onDelete: 'cascade' }),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

// Shipping Zones schema
export const shippingZones = pgTable("shipping_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertShippingZoneSchema = createInsertSchema(shippingZones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Shipping Rates schema
export const shippingRates = pgTable("shipping_rates", {
  id: serial("id").primaryKey(),
  zoneId: integer("zone_id").notNull().references(() => shippingZones.id, { onDelete: 'cascade' }),
  minDistance: integer("min_distance").notNull(), // in kilometers
  maxDistance: integer("max_distance").notNull(), // in kilometers
  baseRate: integer("base_rate").notNull(), // Base shipping rate in cents
  additionalRatePerKm: integer("additional_rate_per_km").notNull(), // Additional rate per km in cents
  minWeight: integer("min_weight"), // in grams, optional
  maxWeight: integer("max_weight"), // in grams, optional
  additionalRatePerKg: integer("additional_rate_per_kg").default(0), // Additional rate per kg in cents
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertShippingRateSchema = createInsertSchema(shippingRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Cities/Locations for shipping distance calculation
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  country: text("country").notNull().default("Canada"),
  postalCode: text("postal_code"),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  isWarehouse: boolean("is_warehouse").default(false), // Is this a warehouse/fulfillment center
  zoneId: integer("zone_id").references(() => shippingZones.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

// Export types for orders and carts
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

// Export types for shipping
export type ShippingZone = typeof shippingZones.$inferSelect;
export type InsertShippingZone = z.infer<typeof insertShippingZoneSchema>;
export type ShippingRate = typeof shippingRates.$inferSelect;
export type InsertShippingRate = z.infer<typeof insertShippingRateSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
