import React from 'react';

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    imageUrl?: string;
    description?: string;
  };
  quantity: number;
  priceAtTime: number;
  subtotal: number;
}

const OrderItemTable: React.FC<{ orderItems: OrderItem[] }> = ({ orderItems }) => {
  return (
    <div style={{marginTop:16}}>
      {orderItems.map(item => {
        if (!item.product) {
          return (
            <div key={item.id} style={{color: 'red', marginBottom: 12}}>
              ข้อมูลสินค้าของคำสั่งซื้อ (ID: {item.id}) ไม่สมบูรณ์ กรุณาตรวจสอบ backend หรือ login ใหม่
            </div>
          );
        }
        return (
          <div key={item.id} style={{
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 12px #f0f1f2',
            marginBottom: 18,
            padding: 18,
            transition: 'box-shadow 0.2s',
            border: '1px solid #f3f3f3',
          }}>
            <div style={{marginRight: 20, minWidth: 80}}>
              <img
                src={item.product.imageUrl || '/placeholder-product.jpg'}
                alt={item.product.name}
                style={{width: 80, height: 80, objectFit: 'cover', borderRadius: 8, boxShadow: '0 1px 6px #eee'}}
              />
            </div>
            <div style={{flex: 1}}>
              <div style={{fontWeight: 600, fontSize: 17, marginBottom: 4, color: '#222'}}>{item.product.name}</div>
              <div style={{color: '#888', fontSize: 14, marginBottom: 6}}>{item.product.description || '-'}</div>
              <div style={{display: 'flex', gap: 18, fontSize: 15, marginBottom: 6}}>
                <span>จำนวน: <b>{item.quantity}</b></span>
                <span>ราคาต่อชิ้น: <b>{item.priceAtTime.toLocaleString()} ฿</b></span>
                <span>รวม: <b style={{color:'#d4380d'}}>{item.subtotal.toLocaleString()} ฿</b></span>
              </div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}}>
              <button style={{padding: '6px 18px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight:600, fontSize:15, boxShadow:'0 1px 4px #e6f7e6'}} onClick={() => alert(`รีวิวสินค้า: ${item.product.name}`)}>
                รีวิวสินค้า
              </button>
              <button style={{padding: '6px 18px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight:600, fontSize:15, boxShadow:'0 1px 4px #e6f0fa'}} onClick={() => alert(`สั่งซื้ออีกครั้ง: ${item.product.name}`)}>
                สั่งซื้ออีกครั้ง
              </button>
            </div>
          </div>
        );
      })}
      <div style={{padding:12, background:'#fafafa', fontStyle:'italic', color:'#888', borderRadius:8, textAlign:'center', marginTop:8}}>
        * คุณสามารถรีวิวหรือสั่งซื้อสินค้าเดิมได้จากปุ่มด้านบน
      </div>
    </div>
  );
};

export default OrderItemTable;
