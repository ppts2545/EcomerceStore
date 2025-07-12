import React from 'react';
import './MainSection.css';

type MainSectionProps = {
  children?: React.ReactNode;
};

const MainSection: React.FC<MainSectionProps> = ({ children }) => {
  return (
    <div className='main-section-container'>
      {children}
    </div>
  );
};

export default MainSection;