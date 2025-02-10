import React from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

interface SidebarTriggerProps {
  collapsed: boolean;
  onClick: () => void;
}

const SidebarTrigger: React.FC<SidebarTriggerProps> = ({ collapsed, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="h-14 w-14 flex items-center justify-center cursor-pointer hover:text-[#45b630] transition-colors"
    >
      {collapsed ? (
        <MenuUnfoldOutlined style={{ fontSize: '20px' }} />
      ) : (
        <MenuFoldOutlined style={{ fontSize: '20px' }} />
      )}
    </div>
  );
};

export default SidebarTrigger;