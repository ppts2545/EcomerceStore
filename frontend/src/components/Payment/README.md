# Payment System Components

ระบบการชำระเงินที่สมบูรณ์สำหรับ E-commerce ที่รองรับการชำระเงินในประเทศไทย พร้อมระบบกระเป๋าเงินและแดชบอร์ดสำหรับผู้ดูแลระบบ

## Components ที่มี

### 1. PaymentMethod
หน้าสำหรับเลือกวิธีการชำระเงิน
- ธนาคารไทยหลัก (SCB, KBANK, BBL, KTB, TMB, BAY)
- พร้อมเพย์ (PromptPay)
- TrueMoney Wallet
- บัตรเครดิต/เดบิต

### 2. PaymentProcessing
หน้าแสดงสถานะการประมวลผลการชำระเงิน
- แสดงขั้นตอนการประมวลผล
- Countdown timer
- Real-time status updates
- Error handling

### 3. TransactionHistory
หน้าประวัติการชำระเงิน
- แสดงรายการธุรกรรมทั้งหมด
- กรองตามสถานะ
- ค้นหาธุรกรรม
- เรียงลำดับข้อมูล
- Export เป็น CSV
- Pagination

### 4. PaymentFlow
Component หลักที่รวมทุกอย่างเข้าด้วยกัน
- Navigation steps
- Modal สำหรับดูรายละเอียดธุรกรรม
- Success page
- Error handling

### 5. UserWallet 🆕
กระเป๋าเงินสำหรับผู้ใช้งาน
- แสดงยอดเงินคงเหลือ
- รายการธุรกรรมเข้า-ออก
- ถอนเงินเข้าบัญชีธนาคาร
- สถิติรายได้และค่าใช้จ่าย
- กรองรายการตามประเภท

### 6. AdminFinanceDashboard 🆕
แดชบอร์ดการเงินสำหรับผู้ดูแลระบบ
- ภาพรวมรายได้ทั้งหมด
- สถิติธุรกรรม
- กราฟรายได้รายวัน
- รายการธุรกรรมทั้งหมด
- ค้นหาและกรองข้อมูล
- Export รายงาน

## การใช้งาน

### ติดตั้ง Dependencies
```bash
npm install react react-dom
npm install --dev @types/react @types/react-dom typescript
```

### Basic Usage

```tsx
import React from 'react';
import { PaymentFlow } from './components/Payment';

const CheckoutPage: React.FC = () => {
  const orderData = {
    orderId: 'ORD12345',
    items: [
      { name: 'iPhone 15 Pro', price: 39900, quantity: 1 }
    ],
    totalAmount: 39900
  };

  const handlePaymentComplete = (result: any) => {
    console.log('Payment completed:', result);
    // Handle successful payment
  };

  return (
    <PaymentFlow
      initialAmount={orderData.totalAmount}
      orderData={orderData}
      onPaymentComplete={handlePaymentComplete}
    />
  );
};
```

### การใช้งาน Components ใหม่

```tsx
// กระเป๋าเงินผู้ใช้
import { UserWallet } from './components/Payment';

<UserWallet 
  userId="usr001"
  onWithdraw={(amount) => console.log('Withdrew:', amount)}
/>

// แดชบอร์ดผู้ดูแลระบบ
import { AdminFinanceDashboard } from './components/Payment';

<AdminFinanceDashboard />
```

## API Integration

### Backend Integration
คุณต้องแทนที่ mock functions ในไฟล์ต่อไปนี้:

#### PaymentProcessing.tsx
```typescript
// แทนที่ processPayment function
const processPayment = async (paymentData: PaymentData) => {
  const response = await fetch('/api/payments/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(paymentData)
  });
  
  return response.json();
};
```

#### TransactionHistory.tsx
```typescript
// แทนที่ fetchTransactions function
const fetchTransactions = async () => {
  const response = await fetch('/api/payments/transactions', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  const data = await response.json();
  setTransactions(data.transactions);
};
```

## Styling

Components ใช้ CSS Modules และรองรับ:
- Responsive design
- Dark mode
- Animations
- Print styles

## Features

### ✅ รองรับการชำระเงินในไทย
- ธนาคารไทยครบถ้วน
- พร้อมเพย์
- TrueMoney
- บัตรเครดิต/เดบิต

### ✅ User Experience
- Step-by-step navigation
- Real-time status updates
- Error handling
- Loading states
- Success animations

### ✅ Transaction Management
- Complete transaction history
- Search and filtering
- Sorting
- Export functionality
- Pagination

### ✅ Mobile Responsive
- Works on all screen sizes
- Touch-friendly interface
- Mobile-optimized layouts

## Customization

### เปลี่ยนธนาคาร
แก้ไขใน `PaymentMethod.tsx`:
```typescript
const thailandBanks = [
  { code: 'SCB', name: 'ธนาคารไทยพาณิชย์', color: '#4c2c92' },
  // เพิ่มธนาคารใหม่
];
```

### เปลี่ยนสี Theme
แก้ไขใน CSS files:
```css
:root {
  --primary-color: #3498db;
  --success-color: #27ae60;
  --error-color: #e74c3c;
}
```

### เพิ่มวิธีการชำระเงิน
แก้ไขใน `PaymentMethod.tsx`:
```typescript
const paymentMethods = [
  // เพิ่มวิธีการใหม่
  {
    id: 'shopee_pay',
    name: 'ShopeePay',
    icon: '🛒',
    description: 'ชำระผ่าน ShopeePay'
  }
];
```

## Security Considerations

1. **ห้ามส่งข้อมูลบัตรเครดิตผ่าน frontend**
2. **ใช้ HTTPS เสมอ**
3. **Validate ข้อมูลใน backend**
4. **Log ทุก transaction**
5. **Rate limiting สำหรับ API calls**

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

MIT License
