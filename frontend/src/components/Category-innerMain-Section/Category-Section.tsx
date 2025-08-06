import React from 'react';
import './Category-Section.css';

type CategorySectionProps = {
  onClick?: () => void;
};  

const CategorySection: React.FC<CategorySectionProps> = () => {
  const categories = [
    { icon: '🏠', name: 'Shopee Mall', subtitle: 'ของแท้ 100%', color: '#ee4d2d' },
    { icon: '�', name: 'เทคโนโลยี', subtitle: 'ลดสูงสุด 80%', color: '#4CAF50' },
    { icon: '👕', name: 'แฟชั่น', subtitle: 'สไตล์ใหม่', color: '#FF9800' },
    { icon: '�', name: 'บ้าน & สวน', subtitle: 'ปรับปรุงบ้าน', color: '#9C27B0' },
    { icon: '🎮', name: 'ของเล่น', subtitle: 'สนุกทุกวัย', color: '#2196F3' },
    { icon: '�', name: 'ความงาม', subtitle: 'ดูแลตัวเอง', color: '#E91E63' },
    { icon: '⚽', name: 'กีฬา', subtitle: 'อุปกรณ์กีฬา', color: '#FF5722' },
    { icon: '�', name: 'ยานยนต์', subtitle: 'อะไหล่รถ', color: '#607D8B' },
    { icon: '�', name: 'อาหาร', subtitle: 'ส่งถึงบ้าน', color: '#795548' },
    { icon: '📚', name: 'หนังสือ', subtitle: 'เพิ่มความรู้', color: '#3F51B5' }
  ];

  return (
    <div style={{ 
      backgroundColor: '#f5f5f5',
      padding: '20px 0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #f0f0f0'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: '500',
            color: '#333',
            textAlign: 'center'
          }}>
            หมวดหมู่
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '16px',
            justifyItems: 'center'
          }}>
            {categories.map((category, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  padding: '12px 8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  minHeight: '90px',
                  width: '100%',
                  maxWidth: '110px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Category Icon with Background */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: category.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  marginBottom: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {category.icon}
                </div>
                
                {/* Category Name */}
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#333',
                  lineHeight: '1.2',
                  marginBottom: '2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%'
                }}>
                  {category.name}
                </span>
                
                {/* Category Subtitle */}
                <span style={{
                  fontSize: '10px',
                  color: '#666',
                  lineHeight: '1.2',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%'
                }}>
                  {category.subtitle}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySection;