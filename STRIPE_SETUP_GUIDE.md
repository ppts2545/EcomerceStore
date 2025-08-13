# 🚀 Stripe Payment Setup Guide - ระบบชำระเงินจริง

## 📋 **ขั้นตอนการตั้งค่า Stripe**

### 1. **สร้าง Stripe Account**
1. ไปที่ https://stripe.com
2. คลิก "Start now" หรือ "Sign up"
3. กรอกข้อมูลธุรกิจของคุณ
4. ยืนยันอีเมล์และเบอร์โทร

### 2. **เก็บ API Keys**
หลังจากลงทะเบียนแล้ว:
1. ไปที่ Dashboard → Developers → API keys
2. คัดลอก:
   - **Publishable key** (pk_test_... หรือ pk_live_...)
   - **Secret key** (sk_test_... หรือ sk_live_...)

### 3. **ตั้งค่า Webhook**
1. ไปที่ Dashboard → Developers → Webhooks
2. คลิก "Add endpoint"
3. URL: `https://yourdomain.com/api/payments/webhook`
4. เลือก Events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
5. คัดลอก **Webhook secret** (whsec_...)

### 4. **ยืนยันบัญชีธนาคาร (สำคัญ!)**
เพื่อรับเงินจริง คุณต้อง:
1. ไปที่ Dashboard → Settings → Payouts
2. เพิ่มบัญชีธนาคารของคุณ
3. อัพโหลดเอกสารยืนยันตัวตน
4. รอการอนุมัติจาก Stripe (1-7 วัน)

### 5. **การตั้งค่าใน Application**
อัพเดทไฟล์ `application.properties`:

```properties
# Stripe Configuration (LIVE MODE)
stripe.api.key=sk_live_your_actual_secret_key
stripe.publishable.key=pk_live_your_actual_publishable_key  
stripe.webhook.secret=whsec_your_actual_webhook_secret
```

## 💰 **วิธีการรับเงิน**

### **Test Mode vs Live Mode**
- **Test Mode**: เงินไม่จริง (sk_test_... / pk_test_...)
- **Live Mode**: เงินจริง (sk_live_... / pk_live_...)

### **การโอนเงิน**
- Stripe จะโอนเงินให้อัตโนมัติทุกวันจันทร์
- หรือตั้งค่าเป็นรายวัน (หลังผ่านการตรวจสอบ)
- ค่าธรรมเนียม: 3.25% + ฿10 ต่อรายการ

### **การติดตาม**
- Dashboard → Payments: ดูรายการขาย
- Dashboard → Payouts: ดูเงินที่โอนมา

## 🔧 **การทดสอบ**

### **Test Cards (ใช้ใน Test Mode)**
- Success: `4242424242424242`
- Decline: `4000000000000002`
- 3D Secure: `4000000000003220`

### **การทดสอบ Webhook**
```bash
# ใช้ Stripe CLI
stripe listen --forward-to localhost:8082/api/payments/webhook
```

## 🚨 **ข้อควรระวัง**

1. **ไม่เผย Secret Key** - เก็บใน environment variables
2. **ใช้ HTTPS** ในการผลิต
3. **ตรวจสอบ Webhook signature** เสมอ
4. **เก็บ log** การทำรายการทั้งหมด
5. **ทดสอบใน Test Mode** ก่อนเปิดใช้จริง

## 📞 **การติดต่อ Stripe**
- Support: https://support.stripe.com
- Documentation: https://stripe.com/docs
- Thailand: support@stripe.com

---
**หมายเหตุ**: การตั้งค่าบัญชีธนาคารและการยืนยันตัวตนจำเป็นสำหรับการรับเงินจริง!
