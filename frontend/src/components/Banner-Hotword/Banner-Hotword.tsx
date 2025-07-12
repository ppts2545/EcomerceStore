import React, { useState, useEffect } from 'react';
import './Banner-Hotword.css';

export interface BannerHotwordProps {
  banners?: Array<{
    id: number;
    image: string;
    alt: string;
    link: string;
  }>;
  sideAds?: Array<{
    id: number;
    image: string;
    alt: string;
    link: string;
  }>;
}

const BannerHotword: React.FC<BannerHotwordProps> = ({ 
  banners = [],
  sideAds = []
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Default banners
  const defaultBanners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=235&fit=crop&crop=center',
      alt: 'iPhone 15 Flash Sale',
      link: '#iphone-sale'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=235&fit=crop&crop=center',
      alt: 'MacBook Pro Sale',
      link: '#macbook-sale'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=235&fit=crop&crop=center',
      alt: 'Nike Sneakers Sale',
      link: '#nike-sale'
    }
  ];

  // Default side ads
  const defaultSideAds = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=110&fit=crop',
      alt: 'Special Offer',
      link: '#special-offer'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&h=110&fit=crop',
      alt: 'New Arrivals',
      link: '#new-arrivals'
    }
  ];

  const displayBanners = banners.length > 0 ? banners : defaultBanners;
  const displaySideAds = sideAds.length > 0 ? sideAds : defaultSideAds;

  // Auto slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [displayBanners.length]);

  // Render main carousel
  const renderCarousel = () => (
    <div className="carousel-section">
      <div className="carousel-container">
        <ul className="carousel-slides" 
            style={{ 
              width: `${displayBanners.length * 100}%`, 
              transform: `translateX(-${(currentSlide * 100) / displayBanners.length}%)`,
              transition: 'transform 0.5s ease'
            }}>
          {displayBanners.map((banner) => (
            <li key={banner.id} 
                className="carousel-slide" 
                style={{ width: `${100 / displayBanners.length}%` }}>
              <a href={banner.link} className="slide-link">
                <img 
                  src={banner.image} 
                  alt={banner.alt} 
                  className="slide-image"
                />
              </a>
            </li>
          ))}
        </ul>
        
        {/* Carousel indicators */}
        <div className="carousel-indicators">
          {displayBanners.map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // Render side advertisements in flex column
  const renderSideAds = () => (
    <div className="side-ads">
      {displaySideAds.map((ad) => (
        <a key={ad.id} href={ad.link} className="side-ad-item">
          <img 
            src={ad.image} 
            alt={ad.alt}
            className="side-ad-image"
          />
        </a>
      ))}
    </div>
  );

  // Render the Shortcut under the banner
  const renderShortcut = () => {
    type shortcutItem = {
      id: number;
      label: string;
      link: string;
      image: string;
    };
    
    const shortcutItems: shortcutItem[] = [
      { id: 1, label: 'อิเล็กทรอนิกส์', link: '#', image: '/src/assets/images/icons/อิเล็กทรอนิกส์.png' },
      { id: 2, label: 'ซูเปอร์มาเก็ต', link: '#', image: '/src/assets/images/icons/ซูเปอร์มาเก็ต.png' },
      { id: 3, label: 'โฮม', link: '#', image: '/src/assets/images/icons/โฮม.png' },
      { id: 4, label: 'ถูกชัวร์', link: '#', image: '/src/assets/images/icons/ถูกชัวร์.png' },
      { id: 5, label: 'สินค้าราคาโรงงาน', link: '#', image: '/src/assets/images/icons/สินค้าราคาโรงงาน.png' },
      { id: 6, label: 'ช้อปปิ้งมอลล์', link: '#', image: '/src/assets/images/icons/ช้อปปิ้งมอลล์.png' },
      { id: 7, label: 'ป้ายยา', link: '#', image: '/src/assets/images/icons/ป้ายยา.png' },
      { id: 8, label: 'ส่งฟรี', link: '#', image: '/src/assets/images/icons/ส่งฟรี.png' }
    ];

    return (
      <div className="shortcuts-section">
        <div className="container">
          <div className="shortcuts-grid">
            {shortcutItems.map((item) => (
              <a key={item.id} href={item.link} className="shortcut-item">
                <div className='shortcut-item-container'>
                  <div className='shortcut-item-icon-container'>
                    <div 
                      className='shortcut-item-icon' 
                      style={{ 
                        backgroundImage: `url(${item.image})`, 
                        backgroundSize: 'contain', 
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                      }}
                    />
                  </div>
                  <div className='shortcut-item-label'>{item.label}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="banner-hotword-section">
      <div className="container">
        <div className="banner-hotword-wrapper">
          {/* Main carousel */}
          <div className="banner-carousel-area">
            {renderCarousel()}
          </div>
          
          {/* Side ads in flex column */}
          <div className="side-ads-area">
            {renderSideAds()}
          </div>
        </div>
      </div>
      
      {/* Shortcuts section */}
      {renderShortcut()}
    </section>
  );
};

export default BannerHotword;