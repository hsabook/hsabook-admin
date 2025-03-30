import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Select, Button, Table, Tag, Space, Badge, Tooltip, Pagination, Avatar, message, Drawer, Form, Upload, Modal, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, LockOutlined, UnlockOutlined, EditOutlined, CloseOutlined, UserOutlined, UploadOutlined, LoadingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { getUsers, createUser, updateUserRole, updateUserStatus } from '../../api/users/userService';
import { uploadFile } from '../../api/upload/uploadService';
import type { User } from '../../api/users/types';
import type { RcFile } from 'antd/es/upload';

interface UserTableType {
  key: string;
  username: string;
  status: 'active' | 'inactive';
  email: string;
  type: string;
  role: string;
  last_login: string;
  avatar: string | null;
}

const userStatusOptions = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'blocked', label: 'Đã bị khóa' },
]

const userTypeOptions = [
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'user', label: 'Người dùng' },
]

const getTypeLabel = (value: string): string => {
  const option = userTypeOptions.find(opt => opt.value === value);
  return option?.label || value;
};

const UserManagement: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [userType, setUserType] = useState<string>('');
  const [userStatus, setUserStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserTableType[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  
  // Create user states
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState<boolean>(false);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createForm] = Form.useForm();
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Edit role modal states
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState<boolean>(false);
  const [editRoleLoading, setEditRoleLoading] = useState<boolean>(false);
  const [currentEditUser, setCurrentEditUser] = useState<{ id: string, username: string, role: string } | null>(null);
  const [editRoleForm] = Form.useForm();

  // Function to fetch users from API
  const fetchUsers = async (resetPage = false) => {
    try {
      setLoading(true);
      
      // Reset to page 1 if filters are changed
      if (resetPage) {
        setCurrentPage(1);
      }
      
      const pageToFetch = resetPage ? 1 : currentPage;
      
      // Prepare filters object
      const filters: {
        username?: string;
        role?: string;
        status?: string;
      } = {};
      
      // Add search filter (for username)
      if (searchText) {
        filters.username = searchText;
      }
      
      // Add role filter
      if (userType) {
        filters.role = userType;
      }
      
      // Add status filter
      if (userStatus) {
        filters.status = userStatus;
      }
      
      const response = await getUsers(pageToFetch, pageSize, filters);
      
      if (response.status_code === 200) {
        const users = response.data.data.map((user: User) => ({
          key: user.id,
          username: user.username || user.full_name,
          status: user.status,
          email: user.email,
          role: user.role,
          type: getTypeLabel(user.role),
          last_login: formatDate(user.last_login),
          avatar: user.avatar,
        }));
        
        setUserData(users);
        setTotalUsers(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to fetch users data');
    } finally {
      setLoading(false);
    }
  };

  // Format date function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  // Load users on component mount and when pagination changes
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchText, userType, userStatus]);

  // Handle refresh data
  const handleRefresh = () => {
    console.log('🔄 UserManagement handleRefresh: Refreshing data');
    // Reset filters
    setSearchText('');
    setUserType('');
    setUserStatus('');
    
    // Fetch data without filters
    fetchUsers();
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('🔍 UserManagement handleSearch value:', value);
    setSearchText(value);
  };

  // Handle search on Enter key
  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = (e.target as HTMLInputElement).value;
      setSearchText(value);
      // debouncedSearch.cancel();
      // fetchUsers(true);
    }
  };

  // Handle type filter change
  const handleTypeChange = (value: string) => {
    setUserType(value);
    console.log('📋 UserManagement handleTypeChange value:', value);
    // Apply type filter
    fetchUsers(true);
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setUserStatus(value);
    console.log('🚦 UserManagement handleStatusChange value:', value);
    // Apply status filter
    fetchUsers(true);
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

  // Handle add new user - open drawer
  const handleAddUser = () => {
    setIsCreateDrawerOpen(true);
    createForm.resetFields();
    // Set default password
    createForm.setFieldsValue({
      password: "matkhau@2025"
    });
    setAvatarUrl(null);
  };

  // Handle cancel user creation
  const handleCreateCancel = () => {
    setIsCreateDrawerOpen(false);
    createForm.resetFields();
    setAvatarUrl(null);
  };

  // Handle create user form submission
  const handleCreateUser = async () => {
    try {
      const values = await createForm.validateFields();
      setCreateLoading(true);
      
      const userData = {
        full_name: values.full_name,
        email: values.email,
        phone_number: values.phone_number,
        role: values.role,
        username: values.username,
        password: values.password,
        avatar: avatarUrl || ""
      };
      
      await createUser(userData);
      message.success('Tạo tài khoản thành công');
      setIsCreateDrawerOpen(false);
      fetchUsers(); // Refresh user list
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Display specific error message from API if available
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        message.error(errorData.message || 'Failed to create user');
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('Failed to create user');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle edit role button click
  const handleEditRole = (user: UserTableType) => {
    setCurrentEditUser({
      id: user.key,
      username: user.username,
      role: user.role
    });
    editRoleForm.setFieldsValue({
      role: user.role
    });
    setIsEditRoleModalOpen(true);
  };
  
  // Handle edit role modal cancel
  const handleEditRoleCancel = () => {
    setIsEditRoleModalOpen(false);
    setCurrentEditUser(null);
    editRoleForm.resetFields();
  };
  
  // Handle edit role form submission
  const handleEditRoleSubmit = async () => {
    if (!currentEditUser) return;
    
    try {
      const values = await editRoleForm.validateFields();
      setEditRoleLoading(true);
      
      await updateUserRole(currentEditUser.id, values.role);
      message.success('Cập nhật loại tài khoản thành công');
      
      // Close modal and refresh data
      setIsEditRoleModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      
      if (error.response && error.response.data) {
        message.error(error.response.data.message || 'Cập nhật loại tài khoản thất bại');
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('Cập nhật loại tài khoản thất bại');
      }
    } finally {
      setEditRoleLoading(false);
    }
  };

  // Table columns
  const columns: TableProps<UserTableType>['columns'] = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar) => <Avatar size={40} icon={avatar ? <img src={avatar} alt="User avatar" /> : <img src="https://placehold.co/40x40" alt="User avatar" />} />,
    },
    {
      title: 'Tên user',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'} className="rounded-full px-3 py-1">
          <Badge status={status === 'active' ? 'success' : 'error'} text={status} />
        </Tag>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type, record) => (
        <Tag color={record.role === 'admin' ? 'gold' : 'default'} className="rounded-full px-3 py-1">
          {type}
        </Tag>
      ),
    },
    {
      title: 'Lần cuối đăng nhập',
      dataIndex: 'last_login',
      key: 'last_login',
      sorter: (a, b) => {
        // Handle null values in sorting
        if (!a.last_login && !b.last_login) return 0;
        if (!a.last_login) return -1;
        if (!b.last_login) return 1;
        return a.last_login.localeCompare(b.last_login);
      },
      render: (last_login) => {
        // Check if last_login is null, empty, or contains the default timestamp (01/01/1970)
        if (!last_login || last_login.includes('01/01/1970')) {
          return 'Chưa đăng nhập';
        }
        return last_login;
      },
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title={`${record.status === 'active' ? 'Khóa' : 'Mở khóa'} tài khoản`}
            description={`Bạn có chắc chắn muốn ${record.status === 'active' ? 'khóa' : 'mở khóa'} tài khoản của ${record.username}?`}
            onConfirm={() => handleStatusUpdate(record)}
            okText="Đồng ý"
            cancelText="Hủy"
            placement="left"
            icon={<QuestionCircleOutlined style={{ color: record.status === 'active' ? '#ff4d4f' : '#52c41a' }} />}
          >
            <Button 
              type="text" 
              icon={record.status === 'active' ? <LockOutlined style={{ color: '#ff4d4f' }} /> : <UnlockOutlined style={{ color: '#52c41a' }} />}
            />
          </Popconfirm>
          <Tooltip title="Edit role">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditRole(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Handle pagination change
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
    console.log('📄 UserManagement handlePageChange page:', page, 'pageSize:', pageSize);
  };

  // Add new function to handle status update directly from Popconfirm
  const handleStatusUpdate = async (user: UserTableType) => {
    try {
      setLoading(true);
      // Set new status to the opposite of current status
      const newStatus = user.status === 'active' ? 'blocked' : 'active';
      
      await updateUserStatus(user.key, newStatus);
      message.success('Cập nhật trạng thái tài khoản thành công');
      
      // Refresh the user list
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      
      if (error.response && error.response.data) {
        message.error(error.response.data.message || 'Cập nhật trạng thái tài khoản thất bại');
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('Cập nhật trạng thái tài khoản thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold m-0">Users</h1>
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm">
              {totalUsers} users
            </span>
          </div>
        </div>
        
        {/* Filters and Actions */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm kiếm"
              allowClear
              onChange={handleSearch}
              onKeyDown={handleSearchEnter}
              className="w-56"
              value={searchText}
            />
            
            <Select
              placeholder="Type"
              allowClear
              onChange={handleTypeChange}
              className="w-36"
              options={userTypeOptions}
            />
            
            <Select
              placeholder="Trạng thái"
              allowClear
              onChange={handleStatusChange}
              className="w-36"
              options={userStatusOptions}
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
            >
              Làm mới
            </Button>
            
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddUser}
              className="bg-green-500"
            >
              Thêm user
            </Button>
          </div>
        </div>
        
        {/* Users Table */}
        <Table 
          columns={columns} 
          dataSource={userData} 
          pagination={false}
          rowKey="key"
          className="w-full"
          loading={loading}
        />
        
        {/* Pagination */}
        <div className="flex justify-end mt-4">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalUsers}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `${total} items`}
          />
        </div>
      </div>

      {/* Edit Role Modal */}
      <Modal
        title={`Cập nhật loại tài khoản: ${currentEditUser?.username || ''}`}
        open={isEditRoleModalOpen}
        onCancel={handleEditRoleCancel}
        footer={[
          <Button key="cancel" onClick={handleEditRoleCancel}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleEditRoleSubmit} 
            loading={editRoleLoading}
          >
            Cập nhật
          </Button>
        ]}
      >
        <Form
          form={editRoleForm}
          layout="vertical"
        >
          <Form.Item
            label="Loại tài khoản"
            name="role"
            rules={[{ required: true, message: 'Please select user type' }]}
          >
            <Select
              placeholder="Chọn loại tài khoản"
              options={userTypeOptions}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Create User Drawer */}
      <Drawer
        title={
          <div className="flex justify-between items-center">
            <span>Thêm mới thông tin</span>
            <Button 
              type="text" 
              onClick={handleCreateCancel}
              icon={<CloseOutlined />}
            />
          </div>
        }
        placement="right"
        onClose={handleCreateCancel}
        open={isCreateDrawerOpen}
        width={500}
        closable={false}
        footer={
          <div className="flex justify-end gap-2">
            <Button key="cancel" onClick={handleCreateCancel}>
              Hủy
            </Button>
            <Button key="submit" type="primary" onClick={handleCreateUser} loading={createLoading}>
              Lưu
            </Button>
          </div>
        }
      >
        <Form
          form={createForm}
          layout="vertical"
        >
          {/* Upload Avatar */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-32 h-32 border border-dashed border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
              {uploadLoading ? (
                <LoadingOutlined style={{ fontSize: 32, color: '#45b630' }} />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="User avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <UserOutlined style={{ fontSize: 32, color: '#bfbfbf' }} />
                  <div className="mt-2 text-xs text-gray-500">Upload ảnh</div>
                </div>
              )}
              <div className="absolute bottom-0 right-0 mb-1 mr-1">
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

          {/* Full Name */}
          <Form.Item
            label={<div>Họ và tên <span className="text-red-500">*</span></div>}
            name="full_name"
            rules={[{ required: true, message: 'Please input full name' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label={<div>Email <span className="text-red-500">*</span></div>}
            name="email"
            rules={[
              { required: true, message: 'Please input email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Nhập địa chỉ email" />
          </Form.Item>

          {/* Phone Number */}
          <Form.Item
            label={<div>Số điện thoại <span className="text-red-500">*</span></div>}
            name="phone_number"
            rules={[{ required: true, message: 'Please input phone number' }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          {/* User Type */}
          <Form.Item
            label={<div>Type <span className="text-red-500">*</span></div>}
            name="role"
            rules={[{ required: true, message: 'Please select user type' }]}
          >
            <Select
              placeholder="Select user type"
              options={userTypeOptions}
            />
          </Form.Item>

          {/* Username */}
          <Form.Item
            label={<div>Tên đăng nhập <span className="text-red-500">*</span></div>}
            name="username"
            rules={[{ required: true, message: 'Please input username' }]}
          >
            <Input placeholder="Nhập tên đăng nhập" />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label={<div>Mật khẩu <span className="text-red-500">*</span></div>}
            name="password"
            rules={[
              { required: true, message: 'Please input password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input 
              placeholder="Nhập mật khẩu"
              disabled
              value="matkhau@2025"
              className="bg-gray-50"
            />
            <div className="mt-1 text-xs text-gray-500">Mật khẩu mặc định: matkhau@2025</div>
          </Form.Item>
        </Form>
      </Drawer>
    </Card>
  );
};

export default UserManagement;