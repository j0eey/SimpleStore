import React, { createContext, useContext, useState, useRef } from 'react';

interface FlyingCartContextType {
  triggerFlyingAnimation: (startPosition: {x: number, y: number, width: number, height: number}, productImage: string) => void;
  flyingAnimationData: {
    isVisible: boolean;
    startPosition: {x: number, y: number, width: number, height: number} | null;
    productImage: string;
  };
}

const FlyingCartContext = createContext<FlyingCartContextType | undefined>(undefined);

export const FlyingCartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [flyingAnimationData, setFlyingAnimationData] = useState<{
    isVisible: boolean;
    startPosition: {x: number, y: number, width: number, height: number} | null;
    productImage: string;
  }>({
    isVisible: false,
    startPosition: null,
    productImage: '',
  });

  const triggerFlyingAnimation = (
    startPosition: {x: number, y: number, width: number, height: number},
    productImage: string
  ) => {
    setFlyingAnimationData({
      isVisible: true,
      startPosition,
      productImage,
    });

    setTimeout(() => {
      setFlyingAnimationData(prev => ({ ...prev, isVisible: false }));
    }, 1200);
  };

  return (
    <FlyingCartContext.Provider value={{ triggerFlyingAnimation, flyingAnimationData }}>
      {children}
    </FlyingCartContext.Provider>
  );
};

export const useFlyingCart = () => {
  const context = useContext(FlyingCartContext);
  if (!context) {
    throw new Error('useFlyingCart must be used within FlyingCartProvider');
  }
  return context;
};