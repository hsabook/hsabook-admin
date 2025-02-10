import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  isCollapsed: boolean;
}

const Logo: React.FC<LogoProps> = ({ isCollapsed }) => {
  return (
    <Link to="/" className="block">
      <div className="h-20 px-6 flex items-center justify-center gap-3 border-b">
        <img
          src={'https://s3-website-r1.s3cloud.vn/hsa/2025-02-06/1738870934102.png'}
          alt="HSAbook Logo"
          className="h-12 w-auto"
        />
        <span className="text-2xl font-bold text-[#ee6501]">HSA Book</span>
      </div>
    </Link>
  );
};

export default Logo;
