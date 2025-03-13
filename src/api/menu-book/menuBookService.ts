import { api } from '../../utils/api';
import type { MenuBookResponse, GetMenuBookParams, CreateMenuBookPayload } from './types';

export const getMenuBooks = async (params: GetMenuBookParams): Promise<MenuBookResponse> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value.toString());
  });
  
  return await api(`/menu-book?${queryParams.toString()}`);
};

export const getMenuBookById = async (id: string): Promise<any> => {
  try {
    console.log('🔍 getMenuBookById - Fetching menu book details for ID:', id);
    const response = await api(`/menu-book/${id}`);
    console.log('✅ getMenuBookById - API response:', response);
    return response;
  } catch (error) {
    console.error('❌ getMenuBookById - API error:', error);
    throw error;
  }
};

export const createMenuBook = async (payload: CreateMenuBookPayload): Promise<any> => {
  // Ensure video and attached are never null
  const safePayload = {
    ...payload,
    video: payload.video || '',
    attached: Array.isArray(payload.attached) ? payload.attached : [],
  };
  
  console.log('🔍 Debug - API payload:', JSON.stringify(safePayload, null, 2));
  
  try {
    const response = await api('/menu-book', {
      method: 'POST',
      body: JSON.stringify(safePayload),
    });
    
    console.log('✅ createMenuBook - API response:', response);
    return response;
  } catch (error) {
    console.error('❌ createMenuBook - API error:', error);
    throw error;
  }
};

export const updateMenuBook = async (id: string, payload: Partial<CreateMenuBookPayload>): Promise<any> => {
  // Ensure video and attached are never null if included in payload
  const safePayload = {
    ...payload,
    video: payload.video !== undefined ? (payload.video || '') : undefined,
    attached: payload.attached ? (Array.isArray(payload.attached) ? payload.attached : []) : undefined,
  };
  
  console.log('🔍 Debug - Update API payload:', JSON.stringify(safePayload, null, 2));
  
  try {
    const response = await api(`/menu-book/${id}`, {
      method: 'PUT',
      body: JSON.stringify(safePayload),
    });
    
    console.log('✅ updateMenuBook - API response:', response);
    return response;
  } catch (error) {
    console.error('❌ updateMenuBook - API error:', error);
    throw error;
  }
};

export const deleteMenuBook = async (id: string): Promise<void> => {
  await api(`/menu-book/${id}`, {
    method: 'DELETE',
  });
};