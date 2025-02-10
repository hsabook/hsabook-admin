import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, message } from 'antd';
import AdminLayout from './components/AdminLayout';
import { useIsMobile } from './hooks/useIsMobile';
import MobileWarning from './components/MobileWarning';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import { useAuthStore } from './store/authStore';
import CONFIG_APP from './utils/config';

function App() {
  const isMobile = useIsMobile();
  const { accessToken, logout } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      if (accessToken) {
        try {
          const response = await fetch(CONFIG_APP.API_ENDPOINT + '/users/info', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (response.status !== 200 && response.status !== 201) {
            message.error('Phiên đăng nhập đã hết hạn');
            logout();
          }
        } catch (error) {
          message.error('Có lỗi xảy ra khi kiểm tra đăng nhập');
          logout();
        }
      }
    };

    checkAuth();
  }, [accessToken, logout]);

  if (isMobile) {
    return <MobileWarning />;
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#45b630',
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;