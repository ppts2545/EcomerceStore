import React, { useState, useEffect } from 'react';
import './Banner-Hotword.css';

const BannerHotword: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 🖼️ Sample banner images - ใช้ภาพตัวอย่างที่มีอยู่จริง
  const bannerImages = [
    {
      url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=300&fit=crop',
      alt: 'Fashion Sale Banner',
      link: '#fashion'
    },
    {
      url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=300&fit=crop',
      alt: 'Electronics Sale Banner', 
      link: '#electronics'
    },
    {
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=300&fit=crop',
      alt: 'Home & Garden Banner',
      link: '#home'
    },
    {
      url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=300&fit=crop',
      alt: 'Sports & Fitness Banner',
      link: '#sports'
    },
    {
      url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=300&fit=crop',
      alt: 'Beauty & Health Banner',
      link: '#beauty'
    }
  ];

  // ⏰ Auto slide every 4 seconds
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 4000);

    return () => clearInterval(slideInterval);
  }, [bannerImages.length]);

  // 👆 Manual slide navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  return (
    <div className='section-banner-hotword' style={{ 
      padding: '20px 0',
      backgroundColor: '#f5f5f5'
    }}>
      <div className='container' style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div className='banner-carousel' style={{
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          height: '300px'
        }}>
          
          {/* 🖼️ Slide Images */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden'
          }}>
            {bannerImages.map((banner, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: currentSlide === index ? 1 : 0,
                  transform: `translateX(${(index - currentSlide) * 100}%)`,
                  transition: 'all 0.5s ease-in-out'
                }}
              >
                <a href={banner.link} style={{ display: 'block', width: '100%', height: '100%' }}>
                  <img 
                    src={banner.url}
                    alt={banner.alt}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x300/ee4d2d/white?text=Sale+Banner';
                    }}
                  />
                </a>
              </div>
            ))}
          </div>

          {/* ⬅️➡️ Navigation Arrows */}
          <button 
            onClick={prevSlide}
            style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '18px',
              zIndex: 10,
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)')}
          >
            ‹
          </button>

          <button 
            onClick={nextSlide}
            style={{
              position: 'absolute',
              right: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '18px',
              zIndex: 10,
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)')}
          >
            ›
          </button>

          {/* 🔴 Slide Indicators */}
          <div style={{
            position: 'absolute',
            bottom: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 10
          }}>
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: currentSlide === index ? '#ee4d2d' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s ease',
                  transform: currentSlide === index ? 'scale(1.2)' : 'scale(1)'
                }}
              />
            ))}
          </div>

          {/* 📍 Slide Counter */}
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            zIndex: 10
          }}>
            {currentSlide + 1} / {bannerImages.length}
          </div>
        </div>

        {/* 🏷️ Promotional Text */}
        <div style={{
          textAlign: 'center',
          marginTop: '15px',
          color: '#666'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            🎉 <strong>Special Offers</strong> - Save up to 70% on selected items!
          </p>
        </div>
      </div>
    </div>
  );
};

export default BannerHotword;