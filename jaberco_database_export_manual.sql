-- تصدير بيانات موقع Jaberco
-- تاريخ التصدير: 2025-06-05

-- =======================
-- جدول المستخدمين (Users)
-- =======================

INSERT INTO users (id, username, password, is_admin, role_type, email, full_name, phone, stripe_customer_id, stripe_subscription_id, address, city, postal_code, country, created_at) VALUES
(8, 'badr', '2b3a91e1713faabe849e86ef6b1aaa41fd0431b8c8a45e6efa3deac6aaf11dbc3631eecddf9944747fe4a8a8de41e4338ea9fcfaefcaeac1ceda82c06d250db9.0e547541fc82969ef16eec33ac2ef0fa', true, 'admin', '', '', '', '', '', '', '', '', '', '2025-05-01 03:12:00.591+00'),
(10, 'hiba', '7b2e1b0728ce9ad32d2dc4a1ea525af695daaf704905ae768d16abc4c3244bd3ae857b79201ee10307a34e49948dfcfa45bdb1523a2ebd0f7485f165e90f1bce.8eaa633c6762534812373fab86dd4406', false, 'publisher', '', '', '', '', '', '', '', '', '', '2025-05-01 03:12:00.591+00'),
(12, 'roula', '41ae844cac17655df26650b94e7144e9eecdf0c7e775742e36d6ac6d6a1e080c73adef09c4e6a3fbb449c4eda4b6fcd90d9cbd70681cdc27c5e3b90b2ce0686d.b650ad34544f5102fb0176b470fc657c', false, 'publisher', '', '', '', '', '', '', '', '', '', '2025-05-01 03:12:00.591+00'),
(15, 'Çfçfşşfflld', 'd19784835ab572162599757c6eb6981038bf0c7d9af3e4d9a2c9fba2f427295e04f46597135b84dc45cadeaf46b3485348d99416b7162d93b59b0ccf226f5cac.7d5c1f1007a0ea0d73f059bd4a0e7d7a', true, 'admin', '', '', '', '', '', '', '', '', '', '2025-05-01 03:12:00.591+00'),
(17, 'testtest', '95eaa7d3b82f934df217efcdff616ba4334f5c39ddd7f7e499a94a3839502334cf5cb339cd796c3fe771d9bf88675a61f4e66fbab10d2b8f774050eae0c25ec2.7e05b21c18b4b1a1ecb3755620454417', false, 'customer', 'test@test.test', 'testtest', '0013653787047', '', '', '300 ray Lawson ', 'Brampton ', 'L6Y 5H5', 'Canada', '2025-05-01 03:40:33.037+00'),
(119, 'jldfvhjdvjcvjkcv', '0d36940761020ccc81133fdd78529abfa208b91e5318f07c546d2e65731dacb9998475d5fe978032f2c9711b81c42c98a5e30eed67bddfe0098d5b3942fc03c3.ade379d83bfcf61e60df2f996f012539', false, 'user', 'admin@jaberco.com', 'Test Administrator', '+1-416-555-0001', '', '', '', '', '', '', '2025-06-05 01:29:45.093832+00');

-- =======================
-- جدول المنتجات (Products)
-- =======================

INSERT INTO products (id, title, title_ar, description, description_ar, category, status, price, image_url, created_at, display_order) VALUES
(5, 'high quality pallet 35-40 items ', 'high quality pallet 35-40 items ', 'Total Est. Retail: $7500 $8000.\nImportant note: You can check the pallet before taking it.\n\nOn average you will earn $4,000.', 'Total Est. Retail: $7500 $8000.\nImportant note: You can check the pallet before taking it.\n\nOn average you will earn $4,000.', 'mixed', 'available', 1800, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348804/unity_ecommerce/products/product_5_1745348803647.jpg', '2025-04-21 19:15:43.53', 2),
(8, 'Brand new close box ', 'Brand new close box ', 'Brand new close box \n\nStem Science Kits Building Kits for kids...\nFlawless cleanse spa wanse Shower wand Electric.. \nStem Science Kits\nBuilding Kits for Kids\n208X44 = 1152\nFlaw/eSS\ncleanse spe\nShower\nWand\nElectric\n42 × 27.80 = 1167\n10319\n%83 Discount\n1750CAD', 'Brand new close box \n\nStem Science Kits Building Kits for kids...\nFlawless cleanse spa wanse Shower wand Electric.. \nStem Science Kits\nBuilding Kits for Kids\n208X44 = 1152\nFlaw/eSS\ncleanse spe\nShower\nWand\nElectric\n42 × 27.80 = 1167\n10319\n%83 Discount\n1750CAD', 'toys', 'available', 1750, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348261/unity_ecommerce/products/product_8_1745348261181.jpg', '2025-04-22 04:39:34.921', 1),
(9, 'High-quality pallets ', 'High-quality pallets ', 'High-quality pallets filled with valuable items worth every penny. Perfect for resellers or personal use, offering great variety and exceptional value.', 'High-quality pallets filled with valuable items worth every penny. Perfect for resellers or personal use, offering great variety and exceptional value.', 'mixed', 'available', 999, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348363/unity_ecommerce/products/product_9_1745348362755.jpg', '2025-04-22 04:48:15.643', 2),
(10, 'High-quality pallets 25-30 items ', 'High-quality pallets 25-30 items ', 'High-quality pallets filled with valuable items worth every penny. Perfect for resellers or personal use, offering great variety and exceptional value.', 'High-quality pallets filled with valuable items worth every penny. Perfect for resellers or personal use, offering great variety and exceptional value.', 'mixed', 'available', 750, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348555/unity_ecommerce/products/product_10_1745348554517.jpg', '2025-04-22 04:51:19.215', 1),
(11, 'High-quality pallets 30-40 items ', 'High-quality pallets 30-40 items ', 'High-quality pallets filled with valuable items worth every penny. Perfect for resellers or personal use, offering great variety and exceptional value.', 'High-quality pallets filled with valuable items worth every penny. Perfect for resellers or personal use, offering great variety and exceptional value.', 'mixed', 'available', 1250, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348688/unity_ecommerce/products/product_11_1745348687565.jpg', '2025-04-22 04:56:11.44', 1),
(12, 'New 750$ pallets 25-30 items ', 'New 750$ pallets 25-30 items ', 'Affordable and good quality pallets, perfect for resell and small business. ', 'Affordable and good quality pallets, perfect for resell and small business. ', 'mixed', 'available', 750, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745351521/unity_ecommerce/products/kaqrduj3zdjz4rbm4jrp.jpg', '2025-04-22 19:52:07.928', 1);

-- =======================
-- جدول صور المنتجات (Product Images)
-- =======================

INSERT INTO product_images (id, product_id, image_url, is_main, display_order, created_at) VALUES
(23, 8, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348261/unity_ecommerce/products/product_8_1745348261181.jpg', true, 0, '2025-04-22 18:57:44.199'),
(24, 8, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348278/unity_ecommerce/products/product_8_1745348277879.jpg', false, 0, '2025-04-22 18:58:00.339'),
(25, 8, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348291/unity_ecommerce/products/product_8_1745348290458.jpg', false, 0, '2025-04-22 18:58:13.037'),
(26, 8, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348298/unity_ecommerce/products/product_8_1745348298014.jpg', false, 0, '2025-04-22 18:58:20.447'),
(27, 9, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348363/unity_ecommerce/products/product_9_1745348362755.jpg', true, 0, '2025-04-22 18:59:25.512'),
(28, 9, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348380/unity_ecommerce/products/product_9_1745348380145.jpg', false, 0, '2025-04-22 18:59:42.999'),
(29, 9, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348450/unity_ecommerce/products/product_9_1745348449795.jpg', false, 0, '2025-04-22 19:00:52.507'),
(30, 9, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348468/unity_ecommerce/products/product_9_1745348467586.jpg', false, 0, '2025-04-22 19:01:10.296'),
(31, 9, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348485/unity_ecommerce/products/product_9_1745348485111.jpg', false, 0, '2025-04-22 19:01:27.377'),
(32, 9, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348508/unity_ecommerce/products/product_9_1745348507578.jpg', false, 0, '2025-04-22 19:01:49.78'),
(33, 10, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348555/unity_ecommerce/products/product_10_1745348554517.jpg', true, 0, '2025-04-22 19:02:37.659'),
(34, 10, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348576/unity_ecommerce/products/product_10_1745348575653.jpg', false, 0, '2025-04-22 19:02:58.101'),
(35, 10, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348588/unity_ecommerce/products/product_10_1745348588179.jpg', false, 0, '2025-04-22 19:03:10.736'),
(36, 11, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348688/unity_ecommerce/products/product_11_1745348687565.jpg', true, 0, '2025-04-22 19:04:49.99'),
(37, 11, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348697/unity_ecommerce/products/product_11_1745348696843.jpg', false, 0, '2025-04-22 19:04:59.293'),
(38, 11, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348705/unity_ecommerce/products/product_11_1745348705264.jpg', false, 0, '2025-04-22 19:05:08.547'),
(39, 11, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348714/unity_ecommerce/products/product_11_1745348713461.jpg', false, 0, '2025-04-22 19:05:16.067'),
(40, 5, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348764/unity_ecommerce/products/product_5_1745348763690.jpg', false, 0, '2025-04-22 19:06:05.302'),
(41, 5, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348789/unity_ecommerce/products/product_5_1745348789294.jpg', false, 0, '2025-04-22 19:06:30.943'),
(42, 5, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348804/unity_ecommerce/products/product_5_1745348803647.jpg', true, 0, '2025-04-22 19:06:45.484'),
(43, 10, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745348840/unity_ecommerce/products/product_10_1745348840094.jpg', false, 0, '2025-04-22 19:07:22.55'),
(44, 12, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745351542/unity_ecommerce/products/product_12_1745351541900.jpg', true, 0, '2025-04-22 19:52:24.178'),
(45, 12, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745351550/unity_ecommerce/products/product_12_1745351549848.jpg', false, 0, '2025-04-22 19:52:31.526'),
(46, 12, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745351619/unity_ecommerce/products/product_12_1745351619254.jpg', false, 0, '2025-04-22 19:53:40.913'),
(47, 12, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745351628/unity_ecommerce/products/product_12_1745351627491.jpg', false, 0, '2025-04-22 19:53:49.146'),
(48, 12, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745351646/unity_ecommerce/products/product_12_1745351645861.jpg', false, 0, '2025-04-22 19:54:07.529'),
(49, 12, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745351655/unity_ecommerce/products/product_12_1745351654822.jpg', false, 0, '2025-04-22 19:54:16.775'),
(50, 12, 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1745351670/unity_ecommerce/products/product_12_1745351669816.jpg', false, 0, '2025-04-22 19:54:31.51');

-- =======================
-- جدول الإعدادات (Settings) - الأساسية فقط
-- =======================

INSERT INTO settings (id, key, value, category, label, type, updated_at, description) VALUES
(1, 'site_logo', 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1746602895/jaberco_ecommerce/products/jaberco_site_logo_1746602894802.jpg', 'appearance', 'Site Logo', 'image', '2025-05-07 07:28:18.874', ''),
(2, 'primary_color', '#EB2B26', 'appearance', 'Primary Color', 'color', '2025-04-21 21:09:30.778', ''),
(3, 'secondary_color', '#000000', 'appearance', 'Secondary Color', 'color', '2025-04-21 22:26:20.599', ''),
(5, 'site_name', 'Jaberco', 'content', 'Site Name', 'text', '2025-04-21 19:16:17.796', ''),
(6, 'site_description', 'Specialized in selling Amazon return pallets', 'content', 'Site Description', 'textarea', '2025-04-21 18:04:28.417', ''),
(7, 'hero_title', 'Best Amazon Return Pallets', 'content', 'Hero Title', 'text', '2025-04-21 18:04:28.439', ''),
(8, 'hero_subtitle', 'Discover a variety of products at special prices', 'content', 'Hero Subtitle', 'text', '2025-04-21 18:04:28.463', ''),
(9, 'contact_email', 'info@jaberco.ca', 'contact', 'Contact Email', 'email', '2025-05-07 09:23:11.311', ''),
(10, 'contact_phone', '+1 (289) 216-6500', 'contact', 'Contact Phone', 'tel', '2025-04-21 22:28:20.845', ''),
(14, 'contact_address', 'Mississauga, Ontario, Canada', 'contact', 'Address', 'text', '2025-04-21 22:57:03.771', 'Company or business address'),
(54, 'home_banner_title', 'Welcome to Jaberco®', 'home_banner', 'Banner Title', 'text', '2025-05-08 22:51:32.352', 'Main title displayed in the homepage banner'),
(55, 'home_banner_subtitle', 'Your opportunity to get authentic products at heavily discounted prices. Various pallets with guaranteed quality.', 'home_banner', 'Banner Subtitle', 'text', '2025-05-07 08:27:35.322', 'Subtitle displayed in the homepage banner'),
(58, 'home_banner_image', 'https://res.cloudinary.com/dsviwqpmy/image/upload/v1746746173/jaberco_ecommerce/products/jaberco_setting_home_banner_image_1746746173263.jpg', 'home_banner', 'Banner Background Image', 'url', '2025-05-08 23:16:21.075', 'Background image for the homepage banner');