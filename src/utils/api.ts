import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import CONFIG_APP from './config';

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

interface ApiError {
  timestamp: string;
  error: string;
  message: string;
  statusCode: number;
}

export const api = async (endpoint: string, options: ApiOptions = {}) => {
  const { accessToken } = useAuthStore.getState();
  const { requiresAuth = true, headers = {}, ...rest } = options;

  const baseHeaders: Record<string, string> = {
    'Accept': '*/*',
  };

  if (requiresAuth && accessToken) {
    baseHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    baseHeaders['Content-Type'] = 'application/json';
  }

  const url = CONFIG_APP.API_ENDPOINT;
  
  const response = await fetch(`${url}${endpoint}`, {
    headers: {
      ...baseHeaders,
      ...headers,
    },
    ...rest,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    throw new Error(error.message || 'Có lỗi xảy ra');
  }

  return data;
};

export const checkLoginStatus = async () => {
  try {
    console.log('checkLoginStatus', CONFIG_APP.API_ENDPOINT + '/users/check-login')
    const token = localStorage.getItem('token');
    if (!token) return false;

    const response = await axios.get(CONFIG_APP.API_ENDPOINT + '/users/check-login', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('response', response)

    return response.status === 200;
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái đăng nhập:', error);
    return false;
  }
};