# 🎯 ขั้นตอนการหา Publishable Key สำหรับ Stripe

## 📝 วิธีหา Publishable Key:

1. ไปที่ https://dashboard.stripe.com
2. ล็อกอินเข้า Stripe account ของคุณ
3. ไปที่ **Developers** → **API keys**
4. หา **Publishable key** (ขึ้นต้นด้วย `pk_test_`)
5. คลิก "Reveal test key" และคัดลอก

## ⚡ Publishable Key มีหน้าตาแบบนี้:
```
STRIPE_PUBLISHABLE_KEY
```

## 🔧 หลังจากได้ Publishable Key แล้ว:
ให้คัดลอกมาแปะในแชทนี้ ฉันจะอัพเดทให้

## 🧪 การทดสอบ:
หลังจากตั้งค่าเสร็จแล้ว คุณสามารถทดสอบด้วย:
- Test Card: `4242424242424242`
- CVV: `123`
- วันหมดอายุ: เดือน/ปีในอนาคต
- ZIP: `12345`

## 💡 หมายเหตุ:
- Test keys ใช้เงินทดสอบ (ไม่ใช่เงินจริง)
- Live keys ใช้เงินจริง (ต้องยืนยันบัญชีธนาคาร)
