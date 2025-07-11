
import { useState } from 'react';
import { Header } from './components/Header';
import './App.css'

function App() {
  const [cartCount] = useState(3); // ตัวอย่างจำนวนสินค้าในตะกร้า

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // ที่นี่คุณสามารถเชื่อมต่อกับ API เพื่อค้นหาสินค้า
  };

  return (
    <>
      <Header 
        onSearch={handleSearch}
        cartCount={cartCount}
      />
      
      {/* ส่วนเนื้อหาหลักของเว็บไซต์จะอยู่ที่นี่ */}
      <main style={{ minHeight: '80vh', padding: '20px', textAlign: 'center' }}>
        <h1>🛍️ Welcome to Shopee Clone</h1>
        <p>This is your e-commerce store homepage!</p>
      </main>
    </>
  )
}

export default App
