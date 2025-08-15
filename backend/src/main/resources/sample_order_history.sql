-- Sample dummy data for order history, each order is linked to a specific customer (user_id)
-- Adjust table/column names as needed for your schema

INSERT INTO users (id, username, email, password, role) VALUES
  (1, 'alice', 'alice@example.com', 'password1', 'CUSTOMER'),
  (2, 'bob', 'bob@example.com', 'password2', 'CUSTOMER'),
  (3, 'carol', 'carol@example.com', 'password3', 'CUSTOMER'),
  (4, 'ttppoomu', 'ttppoomu@gmail.com', 'password4', 'CUSTOMER');

INSERT INTO orders (id, user_id, order_number, total_amount, status, created_at) VALUES
  (101, 1, 'ORD-1001', 59.99, 'COMPLETED', '2025-08-01 10:00:00'),
  (102, 1, 'ORD-1002', 120.50, 'COMPLETED', '2025-08-10 14:30:00'),
  (103, 2, 'ORD-1003', 15.00, 'CANCELLED', '2025-08-12 09:15:00'),
  (104, 3, 'ORD-1004', 200.00, 'COMPLETED', '2025-08-13 16:45:00'),
  (105, 4, 'ORD-2001', 75.00, 'COMPLETED', '2025-08-14 11:20:00'),
  (106, 4, 'ORD-2002', 150.00, 'COMPLETED', '2025-08-15 09:00:00');

INSERT INTO order_item (id, order_id, product_id, quantity, price) VALUES
  (1001, 101, 10, 2, 29.99),
  (1002, 102, 12, 1, 120.50),
  (1003, 103, 11, 1, 15.00),
  (1004, 104, 13, 4, 50.00),
  (1005, 105, 14, 1, 75.00),
  (1006, 106, 15, 3, 50.00);
