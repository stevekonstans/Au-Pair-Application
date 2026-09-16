import React from 'react';

interface AnixiLogoProps {
  className?: string;
  size?: number;
}

export const AnixiLogo: React.FC<AnixiLogoProps> = ({ className = '', size = 48 }) => {
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 bg-[#436ebe] text-white font-black rounded-xl shadow-xs tracking-tight ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.round(size * 0.58)}px`,
        lineHeight: 1,
      }}
    >
      A
    </div>
  );
};


