import React, { useState, useEffect } from 'react';
import './Banner-Hotword.css';

export interface BannerHotwordProps {
  banners?: Array<{
    id: number;
    image: string;
    alt: string;
    link: string;
  }>;
  hotwords?: string[];
  onHotwordClick?: (keyword: string) => void;
}

const BannerHotword: React.FC<BannerHotwordProps> = ({ 
  banners = [],
  hotwords = ['iPhone 15', 'MacBook Pro', 'AirPods', 'Samsung Galaxy', 'Nike Air Max'],
  onHotwordClick 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sample banners if none provided
  const defaultBanners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=300&fit=crop',
      alt: 'iPhone 15 Sale',
      link: '#'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=300&fit=crop',
      alt: 'MacBook Sale',
      link: '#'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=300&fit=crop',
      alt: 'Nike Sale',
      link: '#'
    }
  ];

  const displayBanners = banners.length > 0 ? banners : defaultBanners;

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [displayBanners.length]);

  return (
    <div className='section-banner-hotword'>
      <div className='container'>
        <div className='adds-hotword'>
          {/* Banner Carousel */}
          <div className='adds-hotword-slide'>
            <div className='stardust-carousel'>
              <div className='stardust-carousel_item-list-wrapper' style={{ paddingTop: '29.5003%' }}>
                {/* Slide Image Advertise */}
                <ul className='stardust-carousel_item-list' 
                    style={{ 
                      width: `${displayBanners.length * 100}%`, 
                      transform: `translateX(-${(currentSlide * 100) / displayBanners.length}%)`,
                      transition: 'transform 0.5s ease'
                    }}>
                  {displayBanners.map((banner) => (
                    <li key={banner.id} 
                        className='stardust-carousel_item' 
                        style={{ width: `${100 / displayBanners.length}%` }}>
                      <div className='stardust-carousel_item-inner-wrapper'>
                        <a className='stardust-carousel_item-inner-link' href={banner.link}>
                          <div className='stardust-carousel_item-inner-link-image_container'>
                            <img 
                              className='stardust-carousel_item-inner-link-image' 
                              src={banner.image} 
                              alt={banner.alt} 
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }} 
                            />
                          </div>
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Carousel indicators */}
              <div className="carousel-indicators">
                {displayBanners.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${currentSlide === index ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Hotwords/Categories Panel */}
          <div className='adds-hotword-images'>
            <div className="hotwords-panel">
              <h3 className="hotwords-title">🔥 คำค้นยอดนิยม</h3>
              <div className="hotwords-list">
                {hotwords.map((keyword, index) => (
                  <button
                    key={index}
                    className="hotword-btn"
                    onClick={() => onHotwordClick?.(keyword)}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
              
              <div className="quick-categories">
                <h4 className="categories-title">หมวดหมู่ยอดนิยม</h4>
                <div className="categories-grid">
                  <div className="category-item">📱 มือถือ</div>
                  <div className="category-item">💻 คอมพิวเตอร์</div>
                  <div className="category-item">👟 รองเท้า</div>
                  <div className="category-item">👕 เสื้อผ้า</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerHotword;