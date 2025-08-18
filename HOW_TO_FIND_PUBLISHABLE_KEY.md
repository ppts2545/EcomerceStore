# 🔑 วิธีหา Publishable Key ใน Stripe Dashboard

## ขั้นตอน:

1. **เข้า Stripe Dashboard**: https://dashboard.stripe.com
2. **ไปที่ API Keys**: Developers → API keys
3. **หา Publishable Key**: จะมี 2 keys ในหน้านี้

```
✅ Publishable key (เอาตัวนี้)
   STRIPE_PUBLISHABLE_KEY
   
✅ Secret key (คุณมีแล้ว)
   STRIPE_SECRET_KEY
```

4. **คลิก "Reveal test key"** ข้าง Publishable key
5. **คัดลอก** Publishable key ทั้งหมด

## 💡 หรือ...

ถ้าคุณอยู่ในหน้า Stripe Dashboard แล้ว:
- ดูในส่วน **API Keys**
- หา key ที่ขึ้นต้นด้วย `pk_test_`
- คัดลอกมาแปะในแชทนี้

## ตัวอย่าง Publishable Key:
```
STRIPE_PUBLISHABLE_KEY
```
