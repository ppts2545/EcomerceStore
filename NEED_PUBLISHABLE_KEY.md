# 🔍 ตามหา Publishable Key สำหรับ Stripe Account ของคุณ


## Secret Key ที่คุณมี:
<YOUR_STRIPE_KEY_VIA_ENV>
```
[REMOVED]
```


## Publishable Key ควรมีหน้าตาแบบนี้:
<YOUR_STRIPE_KEY_VIA_ENV>
```
[REMOVED]
```

## 🎯 วิธีหา Publishable Key:

### ทางที่ 1: ใน Stripe Dashboard
1. ไป https://dashboard.stripe.com
2. เข้าสู่ระบบ
3. คลิก **Developers** (แถบซ้าย)
4. คลิก **API keys**
5. จะเห็น 2 keys:
   - ✅ **Secret key** (sk_test_...) - [REMOVED]
   - 🔍 **Publishable key** (pk_test_...) - [REMOVED]

### ทางที่ 2: ใช้ Stripe CLI
```bash
stripe login
stripe keys list
```

### ทางที่ 3: ตรวจสอบ Account ของคุณ
Account ID ของคุณคือ: `acct_1RvUSQA1BSnPghSQ`
Publishable Key น่าจะเป็น: `<YOUR_STRIPE_KEY_VIA_ENV>`

## 🚨 สิ่งที่ต้องทำ:
1. เข้า Dashboard
2. หา Publishable key ใน API keys section  
3. คัดลอกมาส่งให้ฉัน
4. ฉันจะอัพเดทในระบบให้

## 💡 หมายเหตุ:
- Secret key ใช้ในเซิร์ฟเวอร์ (Backend)
- Publishable key ใช้ในเว็บไซต์ (Frontend)
- ต้องมีทั้ง 2 keys จึงจะทำงานได้
