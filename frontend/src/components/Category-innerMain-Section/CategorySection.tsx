import React from 'react';
import './Category-Section.css';

interface CategorySectionProps {
  onClick?: () => void;
}

const CategorySection: React.FC<CategorySectionProps> = () => {
  const categories = [
    { icon: '💻', name: 'เทคโนโลยี', subtitle: 'ล่าสุด & น่าสนใจ', color: 'tech' },
    { icon: '👕', name: 'แฟชั่น', subtitle: 'สไตล์ทันสมัย', color: 'fashion' },
    { icon: '🏠', name: 'บ้าน & สวน', subtitle: 'แต่งบ้านสวย', color: 'home' },
    { icon: '🎮', name: 'เกม & ของเล่น', subtitle: 'สนุกทุกวัย', color: 'gaming' },
    { icon: '💄', name: 'ความงาม', subtitle: 'ดูแลตัวเอง', color: 'beauty' },
    { icon: '⚽', name: 'กีฬา & ฟิตเนส', subtitle: 'แข็งแรงใสใส', color: 'sports' },
    { icon: '🚗', name: 'ยานยนต์', subtitle: 'อะไหล่ & อุปกรณ์', color: 'automotive' },
    { icon: '🍕', name: 'อาหาร & เครื่องดื่ม', subtitle: 'สดใหม่ทุกวัน', color: 'food' },
    { icon: '📚', name: 'หนังสือ & การศึกษา', subtitle: 'เติมเต็มความรู้', color: 'education' },
    { icon: '🎵', name: 'เสียงเพลง', subtitle: 'บันเทิงใจ', color: 'music' },
    { icon: '👶', name: 'แม่และเด็ก', subtitle: 'ดูแลคนรัก', color: 'baby' },
    { icon: '🐕', name: 'สัตว์เลี้ยง', subtitle: 'รักเพื่อนซี้', color: 'pet' }
  ];

  return (
    <section className="category-section">
      <div className="container">
        <div className="category-header">
          <h2 className="category-title">
            <span className="title-icon">🏷️</span>
            หมวดหมู่สินค้า
          </h2>
          <p className="category-subtitle">เลือกซื้อสินค้าตามความต้องการของคุณ</p>
        </div>

        <div className="categories-grid">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className={`category-card ${category.color}`}
              onClick={() => console.log(`Clicked on ${category.name}`)}
            >
              <div className="category-icon">
                {category.icon}
              </div>
              <div className="category-info">
                <h3 className="category-name">{category.name}</h3>
                <p className="category-subtitle-text">{category.subtitle}</p>
              </div>
              <div className="category-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="featured-categories">
          <h3 className="featured-title">หมวดหมู่แนะนำ</h3>
          <div className="featured-grid">
            <div className="featured-card tech-featured">
              <div className="featured-content">
                <span className="featured-icon">💻</span>
                <div>
                  <h4>เทคโนโลยีล่าสุด</h4>
                  <p>สมาร์ทโฟน • แล็ปท็อป • แกดเจ็ต</p>
                </div>
              </div>
              <div className="featured-badge">ลด 30%</div>
            </div>
            
            <div className="featured-card fashion-featured">
              <div className="featured-content">
                <span className="featured-icon">👕</span>
                <div>
                  <h4>แฟชั่นทันสมัย</h4>
                  <p>เสื้อผ้า • รองเท้า • กระเป๋า</p>
                </div>
              </div>
              <div className="featured-badge">ใหม่</div>
            </div>
            
            <div className="featured-card home-featured">
              <div className="featured-content">
                <span className="featured-icon">🏠</span>
                <div>
                  <h4>บ้านและสวน</h4>
                  <p>เฟอร์นิเจอร์ • ของแต่งบ้าน</p>
                </div>
              </div>
              <div className="featured-badge">Hot</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;