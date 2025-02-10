import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useMenuState } from '../../hooks/useMenuState';
import { cn } from '../../utils/cn';
import type { MenuItemProps } from './types';

const MenuItem: React.FC<MenuItemProps> = ({ 
  id,
  icon, 
  text, 
  path, 
  subItems, 
  isCollapsed 
}) => {
  const location = useLocation();
  const { selectedPath, setSelectedPath, toggleMenu, isMenuOpen } = useMenuState();
  const isOpen = isMenuOpen(id);
  
  // Check if current path matches this menu item or its subitems
  const isActive = React.useMemo(() => {
    if (path === location.pathname) return true;
    if (subItems?.some(item => location.pathname === item.path)) return true;
    return false;
  }, [location.pathname, path, subItems]);

  const handleClick = (e: React.MouseEvent) => {
    if (subItems) {
      e.preventDefault();
      toggleMenu(id);
    } else if (path) {
      setSelectedPath(path);
    }
  };

  const menuItemStyles = cn(
    'w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200',
    'hover:bg-[#45b630] hover:text-white',
    {
      'bg-[#45b630] text-white': isActive,
      'text-black': !isActive,
    }
  );

  const subItemStyles = (subPath: string) => cn(
    'block w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 font-medium',
    'hover:bg-[#45b630] hover:text-white',
    {
      'bg-[#45b630] text-white': location.pathname === subPath,
      'text-black': location.pathname !== subPath,
    }
  );

  const content = (
    <>
      <div className="mr-3">{icon}</div>
      {!isCollapsed && (
        <>
          <span className="flex-1 text-left font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            {text}
          </span>
          {subItems && (
            <ChevronDown
              className={cn('w-5 h-5 transition-transform duration-200', {
                'transform rotate-180': isOpen
              })}
            />
          )}
        </>
      )}
    </>
  );

  return (
    <div className="group">
      {path ? (
        <Link
          to={path}
          className={menuItemStyles}
          onClick={handleClick}
        >
          {content}
        </Link>
      ) : (
        <button
          className={menuItemStyles}
          onClick={handleClick}
        >
          {content}
        </button>
      )}
      
      <div 
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          {
            'max-h-0': !isOpen || isCollapsed,
            'max-h-[500px]': isOpen && !isCollapsed
          }
        )}
      >
        <div className="ml-12 mt-1 space-y-1">
          {subItems?.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={subItemStyles(item.path)}
              onClick={() => setSelectedPath(item.path)}
            >
              {item.text}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;