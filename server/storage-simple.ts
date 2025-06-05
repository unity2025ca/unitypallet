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
  getSetting(key: string): Promise<Setting | undefined>;
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
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
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
    // Initialize comprehensive settings with all admin configurations
    const defaultSettings = [
      // General Settings
      { key: 'site_name', value: 'Jaberco', category: 'general', label: 'Site Name', type: 'text', description: 'Website name' },
      { key: 'site_description', value: 'Premium Amazon return pallets - unbeatable deals on quality merchandise', category: 'general', label: 'Site Description', type: 'textarea', description: 'Website description for SEO' },
      { key: 'site_logo', value: 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1746723682/jaberco/loading-logo.gif', category: 'general', label: 'Site Logo', type: 'file', description: 'Website logo' },
      { key: 'favicon', value: '/favicon.ico', category: 'general', label: 'Favicon', type: 'file', description: 'Website favicon' },
      { key: 'timezone', value: 'America/Toronto', category: 'general', label: 'Timezone', type: 'select', description: 'Default timezone' },
      { key: 'currency', value: 'CAD', category: 'general', label: 'Currency', type: 'select', description: 'Default currency' },
      { key: 'language', value: 'en', category: 'general', label: 'Default Language', type: 'select', description: 'Website default language' },
      
      // Contact Information
      { key: 'contact_email', value: 'info@jaberco.com', category: 'contact', label: 'Contact Email', type: 'email', description: 'Primary contact email' },
      { key: 'support_email', value: 'support@jaberco.com', category: 'contact', label: 'Support Email', type: 'email', description: 'Customer support email' },
      { key: 'contact_phone', value: '+1 (289) 216-6500', category: 'contact', label: 'Contact Phone', type: 'text', description: 'Main contact phone number' },
      { key: 'whatsapp_number', value: '12892166500', category: 'contact', label: 'WhatsApp Number', type: 'text', description: 'WhatsApp business number' },
      { key: 'contact_address', value: 'Mississauga, Ontario, Canada', category: 'contact', label: 'Business Address', type: 'textarea', description: 'Full business address' },
      { key: 'business_hours', value: 'Monday-Friday: 9:00 AM - 6:00 PM EST', category: 'contact', label: 'Business Hours', type: 'text', description: 'Operating hours' },
      
      // Appearance & Branding
      { key: 'primary_color', value: '#dc2626', category: 'appearance', label: 'Primary Color', type: 'color', description: 'Main brand color' },
      { key: 'secondary_color', value: '#000000', category: 'appearance', label: 'Secondary Color', type: 'color', description: 'Secondary accent color' },
      { key: 'accent_color', value: '#ffffff', category: 'appearance', label: 'Accent Color', type: 'color', description: 'Text and accent color' },
      { key: 'font_family', value: 'Inter', category: 'appearance', label: 'Font Family', type: 'select', description: 'Main website font' },
      { key: 'header_style', value: 'modern', category: 'appearance', label: 'Header Style', type: 'select', description: 'Website header design' },
      { key: 'footer_style', value: 'standard', category: 'appearance', label: 'Footer Style', type: 'select', description: 'Website footer design' },
      
      // Homepage Content
      { key: 'banner_title', value: 'Welcome to Jaberco - Amazon Return Pallets', category: 'content', label: 'Hero Banner Title', type: 'text', description: 'Main homepage title' },
      { key: 'banner_subtitle', value: 'Discover incredible deals on premium Amazon return pallets', category: 'content', label: 'Hero Banner Subtitle', type: 'text', description: 'Homepage subtitle' },
      { key: 'hero_image', value: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200', category: 'content', label: 'Hero Background Image', type: 'file', description: 'Homepage hero section background' },
      { key: 'about_section', value: 'We specialize in high-quality Amazon return pallets, offering unbeatable deals on merchandise from trusted brands.', category: 'content', label: 'About Section', type: 'textarea', description: 'Homepage about content' },
      { key: 'features_section', value: 'Quality Guaranteed|Fast Shipping|Competitive Prices|Expert Support', category: 'content', label: 'Key Features', type: 'text', description: 'Pipe-separated feature list' },
      { key: 'call_to_action', value: 'Shop Now', category: 'content', label: 'Main CTA Button', type: 'text', description: 'Primary call-to-action text' },
      
      // Business Settings
      { key: 'max_delivery_distance', value: '60', category: 'business', label: 'Max Delivery Distance (km)', type: 'number', description: 'Maximum delivery radius' },
      { key: 'min_order_amount', value: '100', category: 'business', label: 'Minimum Order Amount', type: 'number', description: 'Minimum order value in CAD' },
      { key: 'tax_rate', value: '13', category: 'business', label: 'Tax Rate (%)', type: 'number', description: 'HST/tax percentage' },
      { key: 'shipping_calculation', value: 'distance_weight', category: 'business', label: 'Shipping Method', type: 'select', description: 'Shipping cost calculation method' },
      { key: 'payment_methods', value: 'stripe,cash', category: 'business', label: 'Payment Methods', type: 'text', description: 'Accepted payment methods' },
      { key: 'order_processing_time', value: '1-2', category: 'business', label: 'Processing Time (days)', type: 'text', description: 'Order processing timeframe' },
      
      // SEO Settings
      { key: 'meta_title', value: 'Jaberco - Premium Amazon Return Pallets in Canada', category: 'seo', label: 'Meta Title', type: 'text', description: 'Default page title for SEO' },
      { key: 'meta_description', value: 'Shop premium Amazon return pallets in Ontario. Quality merchandise at unbeatable prices with fast delivery.', category: 'seo', label: 'Meta Description', type: 'textarea', description: 'Default meta description' },
      { key: 'meta_keywords', value: 'amazon returns, pallets, liquidation, wholesale, Ontario, Canada', category: 'seo', label: 'Meta Keywords', type: 'text', description: 'SEO keywords' },
      { key: 'google_analytics', value: '', category: 'seo', label: 'Google Analytics ID', type: 'text', description: 'GA tracking ID' },
      { key: 'facebook_pixel', value: '', category: 'seo', label: 'Facebook Pixel ID', type: 'text', description: 'Facebook tracking pixel' },
      
      // Email Settings
      { key: 'smtp_host', value: '', category: 'email', label: 'SMTP Host', type: 'text', description: 'Email server hostname' },
      { key: 'smtp_port', value: '587', category: 'email', label: 'SMTP Port', type: 'number', description: 'Email server port' },
      { key: 'smtp_user', value: '', category: 'email', label: 'SMTP Username', type: 'text', description: 'Email server username' },
      { key: 'smtp_from_name', value: 'Jaberco Team', category: 'email', label: 'From Name', type: 'text', description: 'Email sender name' },
      { key: 'email_notifications', value: 'true', category: 'email', label: 'Enable Notifications', type: 'boolean', description: 'Send email notifications' },
      
      // Social Media
      { key: 'facebook_url', value: '', category: 'social', label: 'Facebook URL', type: 'url', description: 'Facebook business page' },
      { key: 'instagram_url', value: '', category: 'social', label: 'Instagram URL', type: 'url', description: 'Instagram business account' },
      { key: 'twitter_url', value: '', category: 'social', label: 'Twitter URL', type: 'url', description: 'Twitter business account' },
      { key: 'linkedin_url', value: '', category: 'social', label: 'LinkedIn URL', type: 'url', description: 'LinkedIn company page' },
      { key: 'youtube_url', value: '', category: 'social', label: 'YouTube URL', type: 'url', description: 'YouTube channel' },
      
      // Security Settings
      { key: 'enable_captcha', value: 'true', category: 'security', label: 'Enable CAPTCHA', type: 'boolean', description: 'Enable form protection' },
      { key: 'max_login_attempts', value: '5', category: 'security', label: 'Max Login Attempts', type: 'number', description: 'Login attempt limit' },
      { key: 'session_timeout', value: '7200', category: 'security', label: 'Session Timeout (seconds)', type: 'number', description: 'User session duration' },
      { key: 'password_min_length', value: '8', category: 'security', label: 'Min Password Length', type: 'number', description: 'Minimum password characters' },
      
      // Maintenance
      { key: 'maintenance_mode', value: 'false', category: 'maintenance', label: 'Maintenance Mode', type: 'boolean', description: 'Enable maintenance mode' },
      { key: 'maintenance_message', value: 'We are currently performing scheduled maintenance. Please check back soon.', category: 'maintenance', label: 'Maintenance Message', type: 'textarea', description: 'Message during maintenance' },
      { key: 'backup_frequency', value: 'daily', category: 'maintenance', label: 'Backup Frequency', type: 'select', description: 'Automated backup schedule' },
      { key: 'debug_mode', value: 'false', category: 'maintenance', label: 'Debug Mode', type: 'boolean', description: 'Enable debug logging' },

      // System Settings
      { key: 'admin_email', value: 'admin@jaberco.com', category: 'system', label: 'Admin Email', type: 'email', description: 'Main administrator email' },
      { key: 'max_upload_size', value: '10', category: 'system', label: 'Max Upload Size (MB)', type: 'number', description: 'Maximum file upload size' },
      { key: 'session_timeout', value: '3600', category: 'system', label: 'Session Timeout (seconds)', type: 'number', description: 'User session timeout' },
      { key: 'auto_backup', value: 'true', category: 'system', label: 'Auto Backup', type: 'boolean', description: 'Enable automatic backups' },

      // About Us Settings
      { key: 'about_title', value: 'About Jaberco', category: 'about', label: 'About Page Title', type: 'text', description: 'Title for about page' },
      { key: 'about_description', value: 'Jaberco is your trusted partner for premium Amazon return pallets in Ontario, Canada.', category: 'about', label: 'About Description', type: 'textarea', description: 'Main about description' },
      { key: 'company_story', value: 'Founded with a mission to provide quality liquidation merchandise at unbeatable prices.', category: 'about', label: 'Company Story', type: 'textarea', description: 'Company background story' },
      { key: 'our_mission', value: 'To deliver exceptional value through premium Amazon return pallets.', category: 'about', label: 'Our Mission', type: 'textarea', description: 'Company mission statement' },
      { key: 'years_experience', value: '5', category: 'about', label: 'Years of Experience', type: 'number', description: 'Years in business' },

      // How It Works Settings
      { key: 'how_it_works_title', value: 'How It Works', category: 'how_it_works', label: 'Page Title', type: 'text', description: 'How it works page title' },
      { key: 'step1_title', value: 'Browse Our Pallets', category: 'how_it_works', label: 'Step 1 Title', type: 'text', description: 'First step title' },
      { key: 'step1_description', value: 'Explore our curated selection of Amazon return pallets with detailed descriptions and photos.', category: 'how_it_works', label: 'Step 1 Description', type: 'textarea', description: 'First step description' },
      { key: 'step2_title', value: 'Place Your Order', category: 'how_it_works', label: 'Step 2 Title', type: 'text', description: 'Second step title' },
      { key: 'step2_description', value: 'Select your desired pallets and complete the secure checkout process with multiple payment options.', category: 'how_it_works', label: 'Step 2 Description', type: 'textarea', description: 'Second step description' },
      { key: 'step3_title', value: 'Fast Delivery', category: 'how_it_works', label: 'Step 3 Title', type: 'text', description: 'Third step title' },
      { key: 'step3_description', value: 'Receive your pallets with our reliable delivery service throughout Ontario.', category: 'how_it_works', label: 'Step 3 Description', type: 'textarea', description: 'Third step description' },

      // Appointments Settings
      { key: 'appointments_enabled', value: 'true', category: 'appointments', label: 'Enable Appointments', type: 'boolean', description: 'Allow customers to book appointments' },
      { key: 'appointment_duration', value: '60', category: 'appointments', label: 'Default Duration (minutes)', type: 'number', description: 'Default appointment length' },
      { key: 'working_hours_start', value: '09:00', category: 'appointments', label: 'Working Hours Start', type: 'time', description: 'Business hours start time' },
      { key: 'working_hours_end', value: '17:00', category: 'appointments', label: 'Working Hours End', type: 'time', description: 'Business hours end time' },
      { key: 'max_appointments_per_day', value: '8', category: 'appointments', label: 'Max Appointments/Day', type: 'number', description: 'Maximum daily appointments' },
      { key: 'appointment_advance_booking', value: '24', category: 'appointments', label: 'Advance Booking (hours)', type: 'number', description: 'Minimum advance booking time' },

      // Homepage Banner Settings
      { key: 'banner_title', value: 'Premium Amazon Return Pallets in Ontario', category: 'home_banner', label: 'Banner Title', type: 'text', description: 'Main banner headline' },
      { key: 'banner_subtitle', value: 'Discover unbeatable deals on quality liquidation merchandise', category: 'home_banner', label: 'Banner Subtitle', type: 'text', description: 'Banner subtitle text' },
      { key: 'banner_description', value: 'Get access to authentic Amazon return pallets with detailed manifests and fast delivery across Ontario. Perfect for resellers and bargain hunters.', category: 'home_banner', label: 'Banner Description', type: 'textarea', description: 'Banner description text' },
      { key: 'banner_cta_text', value: 'Shop Pallets Now', category: 'home_banner', label: 'Call-to-Action Text', type: 'text', description: 'Banner button text' },
      { key: 'banner_cta_link', value: '/products', category: 'home_banner', label: 'Call-to-Action Link', type: 'text', description: 'Banner button destination' },
      { key: 'banner_background_image', value: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', category: 'home_banner', label: 'Background Image URL', type: 'image', description: 'Banner background image' },
      { key: 'banner_hero_image', value: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', category: 'home_banner', label: 'Hero Image URL', type: 'image', description: 'Main banner hero image' },

      // Homepage Features Settings
      { key: 'features_title', value: 'Why Choose Jaberco?', category: 'home_features', label: 'Features Section Title', type: 'text', description: 'Features section main title' },
      { key: 'feature1_title', value: 'Authentic Products', category: 'home_features', label: 'Feature 1 Title', type: 'text', description: 'First feature title' },
      { key: 'feature1_description', value: 'Genuine Amazon return items with detailed manifests when available', category: 'home_features', label: 'Feature 1 Description', type: 'textarea', description: 'First feature description' },
      { key: 'feature2_title', value: 'Fast Delivery', category: 'home_features', label: 'Feature 2 Title', type: 'text', description: 'Second feature title' },
      { key: 'feature2_description', value: 'Reliable delivery service throughout Ontario within 1-4 business days', category: 'home_features', label: 'Feature 2 Description', type: 'textarea', description: 'Second feature description' },
      { key: 'feature3_title', value: 'Great Value', category: 'home_features', label: 'Feature 3 Title', type: 'text', description: 'Third feature title' },
      { key: 'feature3_description', value: 'Competitive pricing with bulk discounts for regular customers', category: 'home_features', label: 'Feature 3 Description', type: 'textarea', description: 'Third feature description' },

      // Homepage About Settings
      { key: 'home_about_title', value: 'About Our Business', category: 'home_about', label: 'About Section Title', type: 'text', description: 'Homepage about section title' },
      { key: 'home_about_description', value: 'With 5 years of experience in liquidation merchandise, Jaberco has become Ontario\'s trusted source for Amazon return pallets. We pride ourselves on transparency, quality, and exceptional customer service.', category: 'home_about', label: 'About Description', type: 'textarea', description: 'Homepage about description' },

      // Homepage Products Settings  
      { key: 'home_products_title', value: 'Featured Pallets', category: 'home_products', label: 'Products Section Title', type: 'text', description: 'Homepage products section title' },
      { key: 'home_products_subtitle', value: 'Explore our current selection of premium return pallets', category: 'home_products', label: 'Products Section Subtitle', type: 'text', description: 'Homepage products section subtitle' },

      // Homepage CTA Settings
      { key: 'home_cta_title', value: 'Ready to Start Buying?', category: 'home_cta', label: 'CTA Section Title', type: 'text', description: 'Call-to-action section title' },
      { key: 'home_cta_description', value: 'Join hundreds of satisfied customers who trust Jaberco for their liquidation needs. Browse our current inventory and place your order today.', category: 'home_cta', label: 'CTA Description', type: 'textarea', description: 'Call-to-action description' },
      { key: 'home_cta_button_text', value: 'Browse All Pallets', category: 'home_cta', label: 'CTA Button Text', type: 'text', description: 'Call-to-action button text' },
      { key: 'home_cta_button_link', value: '/products', category: 'home_cta', label: 'CTA Button Link', type: 'text', description: 'Call-to-action button destination' }
    ];

    defaultSettings.forEach(setting => {
      const id = this.getNextId();
      this.data.settings.set(setting.key, { id, ...setting, updatedAt: new Date() });
    });

    // Initialize comprehensive categories with Arabic support
    const defaultCategories = [
      { 
        name: 'Electronics', 
        nameAr: 'الإلكترونيات',
        slug: 'electronics', 
        description: 'Electronic devices, gadgets, smartphones, laptops, and tech accessories',
        descriptionAr: 'الأجهزة الإلكترونية والأدوات التقنية والهواتف الذكية وأجهزة الكمبيوتر المحمولة والإكسسوارات التقنية',
        displayOrder: 1,
        createdAt: new Date()
      },
      { 
        name: 'Home & Garden', 
        nameAr: 'المنزل والحديقة',
        slug: 'home-garden', 
        description: 'Home appliances, furniture, garden tools, and household items',
        descriptionAr: 'الأجهزة المنزلية والأثاث وأدوات الحديقة ومستلزمات المنزل',
        displayOrder: 2,
        createdAt: new Date()
      },
      { 
        name: 'Toys & Games', 
        nameAr: 'الألعاب والترفيه',
        slug: 'toys', 
        description: 'Toys, games, puzzles, and entertainment items for all ages',
        descriptionAr: 'الألعاب والألغاز ومواد الترفيه لجميع الأعمار',
        displayOrder: 3,
        createdAt: new Date()
      },
      { 
        name: 'Mixed Pallets', 
        nameAr: 'المنصات المختلطة',
        slug: 'mixed', 
        description: 'Variety pallets containing multiple product categories',
        descriptionAr: 'منصات متنوعة تحتوي على فئات متعددة من المنتجات',
        displayOrder: 4,
        createdAt: new Date()
      }
    ];

    defaultCategories.forEach(category => {
      const id = this.getNextId();
      this.data.categories.set(id, { id, ...category });
    });

    // Initialize sample products with realistic data and working image URLs
    const sampleProducts = [
      {
        title: 'Electronics Return Pallet - Grade A',
        titleAr: 'منصة إرجاع الإلكترونيات - درجة أ',
        description: 'High-quality electronics return pallet containing smartphones, tablets, headphones, and various tech accessories. All items are customer returns in excellent condition.',
        descriptionAr: 'منصة إرجاع إلكترونيات عالية الجودة تحتوي على هواتف ذكية وأجهزة لوحية وسماعات رأس وإكسسوارات تقنية متنوعة. جميع العناصر مرتجعة من العملاء في حالة ممتازة.',
        price: 299.99,
        category: 'electronics',
        status: 'available',
        imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500',
        displayOrder: 1,
        createdAt: new Date()
      },
      {
        title: 'Home & Kitchen Essentials Pallet',
        titleAr: 'منصة أساسيات المنزل والمطبخ',
        description: 'Comprehensive home and kitchen items including small appliances, cookware, storage solutions, and household essentials from top brands.',
        descriptionAr: 'مجموعة شاملة من المواد المنزلية والمطبخ تشمل الأجهزة الصغيرة وأدوات الطبخ وحلول التخزين والضروريات المنزلية من العلامات التجارية الرائدة.',
        price: 199.99,
        category: 'home',
        status: 'available',
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
        displayOrder: 2,
        createdAt: new Date()
      },
      {
        title: 'Kids Toys & Games Collection',
        titleAr: 'مجموعة ألعاب وألعاب الأطفال',
        description: 'Family-friendly toy collection featuring educational toys, board games, action figures, and creative play items suitable for various age groups.',
        descriptionAr: 'مجموعة ألعاب صديقة للعائلة تضم ألعاب تعليمية وألعاب لوحية وشخصيات أكشن وعناصر لعب إبداعية مناسبة لمختلف الفئات العمرية.',
        price: 149.99,
        category: 'toys',
        status: 'limited',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        displayOrder: 3,
        createdAt: new Date()
      },
      {
        title: 'Premium Mixed Return Pallet',
        titleAr: 'منصة الإرجاع المختلطة المتميزة',
        description: 'Diverse product mix including electronics, home goods, personal care items, and seasonal products. Perfect for resellers looking for variety.',
        descriptionAr: 'مزيج متنوع من المنتجات يشمل الإلكترونيات والمواد المنزلية ومنتجات العناية الشخصية والمنتجات الموسمية. مثالي لإعادة البائعين الذين يبحثون عن التنوع.',
        price: 399.99,
        category: 'mixed',
        status: 'available',
        imageUrl: 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=500',
        displayOrder: 4,
        createdAt: new Date()
      },
      {
        title: 'Health & Beauty Return Pallet',
        titleAr: 'منصة إرجاع الصحة والجمال',
        description: 'Premium health and beauty products including skincare, cosmetics, personal care items, and wellness products from leading brands.',
        descriptionAr: 'منتجات صحية وجمالية متميزة تشمل منتجات العناية بالبشرة ومستحضرات التجميل ومنتجات العناية الشخصية ومنتجات العافية من العلامات التجارية الرائدة.',
        price: 249.99,
        category: 'other',
        status: 'available',
        imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500',
        displayOrder: 5,
        createdAt: new Date()
      },
      {
        title: 'Sports & Outdoors Collection',
        titleAr: 'مجموعة الرياضة والأنشطة الخارجية',
        description: 'Athletic equipment, outdoor gear, fitness accessories, and sporting goods from top brands. Perfect for resellers in the sports market.',
        descriptionAr: 'معدات رياضية وأدوات خارجية وإكسسوارات لياقة بدنية وسلع رياضية من أفضل العلامات التجارية. مثالي لإعادة البائعين في السوق الرياضي.',
        price: 329.99,
        category: 'other',
        status: 'limited',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
        displayOrder: 6,
        createdAt: new Date()
      },
      {
        title: 'Books & Media Pallet',
        titleAr: 'منصة الكتب والوسائط',
        description: 'Educational books, novels, DVDs, video games, and digital media products. Great variety for book and media retailers.',
        descriptionAr: 'كتب تعليمية وروايات وأقراص DVD وألعاب فيديو ومنتجات وسائط رقمية. تنوع كبير لتجار الكتب والوسائط.',
        price: 179.99,
        category: 'other',
        status: 'available',
        imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500',
        displayOrder: 7,
        createdAt: new Date()
      },
      {
        title: 'Fashion & Apparel Returns',
        titleAr: 'مرتجعات الموضة والملابس',
        description: 'Clothing, shoes, accessories, and fashion items from various brands. Mixed sizes and styles suitable for fashion retailers.',
        descriptionAr: 'ملابس وأحذية وإكسسوارات ومواد أزياء من علامات تجارية مختلفة. أحجام وأساليب مختلطة مناسبة لتجار الأزياء.',
        price: 199.99,
        category: 'other',
        status: 'available',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
        displayOrder: 8,
        createdAt: new Date()
      }
    ];

    sampleProducts.forEach(product => {
      const id = this.getNextId();
      this.data.products.set(id, { id, ...product });
      
      // Add main product image
      const imageId = this.getNextId();
      this.data.productImages.set(imageId, {
        id: imageId,
        productId: id,
        imageUrl: product.imageUrl,
        isMain: true,
        displayOrder: 1,
        createdAt: new Date()
      });
    });

    // Initialize default admin user with correct scrypt password hashing
    const defaultUsers = [
      {
        username: 'testadmin',
        password: '13ee8e22b5632af4603e55da52b6c193934d8a79400724c1204ff44a862e4a2f650ee14cf241e928ed27504822d5fbb7757d5e6e9ccfaf338e6a9b92e4d265d2.8299834f58e2f45ce24dd7c55931db1f', // testadmin123 
        email: 'admin@jaberco.com',
        fullName: 'System Administrator',
        phone: '+1 (289) 216-6500',
        city: 'Mississauga',
        isAdmin: true,
        roleType: 'admin',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        lastLoginAt: null,
        emailVerifiedAt: null,
        createdAt: new Date()
      },
      {
        username: 'publisher1',
        password: '53d9640815da243d62abebb7b4c3277415ec83575c8c6e88042ce96e6a5962c63be874f04380cb9ef782ae6c9fa3c62f4af101887ac7a30a33509ce4d7214c6d.566cb410c1123cce41483aa3cffb74fd', // publisher123
        email: 'publisher@jaberco.com',
        fullName: 'Content Publisher',
        phone: '+1 (289) 216-6501',
        city: 'Toronto',
        isAdmin: false,
        roleType: 'publisher',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        lastLoginAt: null,
        emailVerifiedAt: null,
        createdAt: new Date()
      }
    ];

    defaultUsers.forEach(user => {
      const id = this.getNextId();
      this.data.users.set(id, { id, ...user });
    });

    // Initialize comprehensive allowed cities in Ontario
    const allowedCities = [
      { cityName: 'Toronto', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Mississauga', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Brampton', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Hamilton', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'London', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Markham', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Vaughan', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Kitchener', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Windsor', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Richmond Hill', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Oakville', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Burlington', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Oshawa', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Barrie', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'St. Catharines', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Cambridge', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Waterloo', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Guelph', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Sudbury', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { cityName: 'Thunder Bay', province: 'Ontario', isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ];

    allowedCities.forEach(city => {
      const id = this.getNextId();
      this.data.allowedCities.set(id, { id, ...city });
    });

    // Initialize comprehensive FAQ data with all previous entries
    const sampleFaqs = [
      {
        question: 'What are Amazon return pallets?',
        answer: 'Amazon return pallets are bulk lots of customer-returned merchandise from Amazon. These items are typically in good condition but cannot be sold as new due to return policies. We source directly from Amazon liquidation centers to provide authentic products at wholesale prices.',
        displayOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'What condition are the items in?',
        answer: 'Items range from new/unopened to gently used. We grade our pallets (A, B, C) based on overall condition and provide detailed descriptions for each pallet.',
        displayOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Do you offer delivery?',
        answer: 'Yes, we provide delivery service within 60km of our Mississauga warehouse. Shipping costs are calculated based on distance and order weight.',
        displayOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Can I inspect the pallet before purchase?',
        answer: 'Due to the nature of return pallets, items are sold as-is. However, we provide detailed descriptions and photos of each pallet to help you make informed decisions.',
        displayOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, debit cards, and secure online payments through our Stripe integration for safe and convenient transactions.',
        displayOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    sampleFaqs.forEach(faq => {
      const id = this.getNextId();
      this.data.faqs.set(id, { id, ...faq });
    });

    // Initialize appointments data
    const defaultAppointments = [
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-416-555-0101',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        message: 'I would like to inspect the electronics pallets before purchasing.',
        status: 'pending',
        createdAt: new Date()
      },
      {
        name: 'Lisa Wong',
        email: 'lisa.wong@business.ca',
        phone: '+1-647-555-0202',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:30',
        message: 'Business consultation for bulk purchasing agreement.',
        status: 'confirmed',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        name: 'Robert Johnson',
        email: 'rjohnson@retail.com',
        phone: '+1-905-555-0303',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '11:00',
        message: 'Warehouse visit to discuss regular supply partnership.',
        status: 'confirmed',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ];

    defaultAppointments.forEach(appointment => {
      const id = this.getNextId();
      this.data.appointments.set(id, { id, ...appointment });
    });

    // Initialize contacts data
    const defaultContacts = [
      {
        name: 'Ahmed Mohamed',
        email: 'ahmed.mohamed@gmail.com',
        phone: '+1-416-555-1001',
        message: 'I am interested in purchasing electronics pallets. Can you provide more information about current availability and pricing?',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@retailbusiness.ca',
        phone: '+1-647-555-1002',
        message: 'We are a retail business looking for regular pallet suppliers. What are your bulk pricing options?',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        name: 'Michael Chen',
        email: 'mchen@reseller.com',
        phone: '+1-905-555-1003',
        message: 'Can I schedule a warehouse visit to see the pallets before making a purchase decision?',
        isRead: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        name: 'Jennifer Smith',
        email: 'jen.smith@startup.ca',
        phone: '+1-437-555-1004',
        message: 'New business inquiry: What is the minimum order quantity and do you offer financing options?',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ];

    defaultContacts.forEach(contact => {
      const id = this.getNextId();
      this.data.contacts.set(id, { id, ...contact });
    });

    // Initialize orders data
    const defaultOrders = [
      {
        userId: 17,
        status: 'completed',
        paymentStatus: 'paid',
        paymentIntentId: 'pi_3PE8xbP8X7EYQQyb1QH5gUvB',
        total: 182500,
        subtotal: 180000,
        shippingCost: 2500,
        shippingAddress: '300 ray Lawson',
        shippingCity: 'Brampton',
        shippingProvince: 'Ontario',
        shippingPostalCode: 'L6Y 5H5',
        shippingCountry: 'Canada',
        notes: 'Order completed successfully',
        createdAt: new Date('2025-05-01T10:30:00.000Z'),
        updatedAt: new Date('2025-05-01T15:45:00.000Z')
      },
      {
        userId: 8,
        status: 'processing',
        paymentStatus: 'paid',
        paymentIntentId: 'pi_3PE9xbP8X7EYQQyb2QH6hUvC',
        total: 178500,
        subtotal: 175000,
        shippingCost: 3500,
        shippingAddress: '123 Main St',
        shippingCity: 'Toronto',
        shippingProvince: 'Ontario',
        shippingPostalCode: 'M5V 3A1',
        shippingCountry: 'Canada',
        notes: 'Order in processing',
        createdAt: new Date('2025-05-02T14:20:00.000Z'),
        updatedAt: new Date('2025-05-02T14:20:00.000Z')
      },
      {
        userId: 10,
        status: 'completed',
        paymentStatus: 'paid',
        paymentIntentId: 'pi_3PEAxbP8X7EYQQyb3QH7iUvD',
        total: 228000,
        subtotal: 225000,
        shippingCost: 3000,
        shippingAddress: '456 Oak Ave',
        shippingCity: 'Mississauga',
        shippingProvince: 'Ontario',
        shippingPostalCode: 'L5B 2K1',
        shippingCountry: 'Canada',
        notes: 'Order shipped and delivered',
        createdAt: new Date('2025-05-03T09:15:00.000Z'),
        updatedAt: new Date('2025-05-03T16:30:00.000Z')
      }
    ];

    defaultOrders.forEach(order => {
      const id = this.getNextId();
      this.data.orders.set(id, { id, ...order });
    });

    // Initialize shipping zones and rates
    const shippingZones = [
      {
        name: 'Local Zone (0-20km)',
        description: 'Greater Toronto Area - Local delivery',
        maxDistanceLimit: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Regional Zone (21-40km)',
        description: 'Extended GTA region',
        maxDistanceLimit: 40,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Extended Zone (41-60km)',
        description: 'Maximum delivery radius',
        maxDistanceLimit: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    shippingZones.forEach(zone => {
      const id = this.getNextId();
      this.data.shippingZones.set(id, { id, ...zone });
    });

    // Initialize shipping rates
    const shippingRates = [
      {
        zoneId: 1,
        minDistance: 0,
        maxDistance: 20,
        baseRate: 25.00,
        additionalRatePerKm: 0.50,
        minWeight: 0,
        maxWeight: 100,
        additionalRatePerKg: 0.25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        zoneId: 2,
        minDistance: 21,
        maxDistance: 40,
        baseRate: 45.00,
        additionalRatePerKm: 0.75,
        minWeight: 0,
        maxWeight: 100,
        additionalRatePerKg: 0.35,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        zoneId: 3,
        minDistance: 41,
        maxDistance: 60,
        baseRate: 65.00,
        additionalRatePerKm: 1.00,
        minWeight: 0,
        maxWeight: 100,
        additionalRatePerKg: 0.50,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    shippingRates.forEach(rate => {
      const id = this.getNextId();
      this.data.shippingRates.set(id, { id, ...rate });
    });

    // Initialize warehouse location
    const locations = [
      {
        city: 'Mississauga',
        province: 'Ontario',
        country: 'Canada',
        latitude: '43.5890',
        longitude: '-79.6441',
        postalCode: 'L5B 0C1',
        isWarehouse: true,
        zoneId: 1,
        createdAt: new Date()
      }
    ];

    locations.forEach(location => {
      const id = this.getNextId();
      this.data.locations.set(id, { id, ...location });
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

  async getSetting(key: string): Promise<Setting | undefined> {
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

  async getSettingsByCategory(category: string): Promise<Setting[]> {
    return Array.from(this.data.settings.values()).filter(s => s.category === category);
  }

  async updateSubscriber(id: number, updates: Partial<InsertSubscriber>): Promise<Subscriber | undefined> {
    const existing = this.data.subscribers.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.data.subscribers.set(id, updated);
    return updated;
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

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return this.getUserNotifications(userId);
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