import React from 'react';
import './Category-Section.css';

type CategorySectionProps = {
  onClick?: () => void;
};  

const CategorySection: React.FC<CategorySectionProps> = () => {
  const categories = [
    { icon: '🏠', name: 'โฮม', color: '#ff6b6b' },
    { icon: '🛒', name: 'ช้อปปิ้งมอลล์', color: '#4ecdc4' },
    { icon: '🏪', name: 'ซูเปอร์มาเก็ต', color: '#45b7d1' },
    { icon: '💊', name: 'ป้ายยา', color: '#96ceb4' },
    { icon: '🚚', name: 'ส่งฟรี', color: '#ffeaa7' },
    { icon: '✅', name: 'ถูกชัวร์', color: '#74b9ff' },
    { icon: '📱', name: 'อิเล็กทรอนิกส์', color: '#fd79a8' },
    { icon: '🏭', name: 'สินค้าราคาโรงงาน', color: '#fdcb6e' },
  ];

  return (
    <div className="category-section">
      <div className="container">
        <h2 className="category-title">หมวดหมู่</h2>
        <div className="category-grid">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="category-item"
              style={{ borderTop: `3px solid ${category.color}` }}
            >
              <div className="category-icon" style={{ color: category.color }}>
                {category.icon}
              </div>
              <span className="category-name">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySection;