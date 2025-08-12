-- สร้างผู้ใช้ตัวอย่าง
INSERT INTO users (name, email, first_name, last_name, role, created_at, updated_at, picture) VALUES
('สมชาย ใจดี', 'somchai@example.com', 'สมชาย', 'ใจดี', 'USER', NOW(), NOW(), 'https://randomuser.me/api/portraits/men/1.jpg'),
('สมหญิง รักเก้า', 'somying@example.com', 'สมหญิง', 'รักเก้า', 'USER', NOW(), NOW(), 'https://randomuser.me/api/portraits/women/1.jpg'),
('ประกอบ แซ่ลิ้ม', 'prakob@example.com', 'ประกอบ', 'แซ่ลิ้ม', 'USER', NOW(), NOW(), 'https://randomuser.me/api/portraits/men/2.jpg'),
('นิตยา สวยงาม', 'nitaya@example.com', 'นิตยา', 'สวยงาม', 'USER', NOW(), NOW(), 'https://randomuser.me/api/portraits/women/2.jpg'),
('วิชาญ เก่งมาก', 'wichan@example.com', 'วิชาญ', 'เก่งมาก', 'USER', NOW(), NOW(), 'https://randomuser.me/api/portraits/men/3.jpg')
ON CONFLICT (email) DO NOTHING;

-- สร้าง orders ตัวอย่าง (จำเป็นสำหรับการ verify ว่าซื้อสินค้าแล้ว)
INSERT INTO orders (user_id, total_amount, status, shipping_address, created_at, updated_at) 
SELECT 
    u.id as user_id,
    1500.00 as total_amount,
    'COMPLETED' as status,
    'กรุงเทพมหานคร ประเทศไทย' as shipping_address,
    NOW() - INTERVAL '30 days' as created_at,
    NOW() - INTERVAL '30 days' as updated_at
FROM users u 
WHERE u.email IN ('somchai@example.com', 'somying@example.com', 'prakob@example.com', 'nitaya@example.com', 'wichan@example.com')
ON CONFLICT DO NOTHING;

-- สร้าง order_items ตัวอย่าง
INSERT INTO order_items (order_id, product_id, quantity, price, created_at, updated_at)
SELECT 
    o.id as order_id,
    115 as product_id,
    1 as quantity,
    1500.00 as price,
    o.created_at,
    o.updated_at
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.email IN ('somchai@example.com', 'somying@example.com', 'prakob@example.com', 'nitaya@example.com', 'wichan@example.com')
ON CONFLICT DO NOTHING;

-- สร้างรีวิวตัวอย่าง
INSERT INTO comments (user_id, product_id, content, rating, created_at, updated_at, is_edited)
SELECT 
    u.id as user_id,
    115 as product_id,
    CASE u.email
        WHEN 'somchai@example.com' THEN 'สินค้าดีมาก ใช้งานง่าย ส่งเร็ว แพ็คดี คุณภาพเกินราคา แนะนำเลยครับ!'
        WHEN 'somying@example.com' THEN 'ได้ตามที่คาดหวัง การใช้งานค่อนข้างดี แต่ต้องศึกษาก่อนใช้นิดหนึ่ง โดยรวมพอใจค่ะ'
        WHEN 'prakob@example.com' THEN 'คุณภาพดีเยี่ยม! ใช้มาหลายเดือนแล้วไม่มีปัญหา ราคาคุ้มค่ามาก จะซื้ออีกแน่นอน'
        WHEN 'nitaya@example.com' THEN 'สินค้าถึงเร็วกว่าที่คิด คุณภาพดี บรรจุภัณฑ์ปลอดภัย ประทับใจมากค่ะ'
        WHEN 'wichan@example.com' THEN 'โอเค ในราคานี้ ใช้ได้ดี มีเล็กน้อยที่ต้องปรับปรุง แต่โดยรวมพอใจครับ'
    END as content,
    CASE u.email
        WHEN 'somchai@example.com' THEN 5
        WHEN 'somying@example.com' THEN 4
        WHEN 'prakob@example.com' THEN 5
        WHEN 'nitaya@example.com' THEN 5
        WHEN 'wichan@example.com' THEN 3
    END as rating,
    NOW() - INTERVAL '25 days' + (RANDOM() * INTERVAL '20 days') as created_at,
    NOW() - INTERVAL '25 days' + (RANDOM() * INTERVAL '20 days') as updated_at,
    false as is_edited
FROM users u
WHERE u.email IN ('somchai@example.com', 'somying@example.com', 'prakob@example.com', 'nitaya@example.com', 'wichan@example.com')
ON CONFLICT DO NOTHING;

-- สร้างรีวิวเพิ่มเติมสำหรับสินค้าอื่นๆ
INSERT INTO comments (user_id, product_id, content, rating, created_at, updated_at, is_edited)
SELECT 
    u.id as user_id,
    116 as product_id,
    CASE u.email
        WHEN 'somchai@example.com' THEN 'สินค้าคุณภาพดี แต่ราคาค่อนข้างแพง คุ้มค่าในระดับหนึ่ง'
        WHEN 'somying@example.com' THEN 'ใช้งานง่าย ดีไซน์สวย ฟีเจอร์ครบครัน ประทับใจมากค่ะ'
    END as content,
    CASE u.email
        WHEN 'somchai@example.com' THEN 4
        WHEN 'somying@example.com' THEN 5
    END as rating,
    NOW() - INTERVAL '20 days' + (RANDOM() * INTERVAL '15 days') as created_at,
    NOW() - INTERVAL '20 days' + (RANDOM() * INTERVAL '15 days') as updated_at,
    false as is_edited
FROM users u
WHERE u.email IN ('somchai@example.com', 'somying@example.com')
ON CONFLICT DO NOTHING;

-- สร้าง reply ตัวอย่าง
INSERT INTO comments (user_id, product_id, parent_comment_id, content, created_at, updated_at, is_edited)
SELECT 
    u2.id as user_id,
    115 as product_id,
    c.id as parent_comment_id,
    'ขอบคุณสำหรับรีวิวครับ ช่วยตัดสินใจได้มากเลย!' as content,
    c.created_at + INTERVAL '1 day' as created_at,
    c.created_at + INTERVAL '1 day' as updated_at,
    false as is_edited
FROM comments c
JOIN users u1 ON c.user_id = u1.id
JOIN users u2 ON u2.email = 'wichan@example.com'
WHERE u1.email = 'somchai@example.com' AND c.product_id = 115 AND c.parent_comment_id IS NULL
LIMIT 1
ON CONFLICT DO NOTHING;
