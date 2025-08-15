import React, { useState } from 'react';
import OrderItemTable from './OrderItemTable';

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

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: 'รอดำเนินการ', color: '#faad14', bg: '#fffbe6' },
  PAID:       { label: 'ชำระเงินแล้ว', color: '#1890ff', bg: '#e6f7ff' },
  SHIPPED:    { label: 'จัดส่งแล้ว', color: '#722ed1', bg: '#f9f0ff' },
  DELIVERED:  { label: 'สำเร็จ', color: '#52c41a', bg: '#f6ffed' },
  CANCELLED:  { label: 'ยกเลิก', color: '#f5222d', bg: '#fff1f0' },
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const [showDetail, setShowDetail] = useState(false);
  const status = statusMap[order.status] || { label: order.status, color: '#888', bg: '#f5f5f5' };
  return (
    <div style={{
      border: '1px solid #f0f0f0',
      borderRadius: 14,
      margin: '24px 0',
      padding: 0,
      boxShadow: '0 4px 24px #f0f1f2',
      overflow: 'hidden',
      background: '#fff',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Header */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px 10px 28px', borderBottom: '1px solid #f5f5f5', background:'#fafcff'}}>
        <div>
          <div style={{fontWeight:700, fontSize:17, marginBottom:2, letterSpacing:0.5}}>
            <span style={{color:'#888', fontWeight:400, fontSize:14}}>เลขที่คำสั่งซื้อ</span> #{order.orderNumber}
          </div>
          <div style={{color:'#888', fontSize:13}}>
            <span style={{marginRight:12}}><span style={{fontWeight:500}}>วันที่:</span> {new Date(order.createdAt).toLocaleString('th-TH')}</span>
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <span style={{
            background: status.bg,
            color: status.color,
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 8,
            padding: '6px 18px',
            display: 'inline-block',
            boxShadow: '0 1px 4px #f0f1f2',
            letterSpacing:0.5
          }}>{status.label}</span>
        </div>
      </div>
      {/* Items */}
      <div style={{padding: '0 28px'}}>
        <OrderItemTable orderItems={order.orderItems} />
      </div>
      {/* Footer */}
      <div style={{marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 28px 18px 28px'}}>
        <div style={{color:'#666', fontSize:14}}>
          <div><b>ที่อยู่จัดส่ง:</b> {order.shippingAddress}</div>
          <div><b>เบอร์โทร:</b> {order.phoneNumber}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontWeight:600, fontSize:18, color:'#d4380d'}}>ราคารวม: {order.totalAmount.toLocaleString()} ฿</div>
        </div>
      </div>
      {/* Actions */}
      <div style={{marginTop: 0, textAlign: 'right', padding: '0 28px 18px 28px'}}>
        <button onClick={() => setShowDetail(v => !v)} style={{
          marginRight:8,
          background:'#fff',
          color:'#1890ff',
          border:'1px solid #1890ff',
          borderRadius:6,
          padding:'6px 18px',
          fontWeight:600,
          fontSize:15,
          cursor:'pointer',
          boxShadow:'0 1px 4px #e6f7ff',
          transition:'background 0.2s,color 0.2s'
        }}>
          {showDetail ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
        </button>
        <button disabled={order.status !== 'PENDING'} style={{
          background:'#f5222d',
          color:'#fff',
          border:'none',
          borderRadius:6,
          padding:'6px 18px',
          fontWeight:600,
          fontSize:15,
          opacity: order.status !== 'PENDING' ? 0.5 : 1,
          cursor: order.status !== 'PENDING' ? 'not-allowed' : 'pointer',
          boxShadow:'0 1px 4px #faeaea',
        }}>
          ยกเลิกคำสั่งซื้อ
        </button>
      </div>
      {/* Detail */}
      {showDetail && (
        <div style={{marginTop:16, background:'#fafafa', padding:18, borderRadius:10, margin:'0 28px 18px 28px'}}>
          <b style={{fontSize:15}}>รายละเอียดเพิ่มเติม</b>
          <div style={{marginTop:6, color:'#666', fontSize:14}}>
            <div>สถานะ: <span style={{color:status.color}}>{status.label}</span></div>
            <div>วันที่สั่งซื้อ: {new Date(order.createdAt).toLocaleString('th-TH')}</div>
            <div>เบอร์โทร: {order.phoneNumber}</div>
            <div>ที่อยู่: {order.shippingAddress}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
