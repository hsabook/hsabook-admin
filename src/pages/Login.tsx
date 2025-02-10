import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import CONFIG_APP from '../utils/config';

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAccessToken, accessToken } = useAuthStore();

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (accessToken) {
        try {
          const response = await fetch(CONFIG_APP.API_ENDPOINT + '/users/info', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'accept': '*/*'
            }
          });
          
          if (response.status === 200 || response.status === 201) {
            navigate('/');
          }
        } catch (error) {
          console.error('Error checking auth status:', error);
        }
      }
    };

    checkAuthStatus();
  }, [accessToken, navigate]);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await fetch(CONFIG_APP.API_ENDPOINT + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.status_code === 200) {
        setAccessToken(data.data.accessToken);
        message.success('Đăng nhập thành công');
        navigate('/');
      } else {
        message.error('Đăng nhập thất bại');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <img
            src={'https://s3-website-r1.s3cloud.vn/hsa/2025-02-06/1738870934102.png'}
            alt="HSAbook Logo"
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800">Đăng nhập</h1>
          <p className="text-gray-600">Đăng nhập vào hệ thống quản trị</p>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full bg-[#45b630] hover:bg-[#3a9828]" 
              loading={loading}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;