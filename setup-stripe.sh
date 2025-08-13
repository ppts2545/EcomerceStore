#!/bin/bash
# setup-stripe.sh - Script สำหรับตั้งค่า Stripe

echo "🚀 Stripe Setup Script"
echo "======================="

# Check if running in production
if [ "$1" = "prod" ]; then
    echo "⚠️  PRODUCTION MODE - ใช้เงินจริง!"
    echo "📝 คุณต้องมี:"
    echo "   1. Stripe Account ที่ยืนยันแล้ว"
    echo "   2. บัญชีธนาคารที่เชื่อมโยงแล้ว"
    echo "   3. Live API Keys จาก Stripe Dashboard"
    echo ""
    
    read -p "คุณมีข้อมูลครบแล้วใช่มั้ย? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "❌ กรุณาตั้งค่า Stripe Account ก่อน"
        exit 1
    fi
    
    echo "📝 กรุณากรอกข้อมูล Stripe Live Keys:"
    read -p "Secret Key (sk_live_...): " SECRET_KEY
    read -p "Publishable Key (pk_live_...): " PUBLISHABLE_KEY  
    read -p "Webhook Secret (whsec_...): " WEBHOOK_SECRET
    
    # Update production properties
    sed -i.bak "s/stripe.api.key=.*/stripe.api.key=${SECRET_KEY}/" backend/src/main/resources/application-prod.properties
    sed -i.bak "s/stripe.publishable.key=.*/stripe.publishable.key=${PUBLISHABLE_KEY}/" backend/src/main/resources/application-prod.properties
    sed -i.bak "s/stripe.webhook.secret=.*/stripe.webhook.secret=${WEBHOOK_SECRET}/" backend/src/main/resources/application-prod.properties
    
    echo "✅ Production keys ตั้งค่าเรียบร้อย"
    
else
    echo "🧪 TEST MODE - ใช้เงินทดสอบ"
    echo "📝 คุณสามารถใช้ Test Keys จาก Stripe Dashboard"
    echo ""
    
    read -p "Secret Key (sk_test_...): " SECRET_KEY
    read -p "Publishable Key (pk_test_...): " PUBLISHABLE_KEY
    read -p "Webhook Secret (whsec_...): " WEBHOOK_SECRET
    
    # Update development properties  
    sed -i.bak "s/stripe.api.key=.*/stripe.api.key=${SECRET_KEY}/" backend/src/main/resources/application.properties
    sed -i.bak "s/stripe.publishable.key=.*/stripe.publishable.key=${PUBLISHABLE_KEY}/" backend/src/main/resources/application.properties
    sed -i.bak "s/stripe.webhook.secret=.*/stripe.webhook.secret=${WEBHOOK_SECRET}/" backend/src/main/resources/application.properties
    
    echo "✅ Test keys ตั้งค่าเรียบร้อย"
fi

echo ""
echo "🎯 ขั้นตอนถัดไป:"
echo "1. รีสตาร์ทเซิร์ฟเวอร์ Backend"
echo "2. ทดสอบการชำระเงิน"
echo "3. ตรวจสอบ Stripe Dashboard"
echo ""
echo "💡 ทดสอบด้วย Test Card: 4242424242424242"
echo "📚 อ่านคู่มือใน STRIPE_SETUP_GUIDE.md"
