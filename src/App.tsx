import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { message } from 'antd';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import { checkUserLoginAndGetInfo } from './api/users/userService';

function App() {
  const { isAuthenticated, logout, setUserInfo } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { isLoggedIn, userInfo } = await checkUserLoginAndGetInfo();
        
        if (!isLoggedIn) {
          message.error('Phiên đăng nhập đã hết hạn');
          logout();
        } else if (userInfo) {
          // Store user info in auth store
          setUserInfo(userInfo);
        }
      } catch (error) {
        message.error('Có lỗi xảy ra khi kiểm tra đăng nhập');
        logout();
      }
    };

    if (isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, logout, setUserInfo]);

  return (
    <Router>
      {isAuthenticated ? <AdminLayout /> : <Login />}
    </Router>
  );
}

export default App;