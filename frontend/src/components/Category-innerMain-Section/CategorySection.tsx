import React from 'react';
import './Category-Section.css';

const CategorySection: React.FC = () => {
  const categories = [
    { icon: '💻', name: 'เทคโนโลยี', subtitle: 'ล่าสุด & น่าสนใจ' },
    { icon: '👕', name: 'แฟชั่น', subtitle: 'สไตล์ทันสมัย' },
    { icon: '🏠', name: 'บ้าน & สวน', subtitle: 'แต่งบ้านสวย' },
    { icon: '🎮', name: 'เกม & ของเล่น', subtitle: 'สนุกทุกวัย' },
    { icon: '💄', name: 'ความงาม', subtitle: 'ดูแลตัวเอง' },
    { icon: '⚽', name: 'กีฬา & ฟิตเนส', subtitle: 'แข็งแรงใสใส' },
    { icon: '🚗', name: 'ยานยนต์', subtitle: 'อะไหล่ & อุปกรณ์' },
    { icon: '🍕', name: 'อาหาร & เครื่องดื่ม', subtitle: 'สดใหม่ทุกวัน' },
    { icon: '📚', name: 'หนังสือ & การศึกษา', subtitle: 'เติมเต็มความรู้' },
    { icon: '🎵', name: 'เสียงเพลง', subtitle: 'บันเทิงใจ' },
    { icon: '👶', name: 'แม่และเด็ก', subtitle: 'ดูแลคนรัก' },
    { icon: '🐕', name: 'สัตว์เลี้ยง', subtitle: 'รักเพื่อนซี้' }
  ];

  return (
    <section className="category-section">
      <div className="container">
        <div className="category-header">
          <h2 className="category-title">🏷️ หมวดหมู่สินค้า</h2>
          <p className="category-subtitle">เลือกซื้อสินค้าตามความต้องการของคุณ</p>
        </div>

        <div className="categories-grid">
          {categories.map((c, i) => (
            <div key={i} className="category-card" onClick={() => console.log(`Clicked ${c.name}`)}>
              <div className="category-icon">{c.icon}</div>
              <div className="category-info">
                <h3 className="category-name">{c.name}</h3>
                <p className="category-subtitle-text">{c.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;