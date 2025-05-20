-- Initial migration script for Jaberco database
-- This script will create all the necessary tables if they don't exist

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "email" TEXT,
  "role" TEXT NOT NULL DEFAULT 'user',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "phone" TEXT,
  "first_name" TEXT,
  "last_name" TEXT,
  "address" TEXT,
  "city" TEXT,
  "province" TEXT,
  "postal_code" TEXT,
  "last_login" TIMESTAMP WITH TIME ZONE,
  "profile_image" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "stripe_customer_id" TEXT,
  "stripe_subscription_id" TEXT
);

-- Create products table
CREATE TABLE IF NOT EXISTS "products" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "title_ar" TEXT,
  "description" TEXT,
  "description_ar" TEXT,
  "price" DECIMAL(10, 2) NOT NULL,
  "discount_price" DECIMAL(10, 2),
  "category_id" INTEGER,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "sku" TEXT,
  "stock" INTEGER DEFAULT 0,
  "weight" DECIMAL(10, 2),
  "dimensions" TEXT,
  "is_featured" BOOLEAN DEFAULT FALSE,
  "is_new" BOOLEAN DEFAULT FALSE,
  "is_published" BOOLEAN DEFAULT TRUE,
  "publisher_id" INTEGER,
  "sold_count" INTEGER DEFAULT 0
);

-- Create categories table
CREATE TABLE IF NOT EXISTS "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "name_ar" TEXT,
  "description" TEXT,
  "description_ar" TEXT,
  "parent_id" INTEGER,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "image_url" TEXT,
  "is_published" BOOLEAN DEFAULT TRUE
);

-- Create product_images table
CREATE TABLE IF NOT EXISTS "product_images" (
  "id" SERIAL PRIMARY KEY,
  "product_id" INTEGER NOT NULL,
  "image_url" TEXT NOT NULL,
  "public_id" TEXT,
  "alt_text" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "is_main" BOOLEAN DEFAULT FALSE
);

-- Create settings table
CREATE TABLE IF NOT EXISTS "settings" (
  "id" SERIAL PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "value" TEXT,
  "category" TEXT,
  "label" TEXT,
  "type" TEXT DEFAULT 'text',
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "description" TEXT
);

-- Create faqs table
CREATE TABLE IF NOT EXISTS "faqs" (
  "id" SERIAL PRIMARY KEY,
  "question" TEXT NOT NULL,
  "question_ar" TEXT,
  "answer" TEXT NOT NULL,
  "answer_ar" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "order" INTEGER,
  "is_published" BOOLEAN DEFAULT TRUE
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS "contacts" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "message" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "is_read" BOOLEAN DEFAULT FALSE
);

-- Create other necessary tables

-- Create subscriber table
CREATE TABLE IF NOT EXISTS "subscribers" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "is_active" BOOLEAN DEFAULT TRUE
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS "appointments" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "message" TEXT,
  "status" TEXT DEFAULT 'pending',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create shipping related tables
CREATE TABLE IF NOT EXISTS "shipping_zones" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "shipping_rates" (
  "id" SERIAL PRIMARY KEY,
  "zone_id" INTEGER NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL,
  "min_distance" INTEGER,
  "max_distance" INTEGER,
  "min_weight" DECIMAL(10, 2),
  "max_weight" DECIMAL(10, 2),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "locations" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "latitude" DECIMAL(10, 6),
  "longitude" DECIMAL(10, 6),
  "is_warehouse" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "allowed_cities" (
  "id" SERIAL PRIMARY KEY,
  "city" TEXT NOT NULL,
  "province" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create cart related tables
CREATE TABLE IF NOT EXISTS "carts" (
  "id" SERIAL PRIMARY KEY,
  "customer_id" INTEGER,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "session_id" TEXT
);

CREATE TABLE IF NOT EXISTS "cart_items" (
  "id" SERIAL PRIMARY KEY,
  "cart_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create order related tables
CREATE TABLE IF NOT EXISTS "orders" (
  "id" SERIAL PRIMARY KEY,
  "customer_id" INTEGER,
  "status" TEXT DEFAULT 'pending',
  "total" DECIMAL(10, 2) NOT NULL,
  "shipping_address" TEXT,
  "shipping_city" TEXT,
  "shipping_province" TEXT,
  "shipping_postal_code" TEXT,
  "shipping_phone" TEXT,
  "shipping_email" TEXT,
  "shipping_first_name" TEXT,
  "shipping_last_name" TEXT,
  "shipping_cost" DECIMAL(10, 2) DEFAULT 0,
  "payment_method" TEXT,
  "payment_status" TEXT DEFAULT 'pending',
  "stripe_payment_intent_id" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "order_items" (
  "id" SERIAL PRIMARY KEY,
  "order_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "price" DECIMAL(10, 2) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create customer table
CREATE TABLE IF NOT EXISTS "customers" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "first_name" TEXT,
  "last_name" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "province" TEXT,
  "postal_code" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "stripe_customer_id" TEXT
);

-- Create visitor stats table
CREATE TABLE IF NOT EXISTS "visitor_stats" (
  "id" SERIAL PRIMARY KEY,
  "ip" TEXT,
  "user_agent" TEXT,
  "page" TEXT,
  "referer" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "visitor_id" TEXT,
  "country" TEXT,
  "city" TEXT,
  "device" TEXT,
  "browser" TEXT,
  "os" TEXT
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "is_read" BOOLEAN DEFAULT FALSE,
  "type" TEXT,
  "link" TEXT,
  "reference_id" INTEGER,
  "reference_type" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL;
ALTER TABLE "products" ADD CONSTRAINT "products_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "users" ("id") ON DELETE SET NULL;
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE;
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "shipping_zones" ("id") ON DELETE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts" ("id") ON DELETE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE SET NULL;
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL;
ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

-- Create session table for express-session with connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
  "sid" VARCHAR NOT NULL PRIMARY KEY,
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");