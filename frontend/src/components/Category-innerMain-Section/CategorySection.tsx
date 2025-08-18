import React, { useEffect, useRef, useState } from 'react';
import './Category-Section.css';

interface CategorySectionProps {
  onCategorySelect?: (category: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ onCategorySelect }) => {
  const categories = [
    { icon: '🌈', name: '', subtitle: 'ดูสินค้าทั้งหมด' }, // All
    { icon: '💻', name: 'เทคโนโลยี', subtitle: 'ล่าสุด & น่าสนใจ' },
    { icon: '🔌', name: 'อิเล็กทรอนิกส์', subtitle: 'เครื่องใช้ไฟฟ้า & แกดเจ็ต' },
    { icon: '🖱️', name: 'อุปกรณ์ไอที', subtitle: 'คอมพิวเตอร์ & อุปกรณ์เสริม' },
    { icon: '👗', name: 'แฟชั่น', subtitle: 'สไตล์ทันสมัย' },
    { icon: '💍', name: 'เครื่องประดับ', subtitle: 'นาฬิกา & จิวเวลรี่' },
    { icon: '🏠', name: 'บ้าน & สวน', subtitle: 'แต่งบ้านสวย' },
    { icon: '🛋️', name: 'เฟอร์นิเจอร์', subtitle: 'ของแต่งบ้าน' },
    { icon: '🎮', name: 'เกม & ของเล่น', subtitle: 'สนุกทุกวัย' },
    { icon: '📷', name: 'กล้อง', subtitle: 'ถ่ายภาพ & อุปกรณ์' },
    { icon: '💄', name: 'ความงาม', subtitle: 'ดูแลตัวเอง' },
    { icon: '🩺', name: 'สุขภาพ', subtitle: 'เวชภัณฑ์ & อาหารเสริม' },
    { icon: '⚽', name: 'กีฬา & ฟิตเนส', subtitle: 'แข็งแรงใสใส' },
    { icon: '🏋️', name: 'อุปกรณ์กีฬา', subtitle: 'ฟิตเนส & เอาท์ดอร์' },
    { icon: '🚗', name: 'ยานยนต์', subtitle: 'อะไหล่ & อุปกรณ์' },
    { icon: '🧳', name: 'ท่องเที่ยว', subtitle: 'กระเป๋า & อุปกรณ์เดินทาง' },
    { icon: '🍕', name: 'อาหาร & เครื่องดื่ม', subtitle: 'สดใหม่ทุกวัน' },
    { icon: '💊', name: 'อาหารเสริม', subtitle: 'สุขภาพดีทุกวัน' },
    { icon: '📚', name: 'หนังสือ & การศึกษา', subtitle: 'เติมเต็มความรู้' },
    { icon: '✏️', name: 'เครื่องเขียน', subtitle: 'อุปกรณ์สำนักงาน' },
    { icon: '🎁', name: 'ของขวัญ', subtitle: 'งานฝีมือ & DIY' },
    { icon: '🎵', name: 'เสียงเพลง', subtitle: 'บันเทิงใจ' },
    { icon: '👶', name: 'แม่และเด็ก', subtitle: 'ดูแลคนรัก' },
    { icon: '🐕', name: 'สัตว์เลี้ยง', subtitle: 'รักเพื่อนซี้' },
    { icon: '✨', name: 'อื่นๆ', subtitle: 'หมวดหมู่พิเศษ' }
  ];

  const stripRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const refreshArrows = () => {
    const el = stripRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  const scrollByStep = (dir: 1 | -1) => {
    const el = stripRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.9, 400); // เลื่อนทีละเกือบเต็ม viewport
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    refreshArrows();
    const onScroll = () => refreshArrows();
    const onResize = () => refreshArrows();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section className="category-section">
      <div className="container">
        <div className="category-header">
          <div>
            <h2 className="category-title">🏷️ หมวดหมู่สินค้า</h2>
            <p className="category-subtitle">เลือกซื้อสินค้าตามความต้องการของคุณ</p>
          </div>
          <div className="nav-buttons">
            <button
              className="nav-btn prev"
              aria-label="เลื่อนซ้าย"
              onClick={() => scrollByStep(-1)}
              disabled={!canLeft}
            >
              ‹
            </button>
            <button
              className="nav-btn next"
              aria-label="เลื่อนขวา"
              onClick={() => scrollByStep(1)}
              disabled={!canRight}
            >
              ›
            </button>
          </div>
        </div>

        <div className="categories-viewport">
          <div className="edge left" data-show={canLeft} />
          <div className="edge right" data-show={canRight} />
          <div className="categories-strip" ref={stripRef}>
            {categories.map((c, i) => (
              <button
                key={i}
                className={`category-card${c.name === '' ? ' all' : ''}`}
                onClick={() => onCategorySelect?.(c.name)}
                type="button"
              >
                <div className="cat-icon">{c.icon}</div>
                <div className="cat-text">
                  <div className="cat-name">{c.name === '' ? 'ทั้งหมด' : c.name}</div>
                  <div className="cat-sub">{c.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;