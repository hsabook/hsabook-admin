import React from 'react';
import { 
  DashboardOutlined,
  BookOutlined,
  UserOutlined,
  InboxOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const iconStyle = { fontSize: '20px' };

export const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined style={iconStyle} />,
    label: 'Dashboard',
    path: '/',
  },
  {
    key: 'books',
    icon: <BookOutlined style={iconStyle} />,
    label: 'Quản lý sách',
    children: [
      { 
        key: 'books-list',
        label: 'Danh sách sách',
        path: '/books/list'
      },
      { 
        key: 'books-categories',
        label: 'Danh mục sách',
        path: '/books/categories'
      },
      { 
        key: 'books-ids',
        label: 'Quản lý ID',
        path: '/books/ids'
      },
    ],
  },
  {
    key: 'users',
    icon: <UserOutlined style={iconStyle} />,
    label: 'Quản lý user',
    path: '/users',
  },
  {
    key: 'warehouse',
    icon: <InboxOutlined style={iconStyle} />,
    label: 'Quản lý kho',
    children: [
      { 
        key: 'warehouse-questions',
        label: 'Quản lý câu hỏi',
        path: '/warehouse/questions'
      },
      { 
        key: 'warehouse-exams',
        label: 'Quản lý bộ đề',
        path: '/warehouse/exams'
      },
    ],
  },
  {
    key: 'settings',
    icon: <SettingOutlined style={iconStyle} />,
    label: 'Cấu hình',
    children: [
      { 
        key: 'settings-sliders',
        label: 'Sliders',
        path: '/settings/sliders'
      },
      { 
        key: 'settings-teachers',
        label: 'Giáo viên',
        path: '/settings/teachers'
      },
      { 
        key: 'settings-searches',
        label: 'Tìm kiếm gần đây',
        path: '/settings/recent-searches'
      },
    ],
  },
];