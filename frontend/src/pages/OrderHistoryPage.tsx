import React, { useEffect, useState } from 'react';
import OrderCard from './OrderCard';

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    imageUrl?: string;
  };
  quantity: number;
  priceAtTime: number;
  subtotal: number;
}

interface Order {
  id: number;
  orderNumber: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  phoneNumber: string;
  orderItems: OrderItem[];
}

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed error state since auth is not required

  useEffect(() => {
    setLoading(true);
    fetch('/api/orders/my-orders', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (!data) return;
        if (data.content) {
          setOrders(data.content);
        } else {
          setOrders([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>กำลังโหลด...</div>;
  // Always show orders, ignore error for unauthorized

  return (
    <div style={{maxWidth: 900, margin: '0 auto', padding: 24}}>
      <h2>ประวัติคำสั่งซื้อของฉัน</h2>
      {orders.length === 0 ? (
        <div>ไม่มีประวัติคำสั่งซื้อ</div>
      ) : (
        orders.map(order => <OrderCard key={order.id} order={order} />)
      )}
    </div>
  );
};

export default OrderHistoryPage;
