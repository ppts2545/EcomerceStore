
import { useState } from 'react';
import { Header } from './components/Header';
import { BannerHotword } from './components/Banner-Hotword';
import MainSection from './components/Main Section/MainSection';
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
      
      <MainSection >
        <h2>Featured Products</h2>
        <p>Check out our featured products below!</p>
      </MainSection>
    </>
  )
}

export default App
