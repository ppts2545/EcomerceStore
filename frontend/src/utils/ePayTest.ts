// ePay API Test Script
// ใช้สำหรับทดสอบและตรวจสอบ API format

const EPAY_BASE_URL = 'https://epay.tonow.net/689b6f2882c7bd60a6ef4bc6';

// Test 1: ทดสอบเรียก API โดยไม่ใส่ API Key
async function testBasicConnection() {
  console.log('🔍 Testing basic connection...');
  
  try {
    const response = await fetch(EPAY_BASE_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers));
    
    const text = await response.text();
    console.log('Response:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('JSON Response:', json);
    } catch {
      console.log('Response is not JSON');
    }
  } catch (error) {
    console.error('Connection error:', error);
  }
}

// Test 2: ทดสอบ POST เพื่อดู API endpoints ที่มี
async function testCreatePayment() {
  console.log('🔍 Testing payment creation...');
  
  const testPaymentData = {
    amount: 100,
    order_id: 'TEST_ORDER_001',
    description: 'Test payment',
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    return_url: 'http://localhost:5174/payment/success',
    cancel_url: 'http://localhost:5174/payment/cancel'
  };
  
  try {
    const response = await fetch(`${EPAY_BASE_URL}/api/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testPaymentData)
    });
    
    console.log('Payment Creation Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers));
    
    const text = await response.text();
    console.log('Response:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('JSON Response:', json);
    } catch {
      console.log('Response is not JSON');
    }
  } catch (error) {
    console.error('Payment creation error:', error);
  }
}

// Test 3: ทดสอบเส้นทางอื่นๆ ที่เป็นไปได้
async function testOtherEndpoints() {
  console.log('🔍 Testing other possible endpoints...');
  
  const endpoints = [
    '/',
    '/api',
    '/payment',
    '/create',
    '/status',
    '/webhook'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${EPAY_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log(`\n--- ${endpoint} ---`);
      console.log('Status:', response.status);
      
      if (response.status !== 404) {
        const text = await response.text();
        console.log('Response:', text.slice(0, 200));
      }
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error.message);
    }
  }
}

// รันการทดสอบ
export async function runEPayTests() {
  console.log('🚀 Starting ePay API Tests...\n');
  
  await testBasicConnection();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testCreatePayment();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testOtherEndpoints();
  
  console.log('\n✅ ePay API Tests Complete');
}

// ฟังก์ชันสำหรับทดสอบใน browser console
if (typeof window !== 'undefined') {
  (window as any).testEPay = runEPayTests;
  console.log('Use testEPay() in browser console to run tests');
}
