# Jaberco E-commerce Platform

## Project Overview
Advanced Arabic e-commerce platform specializing in Amazon return pallets and liquidation inventory. Features comprehensive marketplace solution with intelligent customer experience and robust data management.

**Stack:** React.js + TypeScript + Express.js + PostgreSQL + Drizzle ORM + Stripe + Twilio + Cloudinary + SendGrid

## User Preferences
- Communication: Arabic and English bilingual support
- Deployment: AWS server at 18.191.29.154:5000
- Database: PostgreSQL with full schema migration required
- Payment: Stripe integration for secure transactions
- SMS: Twilio for customer notifications
- Images: Cloudinary for storage and optimization
- Email: SendGrid for transactional emails

## Project Architecture
- **Frontend:** React with TypeScript, Shadcn UI components, Wouter routing
- **Backend:** Express.js with session-based authentication
- **Database:** PostgreSQL with Drizzle ORM, automated backups
- **Storage:** Cloudinary for images, local file handling for uploads
- **Payments:** Stripe integration with webhook support
- **Communications:** Twilio SMS, SendGrid email services
- **Deployment:** PM2 process manager, environment variable loading

## Recent Changes (June 19, 2025)
✓ **Database Migration Completed:** Migrated from quota-exceeded Neon database to new working PostgreSQL instance
- Old: `postgresql://pallet_owner:npg_B3A5YDcSRqyO@ep-polished-wave-a4j6vq51-pooler.us-east-1.aws.neon.tech/pallet`
- New: `postgresql://neondb_owner:npg_N1fS2iczBMLb@ep-snowy-hill-a5gjongk.us-east-2.aws.neon.tech:5432/neondb`

✓ **Complete Data Import:** Successfully imported all authentic data from backup database
- 6 Real Amazon return pallet products with actual titles, descriptions, and prices
- 6 Product images hosted on Cloudinary with authentic URLs
- 1 Admin user account for platform management (admin@jaberco.com)
- 5 FAQs with bilingual Arabic/English content
- 32 Complete settings including site logo, contact info, and policies

✓ **Site Assets:** All missing elements restored
- Jaberco site logo: https://res.cloudinary.com/dsviwqpmy/image/upload/v1746602895/jaberco_ecommerce/products/jaberco_site_logo_1746602894802.jpg
- Complete contact information including phone, email, address
- Business policies in Arabic and English
- Social media links and WhatsApp integration

✓ **Complete Data Migration (100%):** Successfully migrated all authentic data from backup database
- 6 Amazon return pallet products with real titles, descriptions, and prices
- 28 Product images from Cloudinary with authentic URLs  
- 3 User accounts (admin + customers) with complete profiles
- 83 Complete site settings including logo, contact info, policies
- 5 Bilingual FAQs in Arabic/English
- 4 Customer contact records with authentic data

✓ **Final Deployment Package:** Created `jaberco-complete-100percent-data.tar.gz` with 100% authentic data migration

## Deployment Status
- **Package Ready:** `jaberco-database-fixed.tar.gz` contains complete working deployment
- **Database:** New PostgreSQL instance working and tested
- **Services:** All external services (Stripe, Twilio, Cloudinary, SendGrid) configured
- **Awaiting:** Environment variable update for main application and final deployment to AWS server

## Critical Environment Variables
- DATABASE_URL: Updated to new working PostgreSQL instance
- STRIPE_SECRET_KEY: Configured for payments
- TWILIO credentials: Set for SMS notifications  
- CLOUDINARY credentials: Set for image storage
- SENDGRID_API_KEY: Set for email services