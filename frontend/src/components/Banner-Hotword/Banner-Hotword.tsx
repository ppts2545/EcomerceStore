import React, { useState, useEffect } from 'react';
import './Banner-Hotword.css';

const BannerHotword: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 🖼️ Shopee-style banner images
  const bannerImages = [
    {
      url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=300&fit=crop',
      alt: 'Flash Sale สุดคุ้ม ลดสูงสุด 90%',
      link: '#flash-sale',
      badge: 'FLASH SALE'
    },
    {
      url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=300&fit=crop',
      alt: 'Super Sale เครื่องใช้ไฟฟ้า', 
      link: '#electronics',
      badge: 'SUPER SALE'
    },
    {
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=300&fit=crop',
      alt: 'ซื้อ 1 แถม 1 ทุกรายการ',
      link: '#promotion',
      badge: 'BUY 1 GET 1'
    },
    {
      url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=300&fit=crop',
      alt: 'เก็บเงินปลายทาง ส่งฟรี',
      link: '#cod-free',
      badge: 'ส่งฟรี'
    },
    {
      url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=300&fit=crop',
      alt: 'ความงาม สุขภาพ ลดราคา',
      link: '#beauty',
      badge: 'MEGA SALE'
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
    <div style={{ 
      backgroundColor: '#f5f5f5',
      padding: '20px 0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px'
      }}>
        
        {/* Main Banner Carousel - Shopee Style */}
        <div style={{
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          height: '235px',
          backgroundColor: 'white'
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
                <a href={banner.link} style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}>
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
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjIzNSIgdmlld0JveD0iMCAwIDgwMCAyMzUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iMjM1IiBmaWxsPSIjZWU0ZDJkIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMTMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GbGFzaCBTYWxlPC90ZXh0Pgo8L3N2Zz4=';
                    }}
                  />
                  
                  {/* Badge Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    backgroundColor: '#ee4d2d',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(238, 77, 45, 0.3)'
                  }}>
                    {banner.badge}
                  </div>
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
              backgroundColor: 'rgba(255,255,255,0.8)',
              color: '#333',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              fontSize: '16px',
              zIndex: 10,
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)')}
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
              backgroundColor: 'rgba(255,255,255,0.8)',
              color: '#333',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              fontSize: '16px',
              zIndex: 10,
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)')}
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
            gap: '6px',
            zIndex: 10
          }}>
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: currentSlide === index ? '#ee4d2d' : 'rgba(255,255,255,0.6)',
                  transition: 'all 0.2s ease',
                  transform: currentSlide === index ? 'scale(1.3)' : 'scale(1)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Side Panel - Shopee Style */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Mini Banners */}
          {[
            { title: 'Shopee Mall', subtitle: 'ของแท้ 100%', bg: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)' },
            { title: 'ส่งฟรี ฟรี', subtitle: 'ทั่วไทย', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
          ].map((item, index) => (
            <div key={index} style={{
              background: item.bg,
              borderRadius: '6px',
              padding: '16px',
              color: 'white',
              height: '110px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            >
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                {item.subtitle}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flash Sale Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '20px auto 0',
        padding: '0 20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #f0f0f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '15px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #ee4d2d 0%, #ff6533 100%)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                ⚡ FLASH SALE
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#333'
              }}>
                <span style={{ fontSize: '14px' }}>🕐 เหลือเวลา</span>
                <div style={{
                  display: 'flex',
                  gap: '4px'
                }}>
                  {['02', '15', '43'].map((time, i) => (
                    <div key={i} style={{
                      backgroundColor: '#333',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      minWidth: '32px',
                      textAlign: 'center'
                    }}>
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <a href="#flash-sale" style={{
              color: '#ee4d2d',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ดูทั้งหมด ›
            </a>
          </div>
          
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '14px'
          }}>
            💥 Flash Sale ทุกวัน เวลา 09:00, 12:00, 15:00, 18:00, 21:00
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerHotword;