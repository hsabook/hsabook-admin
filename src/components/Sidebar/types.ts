export interface SubItem {
  text: string;
  path: string;
}

export interface MenuItemProps {
  id: string;
  icon: React.ReactNode;
  text: string;
  path?: string;
  subItems?: SubItem[];
  isCollapsed: boolean;
}