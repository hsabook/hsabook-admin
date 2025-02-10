import React, { useState } from 'react';
import { Layout, Dropdown, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppRoutes from '../routes';
import { useAuthStore } from '../store/authStore';

const { Content, Header } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items = [
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout hasSider>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 280,
        transition: 'margin-left 0.2s'
      }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center',
          height: 64,
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Dropdown menu={{ items }} placement="bottomRight">
            <Avatar 
              icon={<UserOutlined />} 
              style={{ 
                cursor: 'pointer',
                backgroundColor: '#45b630'
              }} 
            />
          </Dropdown>
        </Header>
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          minHeight: 280, 
          background: '#fff',
          borderRadius: 8,
        }}>
          <AppRoutes />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;