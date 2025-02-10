import React, { useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { menuItems } from './menuConfig';
import Logo from './Logo';
import SidebarTrigger from './SidebarTrigger';
import './styles.css';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openKeys, setOpenKeys] = React.useState<string[]>([]);

  // Initialize open keys on mount
  useEffect(() => {
    const defaultOpenKeys = menuItems
      .filter(item => item.children)
      .map(item => item.key as string);
    setOpenKeys(defaultOpenKeys);
  }, []);

  const onMenuClick = ({ key }: { key: string }) => {
    const targetMenuItem = findMenuItemByKey(key);
    if (targetMenuItem?.path) {
      navigate(targetMenuItem.path);
    }
  };

  const findMenuItemByKey = (key: string) => {
    for (const item of menuItems) {
      if (item.key === key) return item;
      if (item.children) {
        const child = item.children.find(c => c.key === key);
        if (child) return child;
      }
    }
    return null;
  };

  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const selectedKeys = React.useMemo(() => {
    const currentPath = location.pathname;
    for (const item of menuItems) {
      if (item.path === currentPath) return [item.key as string];
      if (item.children) {
        const child = item.children.find(c => c.path === currentPath);
        if (child) return [child.key as string];
      }
    }
    return [];
  }, [location.pathname]);

  return (
    <Sider
      width={280}
      collapsedWidth={80}
      collapsed={collapsed}
      style={{
        overflow: 'hidden',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
      theme="light"
      trigger={null}
    >
      <div className="flex flex-col h-full">
        <Logo isCollapsed={collapsed} />
        
        <div className="flex-1 overflow-y-auto">
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            items={menuItems}
            onClick={onMenuClick}
            style={{ 
              borderRight: 0,
              fontSize: '15px',
            }}
          />
        </div>

        <div className="flex justify-end border-t">
          <SidebarTrigger 
            collapsed={collapsed} 
            onClick={() => onCollapse(!collapsed)} 
          />
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;