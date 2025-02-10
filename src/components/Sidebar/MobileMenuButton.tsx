import React from 'react';
import { Menu } from 'lucide-react';

const MobileMenuButton: React.FC = () => {
  return (
    <div className="p-4 border-t md:hidden">
      <button className="w-full flex items-center justify-center text-gray-500 hover:text-orange-600 transition-colors">
        <Menu size={24} />
      </button>
    </div>
  );
};

export default MobileMenuButton;