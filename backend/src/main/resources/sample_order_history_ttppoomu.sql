-- Insert user for ttppoomu@gmail.com if not exists
INSERT INTO users (id, username, email, password, role) VALUES
  (4, 'ttppoomu', 'ttppoomu@gmail.com', 'password4', 'CUSTOMER')
ON CONFLICT (id) DO NOTHING;
-- Dummy order data for user ttppoomu@gmail.com using real product IDs
-- User: id=4, email=ttppoomu@gmail.com

-- Orders for ttppoomu@gmail.com
INSERT INTO orders (id, user_id, order_number, total_amount, status, created_at) VALUES
  (201, 4, 'ORD-3001', 29900.00, 'COMPLETED', '2025-08-10 10:00:00'),
  (202, 4, 'ORD-3002', 39900.00, 'COMPLETED', '2025-08-12 15:30:00');

-- Order items for these orders, using your real product IDs
INSERT INTO order_item (id, order_id, product_id, quantity, price) VALUES
  (2001, 201, 114, 1, 29900.00), -- MacBook Air M2
  (2002, 202, 115, 1, 39900.00); -- iPhone 15 Pro
