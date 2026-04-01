-- =====================================================
-- CLASSIFIED MARKETPLACE DATABASE SCHEMA & SEED DATA
-- MySQL Database for Nigerian Classified Ads Platform
-- =====================================================

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS ads;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- =====================================================
-- CREATE TABLE STATEMENTS
-- =====================================================

-- Users (Sellers) Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories Table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'folder',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ads Table
CREATE TABLE ads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price INT NOT NULL,
    `condition` ENUM('New', 'Used', 'Refurbished') NOT NULL,
    image_url VARCHAR(500),
    location VARCHAR(100) NOT NULL,
    time_posted VARCHAR(50) NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_category_id (category_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_featured (is_featured),
    INDEX idx_condition (`condition`),
    INDEX idx_location (location),
    FULLTEXT INDEX idx_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SEED DATA: USERS (Nigerian Sellers)
-- =====================================================

INSERT INTO users (name, phone, location, created_at) VALUES
('Chukwuemeka Okonkwo', '+234-803-456-7890', 'Lagos', '2024-01-15 08:30:00'),
('Adaeze Nnamdi', '+234-905-234-5678', 'Abuja', '2024-02-20 14:22:00'),
('Oluwaseun Adeyemi', '+234-816-789-0123', 'Ibadan', '2024-03-10 09:15:00'),
('Emeka Chibueze', '+234-812-345-6789', 'Port Harcourt', '2024-01-28 16:45:00'),
('Folake Olatunji', '+234-814-567-8901', 'Lagos', '2024-04-05 11:00:00'),
('Ibrahim Musa', '+234-806-123-4567', 'Kano', '2024-02-14 13:30:00'),
('Blessing Eze', '+234-803-987-6543', 'Abuja', '2024-03-25 10:20:00'),
('Tunde Bakare', '+234-815-432-1098', 'Lagos', '2024-01-08 15:40:00'),
('Ngozi Onyekwere', '+234-809-876-5432', 'Enugu', '2024-04-12 08:00:00'),
('Samuel Uche', '+234-811-234-5678', 'Lagos', '2024-02-28 12:10:00'),
('Amaka Obi', '+234-817-654-3210', 'Abuja', '2024-03-18 17:25:00'),
('Kunle Adebayo', '+234-802-111-2233', 'Ibadan', '2024-01-30 09:50:00'),
('Chidinma Ekezie', '+234-813-444-5566', 'Port Harcourt', '2024-04-08 14:35:00'),
('Olufemi Taiwo', '+234-804-777-8899', 'Lagos', '2024-02-05 11:45:00'),
('Hauwa Garba', '+234-818-000-1122', 'Kano', '2024-03-22 16:00:00');

-- =====================================================
-- SEED DATA: CATEGORIES
-- =====================================================

INSERT INTO categories (name, slug, icon) VALUES
('Phones & Tablets', 'phones-tablets', 'smartphone'),
('Vehicles', 'vehicles', 'car'),
('Electronics', 'electronics', 'laptop'),
('Fashion', 'fashion', 'shirt'),
('Home & Furniture', 'home-furniture', 'home'),
('Real Estate', 'real-estate', 'building'),
('Health & Beauty', 'health-beauty', 'heart'),
('Sports & Outdoors', 'sports-outdoors', 'dumbbell');

-- =====================================================
-- SEED DATA: ADS (100+ Listings)
-- =====================================================

-- PHONES & TABLETS (25 ads)
INSERT INTO ads (title, description, price, `condition`, image_url, location, time_posted, is_featured, views, user_id, category_id, created_at) VALUES
('iPhone 15 Pro Max 256GB - Titanium Blue', 'Very clean iPhone 15 Pro Max, 256GB storage. Battery health at 98%. Comes with original charger and box. No scratches, no dents. Serious buyers only.', 1850000, 'Used', 'https://example.com/iphone15.jpg', 'Lagos', '2 hours ago', TRUE, 234, 1, 1, '2024-04-15 10:30:00'),
('Samsung Galaxy S24 Ultra 512GB', 'Brand new Samsung S24 Ultra, factory sealed. 512GB storage, 12GB RAM. Original accessories complete. UK import, not cloned.', 2100000, 'New', 'https://example.com/s24ultra.jpg', 'Abuja', 'Just now', TRUE, 156, 2, 1, '2024-04-16 08:45:00'),
('Tecno Spark 20 Pro - New', 'Brand new Tecno Spark 20 Pro with free earphones. 256GB ROM, 8GB RAM. Growing memory feature. Original accessories.', 285000, 'New', 'https://example.com/spark20.jpg', 'Ibadan', 'Yesterday', FALSE, 89, 3, 1, '2024-04-14 14:20:00'),
('Infinix Note 40 Pro 5G', 'Infinix Note 40 Pro, 5G enabled. 256GB storage. 108MP camera. Working perfectly, just buy and use. With original case.', 320000, 'Used', 'https://example.com/note40.jpg', 'Lagos', '3 days ago', FALSE, 67, 4, 1, '2024-04-12 09:15:00'),
('iPhone 13 128GB - Working Perfectly', 'iPhone 13 128GB, American version. Battery 85%. Minor scratch at the back, screen perfect. Face ID working. Comes with charger only.', 680000, 'Used', 'https://example.com/iphone13.jpg', 'Port Harcourt', '5 hours ago', FALSE, 112, 5, 1, '2024-04-15 15:30:00'),
('Samsung Galaxy A54 5G', 'Samsung A54 5G, 128GB. UK used, very clean. 5000mAh battery lasting full day. Slightly negotiable for quick sale.', 380000, 'Used', 'https://example.com/a54.jpg', 'Abuja', '1 week ago', FALSE, 45, 6, 1, '2024-04-08 11:00:00'),
('Xiaomi Redmi Note 13 Pro', 'Xiaomi Redmi Note 13 Pro 5G. 256GB, 8GB RAM. 200MP camera. Refurbished but working perfectly. No issues.', 295000, 'Refurbished', 'https://example.com/redmi13.jpg', 'Ibadan', '4 days ago', FALSE, 78, 7, 1, '2024-04-11 16:40:00'),
('OPPO Reno 11 F 5G', 'Brand new OPPO Reno 11 F, factory sealed. 256GB. 64MP camera. With free wireless earbuds. Original price was 750k.', 580000, 'New', 'https://example.com/reno11.jpg', 'Lagos', 'Just now', TRUE, 201, 8, 1, '2024-04-16 09:00:00'),
('Nokia G42 5G', 'Nokia G42 5G, 128GB. Clean UK used. Android 13. Very durable phone, drop tested. Battery lasts all day.', 195000, 'Used', 'https://example.com/nokia.jpg', 'Enugu', '2 days ago', FALSE, 34, 9, 1, '2024-04-13 10:20:00'),
('Vivo V30 5G - New', 'Brand new Vivo V30 5G. 256GB, 12GB RAM. 50MP eye autofocus camera. Aura light feature. With 2 years warranty.', 620000, 'New', 'https://example.com/vivo.jpg', 'Abuja', 'Yesterday', FALSE, 88, 10, 1, '2024-04-14 13:15:00'),
('iPhone 12 Mini 64GB', 'Compact iPhone 12 Mini, 64GB. Pink color. Battery 82%. Small crack at corner, screen okay. Price is negotiable.', 420000, 'Used', 'https://example.com/12mini.jpg', 'Lagos', '6 days ago', FALSE, 56, 11, 1, '2024-04-09 08:30:00'),
('Samsung Galaxy Z Flip 4', 'Samsung Z Flip 4, 256GB. Bespoke edition. Very clean, no issues. Original box and accessories. Foldable display working perfectly.', 890000, 'Used', 'https://example.com/zflip.jpg', 'Port Harcourt', '1 week ago', TRUE, 178, 12, 1, '2024-04-08 14:00:00'),
('Infinix Hot 40i', 'Brand new Infinix Hot 40i. 128GB. 50MP camera. Free case and earphones. Fast charging enabled.', 175000, 'New', 'https://example.com/hot40.jpg', 'Kano', '3 days ago', FALSE, 92, 13, 1, '2024-04-12 11:45:00'),
('Google Pixel 7a', 'Google Pixel 7a, 128GB. US version. Very clean. Amazing camera quality. Pure Android experience. Battery health 94%.', 520000, 'Used', 'https://example.com/pixel7a.jpg', 'Abuja', 'Yesterday', FALSE, 67, 14, 1, '2024-04-14 17:30:00'),
('Itel A70 - Budget Phone', 'Brand new Itel A70. 128GB. Big battery. WhatsApp and social media working perfectly. Good for elderly or kids.', 85000, 'New', 'https://example.com/itel.jpg', 'Ibadan', 'Just now', FALSE, 145, 15, 1, '2024-04-16 08:00:00'),
('iPhone 14 Pro 128GB - Deep Purple', 'iPhone 14 Pro, 128GB. Deep Purple color. Battery 91%. Very clean, no dents. Comes with original box and accessories.', 1350000, 'Used', 'https://example.com/14pro.jpg', 'Lagos', '4 hours ago', TRUE, 289, 1, 1, '2024-04-15 16:00:00'),
('Tecno Camon 20 Premier', 'Tecno Camon 20 Premier 5G. 512GB. 50MP RGBW sensor. Refurbished but in excellent condition. With original charger.', 385000, 'Refurbished', 'https://example.com/camon.jpg', 'Port Harcourt', '1 week ago', FALSE, 43, 2, 1, '2024-04-08 09:30:00'),
('Samsung Galaxy S23 FE', 'Samsung S23 FE, 128GB. Mint condition. 6 months old. 4500mAh battery. Smooth gaming experience. Box available.', 650000, 'Used', 'https://example.com/s23fe.jpg', 'Abuja', '2 days ago', FALSE, 76, 3, 1, '2024-04-13 15:20:00'),
('OPPO A78 4G', 'OPPO A78, 128GB. Brand new, sealed. 50MP camera. 5000mAh battery with 33W SUPERVOOC. Good value for money.', 245000, 'New', 'https://example.com/a78.jpg', 'Ibadan', 'Yesterday', FALSE, 98, 4, 1, '2024-04-14 10:00:00'),
('Xiaomi Poco X6 Pro', 'Xiaomi Poco X6 Pro 5G. 256GB, 12GB RAM. Dimensity 8300-Ultra chip. Gaming phone, plays PUBG at max settings.', 485000, 'Used', 'https://example.com/poco.jpg', 'Lagos', '3 days ago', FALSE, 134, 5, 1, '2024-04-12 13:45:00'),
('Infinix Zero 30 5G', 'Infinix Zero 30 5G, 256GB. 12GB RAM. 108MP front camera for selfies. Curved AMOLED display. Very clean.', 420000, 'Used', 'https://example.com/zero30.jpg', 'Enugu', '5 days ago', FALSE, 67, 6, 1, '2024-04-10 11:20:00'),
('Vivo Y27s', 'Vivo Y27s, 128GB. Brand new, sealed pack. 50MP camera. 5000mAh battery. Side fingerprint scanner. Original accessories.', 225000, 'New', 'https://example.com/y27s.jpg', 'Kano', 'Yesterday', FALSE, 112, 7, 1, '2024-04-14 16:30:00'),
('iPhone SE 2022 - Budget iOS', 'iPhone SE 2022, 64GB. A15 Bionic chip. Working perfectly. Battery 88%. Small dent at bottom,不影响使用. Good entry iPhone.', 380000, 'Used', 'https://example.com/se2022.jpg', 'Abuja', '1 week ago', FALSE, 89, 8, 1, '2024-04-08 12:15:00'),
('Samsung Galaxy A34 5G', 'Samsung A34 5G, 128GB. Awesome mint condition. 6.6 inch Super AMOLED. 5000mAh battery. With fast charger. No scratch.', 345000, 'Used', 'https://example.com/a34.jpg', 'Port Harcourt', '4 days ago', FALSE, 78, 9, 1, '2024-04-11 14:30:00'),
('Nokia C31', 'Brand new Nokia C31. 64GB. Very affordable. Clean Android experience. Long lasting battery. Good for basic users.', 95000, 'New', 'https://example.com/c31.jpg', 'Ibadan', 'Just now', FALSE, 167, 10, 1, '2024-04-16 07:45:00');

-- VEHICLES (20 ads)
INSERT INTO ads (title, description, price, `condition`, image_url, location, time_posted, is_featured, views, user_id, category_id, created_at) VALUES
('Toyota Camry 2023 XLE - Tokunbo', 'Toyota Camry 2023 XLE trim. Nigerian used, first body. Engine and gear perfectly working. Full option with sunroof. AC blowing cold. Serious buyers only.', 28500000, 'Used', 'https://example.com/camry.jpg', 'Lagos', '3 days ago', TRUE, 456, 1, 2, '2024-04-12 09:30:00'),
('Honda Accord 2022 Sport', 'Honda Accord 2022 Sport trim. Tokunbo, very clean. 1.5L turbo engine. Adaptive cruise control. Leather seats. AC super cold. No accident history.', 24000000, 'Used', 'https://example.com/accord.jpg', 'Abuja', 'Yesterday', TRUE, 389, 2, 2, '2024-04-14 11:20:00'),
('Mercedes-Benz C300 2023', 'Mercedes C300 2023 AMG line. Brand new, unregistered. White with black interior. Full option. 2 years warranty from Mercedes Nigeria.', 45000000, 'New', 'https://example.com/c300.jpg', 'Lagos', 'Just now', TRUE, 567, 3, 2, '2024-04-16 08:30:00'),
('Toyota Corolla 2020 LE', 'Toyota Corolla 2020 LE. Nigerian used, second owner. 1.8L engine. Very clean. Just buy and use. Minor scratches on bumper. Mechanically perfect.', 14500000, 'Used', 'https://example.com/corolla.jpg', 'Ibadan', '1 week ago', FALSE, 234, 4, 2, '2024-04-08 14:45:00'),
('Lexus RX 350 2021 - Full Option', 'Lexus RX 350 2021. Tokunbo, very clean. 3.5L V6 engine. Panoramic roof. Mark Levinson sound system. Adaptive suspension. Buy and drive.', 38000000, 'Used', 'https://example.com/rx350.jpg', 'Port Harcourt', '5 days ago', TRUE, 445, 5, 2, '2024-04-10 10:00:00'),
('Honda Civic 2022 Touring', 'Honda Civic 2022 Touring. Nigerian used. 1.5L turbo. Honda Sensing suite. Wireless CarPlay. BOSE audio. Very clean interior. AC perfect.', 19500000, 'Used', 'https://example.com/civic.jpg', 'Abuja', '2 days ago', FALSE, 312, 6, 2, '2024-04-13 15:30:00'),
('Toyota RAV4 2023 Hybrid', 'Toyota RAV4 Hybrid 2023. White color. Nigerian used, first body. AWD system. 40MPG fuel economy. Very clean. With original invoice.', 32000000, 'Used', 'https://example.com/rav4.jpg', 'Lagos', 'Yesterday', FALSE, 278, 7, 2, '2024-04-14 09:15:00'),
('Mercedes GLE 450 2020', 'Mercedes GLE 450 2020 AMG. Tokunbo. 3.0L turbo. 4MATIC AWD. Air suspension. Panoramic roof. Burmester sound. Very clean. Slightly negotiable.', 42000000, 'Used', 'https://example.com/gle.jpg', 'Abuja', '1 week ago', TRUE, 534, 8, 2, '2024-04-08 16:20:00'),
('Hyundai Tucson 2022', 'Hyundai Tucson 2022. Nigerian used. 2.5L engine. AWD. SmartSense safety features. 10.25 inch display. Very clean. AC chilling.', 18500000, 'Used', 'https://example.com/tucson.jpg', 'Ibadan', '4 days ago', FALSE, 189, 9, 2, '2024-04-11 11:45:00'),
('BMW X5 2021 xDrive40i', 'BMW X5 2021 xDrive40i. Tokunbo. 3.0L turbo. M Sport package. Gesture control. Premium sound. Very clean, no issues. All papers intact.', 48000000, 'Used', 'https://example.com/x5.jpg', 'Lagos', '3 days ago', TRUE, 623, 10, 2, '2024-04-12 14:00:00'),
('Nissan Altima 2022 SV', 'Nissan Altima 2022 SV. Nigerian used. 2.5L engine. ProPILOT assist. Apple CarPlay. Cloth seats. Very economical. AC working perfectly.', 13500000, 'Used', 'https://example.com/altima.jpg', 'Port Harcourt', '1 week ago', FALSE, 167, 11, 2, '2024-04-08 10:30:00'),
('Kia Sorento 2023 SX', 'Brand new Kia Sorento 2023 SX. 7 seater. AWD. 3.5L V6. Full option. Panoramic sunroof. Forward collision warning. 2 years warranty.', 35000000, 'New', 'https://example.com/sorento.jpg', 'Abuja', 'Yesterday', FALSE, 345, 12, 2, '2024-04-14 13:00:00'),
('Toyota Land Cruiser 2022', 'Toyota Land Cruiser 2022 V8. Tokunbo. Full option. Multi-terrain monitor. Crawl control. Fridge in console. Very clean. Go anywhere vehicle.', 75000000, 'Used', 'https://example.com/landcruiser.jpg', 'Lagos', '2 days ago', TRUE, 678, 13, 2, '2024-04-13 08:45:00'),
('Volkswagen Jetta 2021 GLI', 'Volkswagen Jetta GLI 2021. 2.0L turbo. 6 speed manual. Sport suspension. Touchscreen infotainment. Very clean. German engineering.', 16500000, 'Used', 'https://example.com/jetta.jpg', 'Ibadan', '5 days ago', FALSE, 145, 14, 2, '2024-04-10 15:20:00'),
('Ford Explorer 2022 ST', 'Ford Explorer ST 2022. Nigerian used. 3.0L V6 twin-turbo. 400HP. Sport-tuned exhaust. Third row seating. Very powerful. AC perfect.', 28000000, 'Used', 'https://example.com/explorer.jpg', 'Enugu', '1 week ago', FALSE, 234, 15, 2, '2024-04-08 12:00:00'),
('Porsche Cayenne 2020', 'Porsche Cayenne 2020. Tokunbo. 3.0L turbo. Sport Chrono package. 21 inch wheels. Bose surround. Very clean. For real enthusiasts.', 55000000, 'Used', 'https://example.com/cayenne.jpg', 'Abuja', '3 days ago', TRUE, 712, 1, 2, '2024-04-12 11:30:00'),
('Chevrolet Malibu 2022', 'Chevrolet Malibu 2022 LT. Nigerian used. 1.5L turbo. Apple CarPlay. Heated seats. MyLink system. Very clean. Good fuel economy.', 12500000, 'Used', 'https://example.com/malibu.jpg', 'Port Harcourt', '4 days ago', FALSE, 123, 2, 2, '2024-04-11 09:45:00'),
('Jeep Grand Cherokee 2021', 'Jeep Grand Cherokee 2021 Overland. Tokunbo. 3.6L V6. Quadra-Lift air suspension. Panoramic roof. Leather interior. Very clean. Slightly negotiable.', 32000000, 'Used', 'https://example.com/grandcherokee.jpg', 'Lagos', 'Yesterday', FALSE, 289, 3, 2, '2024-04-14 16:45:00'),
('Audi Q5 2022 Premium Plus', 'Audi Q5 2022 Premium Plus. 2.0L turbo. Quattro AWD. Virtual cockpit. Bang & Olufsen sound. Matrix LED headlights. Very clean. No accident.', 36000000, 'Used', 'https://example.com/q5.jpg', 'Abuja', '2 days ago', TRUE, 456, 4, 2, '2024-04-13 14:30:00'),
('Mazda CX-5 2023 GT', 'Brand new Mazda CX-5 2023 GT. Soul Red Crystal. 2.5L engine. AWD. Bose audio. Heated/cooled seats. Premium package. 5 years warranty.', 27000000, 'New', 'https://example.com/cx5.jpg', 'Ibadan', 'Just now', FALSE, 234, 5, 2, '2024-04-16 07:30:00');

-- ELECTRONICS (20 ads)
INSERT INTO ads (title, description, price, `condition`, image_url, location, time_posted, is_featured, views, user_id, category_id, created_at) VALUES
('MacBook Pro M3 14-inch 512GB', 'Apple MacBook Pro with M3 chip, 14-inch. 512GB SSD, 18GB RAM. Space Black color. Factory sealed. With AppleCare+.', 2850000, 'New', 'https://example.com/mbp-m3.jpg', 'Lagos', '2 days ago', TRUE, 345, 6, 3, '2024-04-13 10:30:00'),
('Dell XPS 15 9530 - Core i9', 'Dell XPS 15 9530. 13th Gen Intel Core i9. 32GB RAM, 1TB SSD. OLED 3.5K display. Touchscreen. Refurbished but like new. Perfect for video editing.', 1650000, 'Refurbished', 'https://example.com/xps15.jpg', 'Abuja', '1 week ago', FALSE, 189, 7, 3, '2024-04-08 14:15:00'),
('Samsung 65 inch OLED 4K Smart TV', 'Samsung 65 inch OLED Smart TV. 4K resolution. Neural Quantum Processor. Dolby Atmos. Gaming Hub. Brand new, sealed box. Wall mount included.', 1850000, 'New', 'https://example.com/samsung-tv.jpg', 'Ibadan', 'Yesterday', TRUE, 278, 8, 3, '2024-04-14 09:45:00'),
('Sony PlayStation 5 Disc Edition', 'PlayStation 5 Disc Edition. Complete in box with 2 controllers. Latest system update. Extra DualSense controller included. Games not included.', 680000, 'Used', 'https://example.com/ps5.jpg', 'Lagos', '4 days ago', FALSE, 456, 9, 3, '2024-04-11 16:30:00'),
('LG 55 inch NanoCell 4K TV', 'LG 55 inch NanoCell 4K Smart TV. α7 AI Processor. webOS 23. Dolby Vision IQ. Very clean. Remote and base included. Perfect picture quality.', 580000, 'Used', 'https://example.com/lg-tv.jpg', 'Port Harcourt', '5 days ago', FALSE, 167, 10, 3, '2024-04-10 11:20:00'),
('HP Omen 16 Gaming Laptop', 'HP Omen 16 gaming laptop. Intel Core i7-13700HX. RTX 4070 8GB. 16GB DDR5 RAM. 512GB SSD. 165Hz display. Great for gaming. With cooling pad.', 1450000, 'Used', 'https://example.com/omen16.jpg', 'Abuja', '3 days ago', FALSE, 234, 11, 3, '2024-04-12 15:00:00'),
('Apple iMac 24-inch M3', 'Apple iMac 24-inch with M3 chip. 256GB SSD, 8GB RAM. 4.5K Retina display. Green color. Magic Keyboard and Mouse included. Brand new.', 2100000, 'New', 'https://example.com/imac-m3.jpg', 'Lagos', 'Yesterday', TRUE, 312, 12, 3, '2024-04-14 13:30:00'),
('Bose QuietComfort Ultra Headphones', 'Bose QuietComfort Ultra Headphones. Best noise cancellation. Spatial audio. 24 hour battery. White color. Used twice, like new. With case.', 285000, 'Used', 'https://example.com/bose-qc.jpg', 'Ibadan', '1 week ago', FALSE, 156, 13, 3, '2024-04-08 10:00:00'),
('Samsung Galaxy Tab S9 Ultra', 'Samsung Galaxy Tab S9 Ultra. 256GB, 12GB RAM. 14.6 inch AMOLED. S Pen included. WiFi version. Snapdragon 8 Gen 2. Very clean. With book cover case.', 980000, 'Used', 'https://example.com/tab-s9.jpg', 'Abuja', '2 days ago', FALSE, 198, 14, 3, '2024-04-13 11:45:00'),
('Nintendo Switch OLED + Games', 'Nintendo Switch OLED Model. White color. 64GB internal. 3 games included (Zelda, Mario Kart, Pokemon). Pro controller. All in original box.', 420000, 'Used', 'https://example.com/switch.jpg', 'Port Harcourt', '4 days ago', FALSE, 287, 15, 3, '2024-04-11 08:20:00'),
('ASUS ROG Strix G16 Gaming Laptop', 'ASUS ROG Strix G16. Intel Core i9-14900HX. RTX 4080 12GB. 32GB DDR5 RAM. 1TB SSD. 240Hz display. RGB keyboard. Pure gaming beast.', 2850000, 'New', 'https://example.com/rog-g16.jpg', 'Lagos', 'Just now', TRUE, 423, 1, 3, '2024-04-16 08:00:00'),
('LG Gram 17 Laptop - Ultra Light', 'LG Gram 17. Intel Core i7-1360P. 16GB RAM, 1TB SSD. 17 inch WQXGA display. Only 1.35kg! Very light and portable. Battery lasts 20 hours. Like new.', 1350000, 'Used', 'https://example.com/lg-gram.jpg', 'Abuja', '1 week ago', FALSE, 145, 2, 3, '2024-04-08 15:30:00'),
('Samsung 75 inch QLED 8K TV', 'Samsung 75 inch QLED 8K Smart TV. Quantum Matrix Technology Pro. Neural Quantum 8K Processor. Object Tracking Sound. Refurbished but perfect. With wall mount.', 3200000, 'Refurbished', 'https://example.com/qled-8k.jpg', 'Ibadan', '3 days ago', TRUE, 234, 3, 3, '2024-04-12 12:45:00'),
('Microsoft Xbox Series X', 'Xbox Series X. 1TB SSD. Complete in box. 2 controllers included. Game Pass Ultimate 3 months. All cables. Ready for next gen gaming.', 580000, 'Used', 'https://example.com/xbox-sx.jpg', 'Lagos', '5 days ago', FALSE, 345, 4, 3, '2024-04-10 09:15:00'),
('Canon EOS R6 Mark II Camera', 'Canon EOS R6 Mark II. 24.2MP full-frame. 4K 60fps video. In-body stabilization. With RF 24-105mm f/4L lens. Very clean. Shutter count only 3000.', 2850000, 'Used', 'https://example.com/eos-r6.jpg', 'Abuja', 'Yesterday', TRUE, 289, 5, 3, '2024-04-14 14:00:00'),
('JBL PartyBox 310 - Party Speaker', 'JBL PartyBox 310. Portable party speaker. 240W power. Built-in light show. Guitar and mic inputs. 18 hour battery. Very loud and clear.', 380000, 'Used', 'https://example.com/partybox.jpg', 'Port Harcourt', '1 week ago', FALSE, 178, 6, 3, '2024-04-08 11:30:00'),
('Apple iPad Pro 12.9 M2', 'Apple iPad Pro 12.9 inch with M2 chip. 256GB. WiFi+Cellular. Liquid Retina XDR display. Face ID. With Apple Pencil 2. Magic Keyboard. Like new.', 1450000, 'Used', 'https://example.com/ipad-pro.jpg', 'Lagos', '2 days ago', FALSE, 267, 7, 3, '2024-04-13 16:20:00'),
('Sony WH-1000XM5 Headphones', 'Sony WH-1000XM5. Industry leading noise cancellation. 30 hour battery. Multipoint connection. Crystal clear calls. Black color. Used for 2 months, like new.', 245000, 'Used', 'https://example.com/sony-xm5.jpg', 'Ibadan', '4 days ago', FALSE, 198, 8, 3, '2024-04-11 10:45:00'),
('Microsoft Surface Laptop Studio', 'Microsoft Surface Laptop Studio. Intel Core i7-11370H. 32GB RAM, 1TB SSD. RTX 3050 Ti. 14.4 inch PixelSense display. With Surface Slim Pen 2. Very clean.', 1950000, 'Used', 'https://example.com/surface-studio.jpg', 'Abuja', '3 days ago', FALSE, 156, 9, 3, '2024-04-12 08:30:00'),
('LG C3 55 inch OLED TV', 'LG C3 55 inch OLED evo TV. 4K resolution. α9 AI Processor Gen 6. Dolby Vision IQ. G-Sync compatible. Perfect for gaming. Brand new, opened box only.', 1250000, 'New', 'https://example.com/lg-c3.jpg', 'Lagos', 'Yesterday', TRUE, 398, 10, 3, '2024-04-14 11:00:00');

-- FASHION (15 ads)
INSERT INTO ads (title, description, price, `condition`, image_url, location, time_posted, is_featured, views, user_id, category_id, created_at) VALUES
('Ankara Fabric - 6 Yards Premium', 'Premium quality Ankara fabric. 100% cotton. Vibrant colors that dont fade. 6 yards per piece. WhatsApp for bulk orders. Delivery available nationwide.', 18000, 'New', 'https://example.com/ankara.jpg', 'Lagos', 'Just now', FALSE, 234, 11, 4, '2024-04-16 07:00:00'),
('Leather Briefcase - Corporate Style', 'Genuine leather briefcase. Professional design. Fits 15.6 inch laptop. Multiple compartments. Brass hardware. Very durable. Used once for interview.', 45000, 'Used', 'https://example.com/briefcase.jpg', 'Abuja', '1 week ago', FALSE, 89, 12, 4, '2024-04-08 13:20:00'),
('Adidas Ultraboost 23 - Size 42', 'Adidas Ultraboost 23 running shoes. Size 42. Clean, worn twice. Original receipt available. Boost technology for comfort. Perfect for jogging.', 85000, 'Used', 'https://example.com/ultraboost.jpg', 'Ibadan', '4 days ago', FALSE, 156, 13, 4, '2024-04-11 15:30:00'),
('Louis Vuitton Neverfull MM', 'Louis Vuitton Neverfull MM. Damier Ebene canvas. Internal matching lining. Joan of arc charm. Very clean. Some vintage patina. With dust bag.', 1850000, 'Used', 'https://example.com/neverfull.jpg', 'Lagos', 'Yesterday', TRUE, 456, 14, 4, '2024-04-14 10:30:00'),
('Woolrich Parka - Winter Jacket', 'Woolrich Arctic Parka. Genuine down filled. Water resistant. Size M. Navy blue. Very warm. Perfect for harmattan. Used one season.', 125000, 'Used', 'https://example.com/parka.jpg', 'Abuja', '2 weeks ago', FALSE, 67, 15, 4, '2024-04-01 09:15:00'),
('Gold Plated Jewelry Set', 'Luxury gold plated jewelry set. Necklace, earrings, and bracelet. Sparkling zirconia stones. Anti-tarnish coating. Comes in gift box. Brand new.', 35000, 'New', 'https://example.com/gold-jewelry.jpg', 'Port Harcourt', '3 days ago', FALSE, 289, 1, 4, '2024-04-12 14:45:00'),
('Nike Air Max 97 - Size 44', 'Nike Air Max 97. Size 44. Silver bullet colorway. Original. Worn twice. Very clean. Comfortable for all day wear. Original box available.', 95000, 'Used', 'https://example.com/airmax97.jpg', 'Lagos', '5 days ago', FALSE, 178, 2, 4, '2024-04-10 11:00:00'),
('Lacoste Polo Shirts - Pack of 3', 'Lacoste polo shirts. Size L. 3 different colors (Navy, White, Black). 100% cotton. Classic fit. Used but very clean. No pilling.', 45000, 'Used', 'https://example.com/lacoste.jpg', 'Ibadan', '1 week ago', FALSE, 123, 3, 4, '2024-04-08 16:30:00'),
('Michael Kors Jet Set Tote', 'Michael Kors Jet Set Travel Tote. Saffiano leather. Vanilla color. Lots of compartments. Zipped top. Very clean. With authenticity card.', 185000, 'Used', 'https://example.com/mk-tote.jpg', 'Abuja', 'Yesterday', FALSE, 234, 4, 4, '2024-04-14 12:15:00'),
('Men Oxford Shoes - Leather', 'Classic leather Oxford shoes. Genuine leather upper and sole. Size 42. Black color. Very polished look. Ideal for office. Worn once.', 35000, 'Used', 'https://example.com/oxford.jpg', 'Port Harcourt', '2 weeks ago', FALSE, 89, 5, 4, '2024-04-01 10:45:00'),
('Chanel Chance Eau Tendre - 100ml', 'Chanel Chance Eau Tendre Eau de Parfum. 100ml. Spray version. 90% remaining. Sweet floral fragrance. Lasts all day. With original box.', 85000, 'Used', 'https://example.com/chanel.jpg', 'Lagos', '4 days ago', FALSE, 312, 6, 4, '2024-04-11 08:00:00'),
('Dior Saddle Bag - Canvas', 'Dior Saddle Bag. Oblique canvas with leather trim. Gold hardware. Very clean. No scratches. Interior clean. With dust bag and authenticity card.', 2500000, 'Used', 'https://example.com/saddle.jpg', 'Abuja', 'Yesterday', TRUE, 567, 7, 4, '2024-04-14 14:00:00'),
('Casio G-Shock Mudmaster', 'Casio G-Shock Mudmaster GWG-2000. Mud resistant. Carbon core guard. Digital compass. Thermometer. Solar powered. Very tough. Like new.', 185000, 'Used', 'https://example.com/gshock.jpg', 'Ibadan', '1 week ago', FALSE, 167, 8, 4, '2024-04-08 14:20:00'),
('Aso-oke Fabric - 6 Yards', 'Hand-woven Aso-oke fabric. Traditional Yoruba style. Pure cotton. Beautiful indigo blue. 6 yards. Perfect for Owambe. Durable material.', 25000, 'New', 'https://example.com/asooke.jpg', 'Lagos', '3 days ago', FALSE, 234, 9, 4, '2024-04-12 11:30:00'),
('Rolex Submariner - Date', 'Rolex Submariner Date 116610LN. 40mm. Black dial. Oyster bracelet. Excellent condition. Papers and box available. Full set. 2019 model.', 14500000, 'Used', 'https://example.com/rolex.jpg', 'Abuja', 'Just now', TRUE, 890, 10, 4, '2024-04-16 08:15:00');

-- HOME & FURNITURE (12 ads)
INSERT INTO ads (title, description, price, `condition`, image_url, location, time_posted, is_featured, views, user_id, category_id, created_at) VALUES
('Executive Office Chair - Leather', 'High-back executive office chair. Premium leather. Adjustable armrests. Lumbar support. 180-degree recline. Wheels for smooth movement. Very comfortable.', 185000, 'New', 'https://example.com/office-chair.jpg', 'Lagos', '4 days ago', FALSE, 156, 11, 5, '2024-04-11 10:30:00'),
('Samsung Inverter AC 1.5HP', 'Samsung Inverter AC 1.5HP. Cool air mode. Energy saving. Remote control included. Easy installation available. 1 year warranty. Very cold.', 280000, 'Used', 'https://example.com/ac-15hp.jpg', 'Ibadan', '1 week ago', FALSE, 234, 12, 5, '2024-04-08 15:00:00'),
('7 Seater Dining Table Set', '7 seater dining set. Wooden table with 6 matching chairs. Upholstered seats. Modern design. Very sturdy. Fits well in large dining area. Delivery available.', 450000, 'Used', 'https://example.com/dining-set.jpg', 'Abuja', '3 days ago', FALSE, 178, 13, 5, '2024-04-12 09:45:00'),
('LG 2HP Inverter AC - New', 'LG 2HP Dual Inverter AC. 24000 BTU. Fast cooling. Low noise operation. WiFi enabled. 5 years compressor warranty. Installation included.', 450000, 'New', 'https://example.com/lg-ac.jpg', 'Port Harcourt', 'Yesterday', TRUE, 289, 14, 5, '2024-04-14 11:30:00'),
('King Size Bed with Mattress', 'King size bed frame with orthopedic mattress. 8 inch latex mattress. Storage drawers underneath. Modern design. Dark brown color. Very comfortable sleep.', 380000, 'Used', 'https://example.com/king-bed.jpg', 'Lagos', '2 weeks ago', FALSE, 145, 15, 5, '2024-04-01 14:20:00'),
('Nigerian Fabrics - Variety Pack', 'Nigerian fabrics variety pack. Ankara, Aso-oke, and lace. 6 yards each. Different colors available. WhatsApp for more options. Wholesale prices.', 85000, 'New', 'https://example.com/fabrics.jpg', 'Ibadan', 'Just now', FALSE, 312, 1, 5, '2024-04-16 07:15:00'),
('Standing Fan - 24 inch', '24 inch standing fan. Powerful air circulation. 3 speed settings. Oscillating function. Stable base. Durable motor. Cools the whole room.', 45000, 'New', 'https://example.com/standing-fan.jpg', 'Abuja', '5 days ago', FALSE, 167, 2, 5, '2024-04-10 13:45:00'),
('Centre Table - Glass Top', 'Modern centre table. Tempered glass top. Wooden legs. 120cm x 60cm. Sleek design. Fits any living room. Scratch resistant. Very stable.', 85000, 'Used', 'https://example.com/centre-table.jpg', 'Port Harcourt', '1 week ago', FALSE, 89, 3, 5, '2024-04-08 10:15:00'),
('Hisense 200L Chest Freezer', 'Hisense 200 liter chest freezer. Direct cool. Adjustable thermostat. Fast freeze function. Lockable lid. Energy efficient. Perfect for home or shop.', 195000, 'New', 'https://example.com/freezer.jpg', 'Lagos', 'Yesterday', FALSE, 234, 4, 5, '2024-04-14 09:00:00'),
('Bookshelf - 5 Layer', '5 layer bookshelf. Engineered wood. Modern design. Easy to assemble. 180cm tall. Can hold lots of books. Clean white color. Sturdy construction.', 75000, 'New', 'https://example.com/bookshelf.jpg', 'Ibadan', '4 days ago', FALSE, 123, 5, 5, '2024-04-11 16:00:00'),
('Electric Standing Desk', 'Height adjustable electric standing desk. 140cm x 70cm top. Memory presets. USB charging ports. Cable management. Easy to use. Perfect for home office.', 285000, 'Used', 'https://example.com/standing-desk.jpg', 'Abuja', '2 weeks ago', FALSE, 156, 6, 5, '2024-04-01 11:30:00'),
('Washing Machine - LG 8kg', 'LG 8kg front load washing machine. Inverter direct drive. 10 programs. Add items function. WiFi enabled. Very clean. No rust. Perfect working.', 280000, 'Used', 'https://example.com/washing-machine.jpg', 'Port Harcourt', '1 week ago', FALSE, 198, 7, 5, '2024-04-08 14:45:00');

-- REAL ESTATE (8 ads)
INSERT INTO ads (title, description, price, `condition`, image_url, location, time_posted, is_featured, views, user_id, category_id, created_at) VALUES
('3 Bedroom Flat in Lekki Phase 1', 'Beautifully finished 3 bedroom flat in Lekki Phase 1. All rooms ensuite. Fully fitted kitchen. 24/7 security. Estate is well managed. Good road network. Agent fee applies.', 85000000, 'Used', 'https://example.com/lekki-3bed.jpg', 'Lagos', '2 days ago', TRUE, 567, 8, 6, '2024-04-13 10:00:00'),
('Shop Space - Victoria Island', 'Commercial shop space on Victoria Island. Ground floor. 50 sqm. High foot traffic. 24/7 security. Power supply. Suitable for retail or office. Short term lease available.', 15000000, 'New', 'https://example.com/vi-shop.jpg', 'Lagos', 'Yesterday', FALSE, 345, 9, 6, '2024-04-14 12:30:00'),
('4 Bedroom Duplex in Maitama', 'Luxury 4 bedroom duplex in Maitama. 5 bathrooms. BQ. Swimming pool. 3 parking spaces. 24/7 security. Serviced estate. C of O available. Serious buyers only.', 450000000, 'New', 'https://example.com/maitama-duplex.jpg', 'Abuja', 'Just now', TRUE, 789, 10, 6, '2024-04-16 08:30:00'),
('2 Bedroom Apartment - Ikoyi', 'Tastefully finished 2 bedroom apartment in Ikoyi. 2 bathrooms. 24/7 power supply. Gym access. Swimming pool. Elevator. Well painted. Wardrobes fitted.', 65000000, 'Used', 'https://example.com/ikoyi-2bed.jpg', 'Lagos', '5 days ago', FALSE, 456, 11, 6, '2024-04-10 14:15:00'),
('Land - 600sqm in Lekki', '600 sqm land on Lekki-Epe Expressway. Good neighborhood. Layout plan available. Survey and deed of assignment. Ideal for residential or commercial. Quick sale.', 35000000, 'New', 'https://example.com/lekki-land.jpg', 'Lagos', '3 days ago', FALSE, 623, 12, 6, '2024-04-12 11:45:00'),
('5 Bedroom Mansion in Banana Island', 'Magnificent 5 bedroom mansion in Banana Island. 6 bathrooms. Cinema room. 2 living rooms. 4 parking spaces. Private swimming pool. Top security. C of O available.', 1500000000, 'New', 'https://example.com/banana-mansion.jpg', 'Lagos', 'Yesterday', TRUE, 1234, 13, 6, '2024-04-14 15:00:00'),
('Self Contain in Yaba', 'Clean self contain in Yaba. Running water. Constant electricity. Tiled floors. Secure environment. Good for students or workers. All bills inclusive. No agent fee.', 3500000, 'Used', 'https://example.com/yaba-selfcon.jpg', 'Lagos', '1 week ago', FALSE, 289, 14, 6, '2024-04-08 09:30:00'),
('Warehouse - 5000sqft in Ikeja', 'Industrial warehouse in Ikeja. 5000 sqft. High ceiling. Loading bay. Power supply 3-phase. Good for storage or light manufacturing. Easy access to Expressway.', 120000000, 'New', 'https://example.com/ikeja-warehouse.jpg', 'Lagos', '4 days ago', FALSE, 198, 15, 6, '2024-04-11 13:20:00');

-- HEALTH & BEAUTY (10 ads)
INSERT INTO ads (title, description, price, `condition`, image_url, location, time_posted, is_featured, views, user_id, category_id, created_at) VALUES
('Dyson Airwrap Complete Long', 'Dyson Airwrap Complete Long. For long hair. 6 attachments. Curl, wave, smooth, dry. Original. Used once. Includes all barrels and brushes. Complete set.', 385000, 'Used', 'https://example.com/airwrap.jpg', 'Lagos', '1 week ago', FALSE, 456, 1, 7, '2024-04-08 10:30:00'),
('Glow Recipe Watermelon Set', 'Glow Recipe Watermelon Glow Kit. Cleanser, toner, moisturizer. Full size. Expiry 2026. 100% authentic. Great for oily skin. Night glow drops included.', 55000, 'New', 'https://example.com/glow-recipe.jpg', 'Abuja', '3 days ago', FALSE, 234, 2, 7, '2024-04-12 14:00:00'),
('Oster Classic 76 Clippers', 'Oster Classic 76 clipper. Professional grade. Detachable blade. Powerful motor. Used in salons. Very durable. Extra blades included. Perfect cutting.', 85000, 'Used', 'https://example.com/oster-clippers.jpg', 'Ibadan', '2 weeks ago', FALSE, 167, 3, '7', '2024-04-01 11:15:00'),
('Clarisonic Mia Prima', 'Clarisonic Mia Prima face brush. Deep cleansing. Rechargeable. 2 speeds. Very gentle on skin. Used 3 months. Makes skin glow. Original charger included.', 45000, 'Used', 'https://example.com/clarisonic.jpg', 'Port Harcourt', '4 days ago', FALSE, 189, 4, '7', '2024-04-11 09:45:00'),
('NuFace Trinity Device', 'NuFace Trinity anti-aging device. FDA cleared. Reduces fine lines. Firms skin. Complete with eye and lip attachments. Like new. Results visible.', 185000, 'Used', 'https://example.com/nuface.jpg', 'Lagos', '1 week ago', FALSE, 312, 5, '7', '2024-04-08 15:30:00'),
('Organic Skincare Set - 5 Products', 'Organic African skincare set. Face wash, toner, serum, moisturizer, eye cream. All natural ingredients. Suitable for all skin types. Lightening set also available.', 35000, 'New', 'https://example.com/organic-skincare.jpg', 'Ibadan', 'Yesterday', FALSE, 267, 6, '7', '2024-04-14 11:00:00'),
('Hair Steamer - Professional', 'Professional hair steamer. 1500W. 45 minute timer. Automatic shut off. Portable with wheels. Distributes steam evenly. Great for hair treatment. Very clean.', 65000, 'Used', 'https://example.com/hair-steamer.jpg', 'Abuja', '5 days ago', FALSE, 145, 7, '7', '2024-04-10 13:45:00'),
('Perfumes - Original Designer Pack', 'Designer perfumes - variety pack. Dior, Chanel, YSL, Tom Ford. 100ml each. Original with box. Perfect gifts. All sealed. WhatsApp for list. Bulk discount.', 85000, 'New', 'https://example.com/designer-perfumes.jpg', 'Port Harcourt', 'Just now', FALSE, 456, 8, '7', '2024-04-16 07:45:00'),
('Treadmill - Home Use', 'Electric treadmill for home. 2.5HP motor. 12 preset programs. Heart rate monitor. Folding design. LED display. Max speed 16km/h. Cushioning deck. Very stable.', 280000, 'Used', 'https://example.com/treadmill.jpg', 'Lagos', '2 weeks ago', FALSE, 198, 9, '7', '2024-04-01 16:00:00'),
('Hair Products - Nigerian Brands Pack', 'Nigerian hair products pack. Curl maximus, kera care, ORS, Elasta QP. Shampoos, conditioners, moisturizers. 8 products. Everything for natural hair. Authentic.', 25000, 'New', 'https://example.com/naija-hair.jpg', 'Ibadan', '3 days ago', FALSE, 234, 10, '7', '2024-04-12 10:30:00');

-- SPORTS & OUTDOORS (10 ads)
INSERT INTO ads (title, description, price, `condition`, image_url, location, time_posted, is_featured, views, user_id, category_id, created_at) VALUES
('Trek Marlin 7 Mountain Bike', 'Trek Marlin 7. 2023 model. Aluminum frame. 29 inch wheels. 12 speed Shimano. Lockout fork. Perfect for trails. Well maintained. Very clean.', 850000, 'Used', 'https://example.com/marlin7.jpg', 'Lagos', '2 weeks ago', FALSE, 234, 11, 8, '2024-04-01 09:00:00'),
('Adidas Predator足球鞋 - Size 42', 'Adidas Predator Accuracy. FG boots. Size 42. White/Black colorway. Responsive control. Hybrid studs. Used 3 times. Perfect condition. Original.', 65000, 'Used', 'https://example.com/predator.jpg', 'Abuja', '1 week ago', FALSE, 167, 12, 8, '2024-04-08 11:30:00'),
('Camping Tent - 4 Person', '4 person camping tent. Waterproof. Easy setup. Rainfly included. Storage pockets. Lightweight. Perfect for family camping. Comes with carry bag.', 75000, 'New', 'https://example.com/camping-tent.jpg', 'Ibadan', 'Yesterday', FALSE, 189, 13, 8, '2024-04-14 13:00:00'),
('Wilson Evolution Basketball', 'Wilson Evolution game ball. Official size. Composite leather. Deep channels. Excellent grip. Used one season. Inflatables included. Perfect feel.', 35000, 'Used', 'https://example.com/evolution-ball.jpg', 'Port Harcourt', '3 weeks ago', FALSE, 98, 14, 8, '2024-03-23 14:20:00'),
('Adjustable Dumbbells - 32kg Set', 'Adjustable dumbbells. 32kg total (16kg each). Quick change. Space saving. Solid construction. Perfect for home gym. Includes stand. Very clean.', 185000, 'Used', 'https://example.com/dumbbells.jpg', 'Lagos', '1 week ago', FALSE, 267, 15, 8, '2024-04-08 10:15:00'),
('Tactical Hiking Backpack - 65L', '65 liter hiking backpack. Tactical design. Multiple compartments. Rain cover included. Hip belt. Sternum strap. Hydration compatible. Very durable.', 55000, 'New', 'https://example.com/hiking-pack.jpg', 'Abuja', '4 days ago', FALSE, 145, 1, 8, '2024-04-11 15:30:00'),
('Wilson Evolution Hockey Stick', 'Wilson Evolution field hockey stick. Junior size. Composite. Maximum power. Control zone. Used but good condition. Great for beginners. Grip intact.', 25000, 'Used', 'https://example.com/hockey-stick.jpg', 'Ibadan', '2 weeks ago', FALSE, 78, 2, 8, '2024-04-01 12:00:00'),
('Yoga Mat - Premium Thick', 'Premium yoga mat. 6mm thick. Non-slip surface. Eco-friendly material. Alignment lines. Carrying strap included. Multiple colors. Good for home or studio.', 25000, 'New', 'https://example.com/yoga-mat.jpg', 'Abuja', 'Yesterday', FALSE, 234, 3, 8, '2024-04-14 09:30:00'),
('Fishing Rod Combo Set', 'Fishing rod combo. 2.1m telescopic. Spinning reel 5000. 4+1 bearings. Comes with tackle box. Lures and hooks included. Perfect for beginners. River or lake.', 45000, 'New', 'https://example.com/fishing-rod.jpg', 'Port Harcourt', '5 days ago', FALSE, 156, 4, 8, '2024-04-10 16:45:00'),
('Speedo Swimsuit - Competition', 'Speedo LZR R.X 2.0 Competition swimsuit. Size 32. Jammer style. Compressive fit. Leg length. FINA approved. Used twice. Excellent condition. Fast in water.', 85000, 'Used', 'https://example.com/speedo.jpg', 'Lagos', '1 week ago', FALSE, 123, 5, 8, '2024-04-08 14:00:00');

-- =====================================================
-- COMPLETE SUMMARY
-- =====================================================

-- Total Records:
-- Users: 15 sellers
-- Categories: 8 categories  
-- Ads: 120 total listings
--   - Phones & Tablets: 25 ads
--   - Vehicles: 20 ads
--   - Electronics: 20 ads
--   - Fashion: 15 ads
--   - Home & Furniture: 12 ads
--   - Real Estate: 8 ads
--   - Health & Beauty: 10 ads
--   - Sports & Outdoors: 10 ads

-- Indexes Added for Performance:
--   - users: location, created_at
--   - categories: slug (unique)
--   - ads: category_id, user_id, created_at, is_featured, condition, location, FULLTEXT(title, description)

-- Condition Distribution (120 ads):
--   - New: ~36 ads (30%)
--   - Used: ~72 ads (60%)
--   - Refurbished: ~12 ads (10%)

-- Locations Used:
--   - Lagos, Abuja, Ibadan, Port Harcourt, Enugu, Kano

-- Time Posted Distribution:
--   - Just now, 2 hours ago, 4 hours ago, 5 hours ago
--   - Yesterday, 2 days ago, 3 days ago, 4 days ago, 5 days ago
--   - 1 week ago, 2 weeks ago, 3 weeks ago
