
const { Pool } = require('pg');

// Configure old database connection
const OLD_DATABASE_URL = process.env.OLD_DATABASE_URL || process.env.DATABASE_URL;
const NEW_DATABASE_URL = process.env.DATABASE_URL;

if (!OLD_DATABASE_URL || !NEW_DATABASE_URL) {
  console.error('Please set OLD_DATABASE_URL and DATABASE_URL environment variables');
  process.exit(1);
}

const oldDb = new Pool({ connectionString: OLD_DATABASE_URL });
const newDb = new Pool({ connectionString: NEW_DATABASE_URL });

async function migrateData() {
  try {
    console.log('Starting data migration...');

    // Migrate users
    await migrateUsers();
    
    // Migrate categories
    await migrateCategories();
    
    // Migrate products
    await migrateProducts();
    
    // Migrate settings
    await migrateSettings();
    
    // Migrate contacts
    await migrateContacts();
    
    // Migrate subscribers
    await migrateSubscribers();
    
    // Migrate orders
    await migrateOrders();
    
    // Migrate order items
    await migrateOrderItems();
    
    // Migrate notifications
    await migrateNotifications();
    
    // Migrate FAQs
    await migrateFaqs();
    
    console.log('Data migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await oldDb.end();
    await newDb.end();
  }
}

async function migrateUsers() {
  try {
    console.log('Migrating users...');
    
    const { rows: oldUsers } = await oldDb.query('SELECT * FROM users ORDER BY id');
    
    for (const user of oldUsers) {
      await newDb.query(`
        INSERT INTO users (id, username, password, "isAdmin", "roleType", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          password = EXCLUDED.password,
          "isAdmin" = EXCLUDED."isAdmin",
          "roleType" = EXCLUDED."roleType",
          updated_at = EXCLUDED.updated_at
      `, [
        user.id,
        user.username,
        user.password,
        user.isAdmin || false,
        user.roleType || 'user',
        user.created_at || new Date(),
        user.updated_at || new Date()
      ]);
    }
    
    console.log(`Migrated ${oldUsers.length} users`);
  } catch (error) {
    console.error('Error migrating users:', error);
  }
}

async function migrateCategories() {
  try {
    console.log('Migrating categories...');
    
    const { rows: oldCategories } = await oldDb.query('SELECT * FROM categories ORDER BY id');
    
    for (const category of oldCategories) {
      await newDb.query(`
        INSERT INTO categories (id, name, description, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          updated_at = EXCLUDED.updated_at
      `, [
        category.id,
        category.name,
        category.description,
        category.created_at || new Date(),
        category.updated_at || new Date()
      ]);
    }
    
    console.log(`Migrated ${oldCategories.length} categories`);
  } catch (error) {
    console.error('Error migrating categories:', error);
  }
}

async function migrateProducts() {
  try {
    console.log('Migrating products...');
    
    const { rows: oldProducts } = await oldDb.query('SELECT * FROM products ORDER BY id');
    
    for (const product of oldProducts) {
      await newDb.query(`
        INSERT INTO products (id, name, description, price, images, "categoryId", "isAvailable", "isPopular", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          images = EXCLUDED.images,
          "categoryId" = EXCLUDED."categoryId",
          "isAvailable" = EXCLUDED."isAvailable",
          "isPopular" = EXCLUDED."isPopular",
          updated_at = EXCLUDED.updated_at
      `, [
        product.id,
        product.name,
        product.description,
        product.price,
        product.images,
        product.categoryId,
        product.isAvailable !== false,
        product.isPopular || false,
        product.created_at || new Date(),
        product.updated_at || new Date()
      ]);
    }
    
    console.log(`Migrated ${oldProducts.length} products`);
  } catch (error) {
    console.error('Error migrating products:', error);
  }
}

async function migrateSettings() {
  try {
    console.log('Migrating settings...');
    
    const { rows: oldSettings } = await oldDb.query('SELECT * FROM settings ORDER BY id');
    
    for (const setting of oldSettings) {
      await newDb.query(`
        INSERT INTO settings (id, key, value, category, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          category = EXCLUDED.category,
          updated_at = EXCLUDED.updated_at
      `, [
        setting.id,
        setting.key,
        setting.value,
        setting.category || 'general',
        setting.created_at || new Date(),
        setting.updated_at || new Date()
      ]);
    }
    
    console.log(`Migrated ${oldSettings.length} settings`);
  } catch (error) {
    console.error('Error migrating settings:', error);
  }
}

async function migrateContacts() {
  try {
    console.log('Migrating contacts...');
    
    const { rows: oldContacts } = await oldDb.query('SELECT * FROM contacts ORDER BY id');
    
    for (const contact of oldContacts) {
      await newDb.query(`
        INSERT INTO contacts (id, name, email, phone, message, "isRead", created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          message = EXCLUDED.message,
          "isRead" = EXCLUDED."isRead"
      `, [
        contact.id,
        contact.name,
        contact.email,
        contact.phone,
        contact.message,
        contact.isRead || false,
        contact.created_at || new Date()
      ]);
    }
    
    console.log(`Migrated ${oldContacts.length} contacts`);
  } catch (error) {
    console.error('Error migrating contacts:', error);
  }
}

async function migrateSubscribers() {
  try {
    console.log('Migrating subscribers...');
    
    const { rows: oldSubscribers } = await oldDb.query('SELECT * FROM subscribers ORDER BY id');
    
    for (const subscriber of oldSubscribers) {
      await newDb.query(`
        INSERT INTO subscribers (id, name, email, phone, "isActive", created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          "isActive" = EXCLUDED."isActive"
      `, [
        subscriber.id,
        subscriber.name,
        subscriber.email,
        subscriber.phone,
        subscriber.isActive !== false,
        subscriber.created_at || new Date()
      ]);
    }
    
    console.log(`Migrated ${oldSubscribers.length} subscribers`);
  } catch (error) {
    console.error('Error migrating subscribers:', error);
  }
}

async function migrateOrders() {
  try {
    console.log('Migrating orders...');
    
    const { rows: oldOrders } = await oldDb.query('SELECT * FROM orders ORDER BY id');
    
    for (const order of oldOrders) {
      await newDb.query(`
        INSERT INTO orders (id, "userId", "customerInfo", total, status, "paymentMethod", "paymentId", "stripeSessionId", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          "userId" = EXCLUDED."userId",
          "customerInfo" = EXCLUDED."customerInfo",
          total = EXCLUDED.total,
          status = EXCLUDED.status,
          "paymentMethod" = EXCLUDED."paymentMethod",
          "paymentId" = EXCLUDED."paymentId",
          "stripeSessionId" = EXCLUDED."stripeSessionId",
          updated_at = EXCLUDED.updated_at
      `, [
        order.id,
        order.userId,
        order.customerInfo,
        order.total,
        order.status || 'pending',
        order.paymentMethod,
        order.paymentId,
        order.stripeSessionId,
        order.created_at || new Date(),
        order.updated_at || new Date()
      ]);
    }
    
    console.log(`Migrated ${oldOrders.length} orders`);
  } catch (error) {
    console.error('Error migrating orders:', error);
  }
}

async function migrateOrderItems() {
  try {
    console.log('Migrating order items...');
    
    const { rows: oldOrderItems } = await oldDb.query('SELECT * FROM order_items ORDER BY id');
    
    for (const item of oldOrderItems) {
      await newDb.query(`
        INSERT INTO order_items (id, "orderId", "productId", quantity, price)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          "orderId" = EXCLUDED."orderId",
          "productId" = EXCLUDED."productId",
          quantity = EXCLUDED.quantity,
          price = EXCLUDED.price
      `, [
        item.id,
        item.orderId,
        item.productId,
        item.quantity,
        item.price
      ]);
    }
    
    console.log(`Migrated ${oldOrderItems.length} order items`);
  } catch (error) {
    console.error('Error migrating order items:', error);
  }
}

async function migrateNotifications() {
  try {
    console.log('Migrating notifications...');
    
    const { rows: oldNotifications } = await oldDb.query('SELECT * FROM notifications ORDER BY id');
    
    for (const notification of oldNotifications) {
      await newDb.query(`
        INSERT INTO notifications (id, "userId", type, title, message, "relatedId", "isRead", created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          "userId" = EXCLUDED."userId",
          type = EXCLUDED.type,
          title = EXCLUDED.title,
          message = EXCLUDED.message,
          "relatedId" = EXCLUDED."relatedId",
          "isRead" = EXCLUDED."isRead"
      `, [
        notification.id,
        notification.userId,
        notification.type,
        notification.title,
        notification.message,
        notification.relatedId,
        notification.isRead || false,
        notification.created_at || new Date()
      ]);
    }
    
    console.log(`Migrated ${oldNotifications.length} notifications`);
  } catch (error) {
    console.error('Error migrating notifications:', error);
  }
}

async function migrateFaqs() {
  try {
    console.log('Migrating FAQs...');
    
    const { rows: oldFaqs } = await oldDb.query('SELECT * FROM faqs ORDER BY id');
    
    for (const faq of oldFaqs) {
      await newDb.query(`
        INSERT INTO faqs (id, question, answer, "isActive", "sortOrder", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          question = EXCLUDED.question,
          answer = EXCLUDED.answer,
          "isActive" = EXCLUDED."isActive",
          "sortOrder" = EXCLUDED."sortOrder",
          updated_at = EXCLUDED.updated_at
      `, [
        faq.id,
        faq.question,
        faq.answer,
        faq.isActive !== false,
        faq.sortOrder || 0,
        faq.created_at || new Date(),
        faq.updated_at || new Date()
      ]);
    }
    
    console.log(`Migrated ${oldFaqs.length} FAQs`);
  } catch (error) {
    console.error('Error migrating FAQs:', error);
  }
}

// Run migration
migrateData();
