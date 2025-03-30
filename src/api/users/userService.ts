import { api } from '../../utils/api';
import type { TeachersResponse, UsersResponse, User } from './types';
import { useAuthStore } from '../../store/authStore';
import CONFIG_APP from '../../utils/config';

export const getUsers = async (
  page: number = 1, 
  take: number = 10,
  filters?: {
    username?: string;
    role?: string;
    status?: string;
  }
): Promise<UsersResponse> => {
  let url = `/users?page=${page}&take=${take}`;
  
  // Add search and filter parameters if provided
  if (filters) {
    if (filters.username) url += `&username=${filters.username}`;
    if (filters.role) url += `&role=${filters.role}`;
    if (filters.status) url += `&status=${filters.status}`;
  }
  
  const result = await api(url);
  return result;
};

export const getCurrentUser = async (): Promise<User> => {
  const result = await api('/users/me');
  return result.data;
};

// Check if user is logged in and get user info
export const checkUserLoginAndGetInfo = async (): Promise<{ 
  isLoggedIn: boolean; 
  userInfo?: {
    username: string;
    email: string;
    phone_number: string;
    full_name: string;
    avatar: string | null;
    description: string | null;
    role: string;
    rank: number;
    status: string;
  } 
}> => {
  const { accessToken, logout } = useAuthStore.getState();

  if (!accessToken) {
    return { isLoggedIn: false };
  }

  try {
    const response = await fetch(`${CONFIG_APP.API_ENDPOINT}/users/info`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status !== 200 && response.status !== 201) {
      return { isLoggedIn: false };
    }

    const data = await response.json();
    return { 
      isLoggedIn: true,
      userInfo: data.data
    };
  } catch (error) {
    console.error('Error checking login status:', error);
    return { isLoggedIn: false };
  }
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  const result = await api('/users', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
  return result.data;
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<any> => {
  const result = await api('/users/change-password', {
    method: 'POST',
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });
  return result;
};

export const getTeachers = async (): Promise<TeachersResponse> => {
  const result = await api('/users?sort_type=DESC&role=teacher');
  return result;
};

export const createUser = async (userData: {
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  username: string;
  password: string;
  avatar?: string;
}): Promise<any> => {
  try {
    const result = await api('/users/create', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return result;
  } catch (error: any) {
    // Format and rethrow the error with response data
    if (error.response) {
      throw { 
        message: error.message, 
        response: { 
          data: error.response
        } 
      };
    }
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: string): Promise<any> => {
  const result = await api(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
  return result;
};

export const updateUserStatus = async (userId: string, status: string): Promise<any> => {
  const result = await api(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return result;
};