import React, { useState, useEffect } from 'react';
import { Layout, Dropdown, Avatar, Drawer, Form, Input, Button, Upload, message, Spin } from 'antd';
import { UserOutlined, LogoutOutlined, UploadOutlined, EditOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppRoutes from '../routes';
import { useAuthStore } from '../store/authStore';
import { updateUserProfile, changePassword } from '../api/users/userService';
import { uploadFile } from '../api/upload/uploadService';
import type { User } from '../api/users/types';
import type { UploadChangeParam, RcFile } from 'antd/es/upload';

const { Content, Header } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  const navigate = useNavigate();
  const { logout, userInfo, setUserInfo } = useAuthStore();

  // Set initial form values from user info
  useEffect(() => {
    if (userInfo) {
      setAvatarUrl(userInfo.avatar);
      form.setFieldsValue({
        full_name: userInfo.full_name,
        email: userInfo.email,
        phone_number: userInfo.phone_number,
        description: userInfo.description || '',
        username: userInfo.username,
      });
    }
  }, [form, userInfo]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showProfileDrawer = () => {
    setIsProfileDrawerOpen(true);
  };

  const handleProfileCancel = () => {
    setIsProfileDrawerOpen(false);
    form.resetFields();
    setAvatarUrl(userInfo?.avatar || null);
  };

  const handlePasswordCancel = () => {
    setIsPasswordModalOpen(false);
    passwordForm.resetFields();
  };

  const showPasswordModal = () => {
    setIsPasswordModalOpen(true);
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file: RcFile): Promise<boolean> => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }

    try {
      setUploadLoading(true);
      // Use uploadFile from uploadService to upload the file
      const url = await uploadFile(file);
      setAvatarUrl(url);
      message.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      message.error('Failed to upload avatar');
    } finally {
      setUploadLoading(false);
    }
    
    // Return false to prevent default upload behavior
    return false;
  };

  const handleProfileSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Include all fields needed for the API with exact email format
      const userData = {
        avatar: avatarUrl || "", // Use the uploaded avatar URL
        full_name: values.full_name,
        email: "admin@hsabook.vn ", // Include the trailing space as in curl command
        phone_number: userInfo?.phone_number || "",
        description: values.description || "",
        username: userInfo?.username || ""
      };
      
      const updatedUser = await updateUserProfile(userData);
      
      // Update user info in the store
      if (userInfo) {
        setUserInfo({
          ...userInfo,
          ...userData,
          avatar: avatarUrl // Ensure avatar is updated in the store
        });
      }
      
      message.success('Profile updated successfully');
      setIsProfileDrawerOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields();
      setLoading(true);
      
      await changePassword(values.old_password, values.new_password);
      message.success('Password changed successfully');
      setIsPasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />,
      onClick: showProfileDrawer,
    },
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
          <div className="flex items-center">
            {userInfo && (
              <span className="mr-3 text-gray-700">{userInfo.full_name}</span>
            )}
            <Dropdown menu={{ items }} placement="bottomRight">
              <Avatar 
                icon={<UserOutlined />} 
                src={userInfo?.avatar || undefined}
                style={{ 
                  cursor: 'pointer',
                  backgroundColor: '#45b630'
                }} 
              />
            </Dropdown>
          </div>
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

      {/* User Profile Drawer */}
      <Drawer
        title={
          <div className="flex justify-between items-center">
            <span>Thông tin</span>
            <Button 
              type="text" 
              onClick={handleProfileCancel}
              icon={<CloseOutlined />}
            />
          </div>
        }
        placement="right"
        onClose={handleProfileCancel}
        open={isProfileDrawerOpen}
        width={500}
        closable={false}
        footer={
          <div className="flex justify-end gap-2">
            <Button key="cancel" onClick={handleProfileCancel}>
              Hủy
            </Button>
            <Button key="submit" type="primary" onClick={handleProfileSubmit} loading={loading}>
              Lưu
            </Button>
          </div>
        }
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            initialValues={userInfo || {}}
          >
            {/* Profile Section */}
            <div className="mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                    {uploadLoading ? (
                      <LoadingOutlined style={{ fontSize: 48, color: '#45b630' }} />
                    ) : avatarUrl ? (
                      <img src={avatarUrl} alt="User avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0">
                    <Upload 
                      showUploadList={false}
                      beforeUpload={handleAvatarUpload}
                      accept="image/*"
                    >
                      <Button 
                        type="primary" 
                        shape="circle" 
                        size="small" 
                        icon={<UploadOutlined />} 
                        loading={uploadLoading}
                      />
                    </Upload>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium mb-4">Họ và tên</h3>
            <Form.Item
              name="full_name"
              rules={[{ required: true, message: 'Please input your full name' }]}
            >
              <Input placeholder="Người Quản Trị" />
            </Form.Item>

            <h3 className="text-lg font-medium mb-4">Email</h3>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email' },
              ]}
            >
              <Input placeholder="admin@hsabook.vn" disabled />
            </Form.Item>

            <h3 className="text-lg font-medium mb-4">Số điện thoại</h3>
            <Form.Item name="phone_number">
              <Input placeholder="0929862699" disabled />
            </Form.Item>

            <h3 className="text-lg font-medium mb-4">Giới thiệu</h3>
            <Form.Item name="description">
              <Input.TextArea rows={4} placeholder="Nhập mô tả về bản thân" />
            </Form.Item>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium mb-4">Tài khoản</h3>
              
              <h3 className="text-lg font-medium mb-4">Tên tài khoản</h3>
              <Form.Item name="username">
                <Input disabled placeholder="admin01" />
              </Form.Item>

              <Button 
                type="default" 
                onClick={showPasswordModal}
                className="mt-4"
              >
                Thay đổi mật khẩu
              </Button>
            </div>
          </Form>
        </Spin>
      </Drawer>

      {/* Change Password Drawer */}
      <Drawer
        title={
          <div className="flex justify-between items-center">
            <span>Thay đổi mật khẩu</span>
            <Button 
              type="text" 
              onClick={handlePasswordCancel}
              icon={<CloseOutlined />}
            />
          </div>
        }
        placement="right"
        onClose={handlePasswordCancel}
        open={isPasswordModalOpen}
        width={500}
        closable={false}
        footer={
          <div className="flex justify-end gap-2">
            <Button key="cancel" onClick={handlePasswordCancel}>
              Hủy
            </Button>
            <Button key="submit" type="primary" onClick={handlePasswordSubmit} loading={loading}>
              Lưu
            </Button>
          </div>
        }
      >
        <Form
          form={passwordForm}
          layout="vertical"
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="old_password"
            rules={[{ required: true, message: 'Please input your current password' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="new_password"
            rules={[
              { required: true, message: 'Please input your new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirm_password"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Drawer>
    </Layout>
  );
};

export default AdminLayout;