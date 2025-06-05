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

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Product management
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Category management
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Product images
  getProductImages(productId: number): Promise<ProductImage[]>;
  createProductImage(image: InsertProductImage): Promise<ProductImage>;
  deleteProductImage(id: number): Promise<boolean>;

  // Settings
  getAllSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  updateSetting(key: string, value: string): Promise<Setting | undefined>;

  // Contacts
  getAllContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  markContactAsRead(id: number): Promise<boolean>;
  deleteContact(id: number): Promise<boolean>;

  // FAQs
  getAllFaqs(): Promise<Faq[]>;
  createFaq(faq: InsertFaq): Promise<Faq>;
  updateFaq(id: number, faq: Partial<InsertFaq>): Promise<Faq | undefined>;
  deleteFaq(id: number): Promise<boolean>;

  // Appointments
  getAllAppointments(): Promise<Appointment[]>;
  getAppointmentById(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment>;
  deleteAppointment(id: number): Promise<boolean>;

  // Subscribers
  getAllSubscribers(): Promise<Subscriber[]>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  deleteSubscriber(id: number): Promise<boolean>;

  // Visitor stats
  createVisitorStat(stat: InsertVisitorStat): Promise<VisitorStat>;
  getVisitorStats(startDate?: Date, endDate?: Date): Promise<VisitorStat[]>;

  // Notifications
  getAllNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;

  // Orders
  getAllOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;

  // Order items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // Shipping zones
  getAllShippingZones(): Promise<ShippingZone[]>;
  createShippingZone(zone: InsertShippingZone): Promise<ShippingZone>;
  updateShippingZone(id: number, zone: Partial<InsertShippingZone>): Promise<ShippingZone | undefined>;

  // Shipping rates
  getAllShippingRates(): Promise<ShippingRate[]>;
  createShippingRate(rate: InsertShippingRate): Promise<ShippingRate>;

  // Locations
  getAllLocations(): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;

  // Allowed cities
  getAllAllowedCities(): Promise<AllowedCity[]>;
  createAllowedCity(city: InsertAllowedCity): Promise<AllowedCity>;

  // Cart management
  getCartByUserId(userId: number): Promise<Cart | undefined>;
  getCartBySessionId(sessionId: string): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  getCartItems(cartId: number): Promise<CartItem[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(cartId: number): Promise<boolean>;
}