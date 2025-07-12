
import { useState } from 'react';
import { Header } from './components/Header';
import { BannerHotword } from './components/Banner-Hotword';
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
      <BannerHotword />
      
    </>
  )
}

export default App
