import { api } from '../../utils/api';
import type { MenuBookResponse, GetMenuBookParams, CreateMenuBookPayload } from './types';

export const getMenuBooks = async (params: GetMenuBookParams): Promise<MenuBookResponse> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value.toString());
  });
  
  return await api(`/menu-book?${queryParams.toString()}`);
};

export const createMenuBook = async (payload: CreateMenuBookPayload): Promise<any> => {
  return await api('/menu-book', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const deleteMenuBook = async (id: string): Promise<void> => {
  await api(`/menu-book/${id}`, {
    method: 'DELETE',
  });
};