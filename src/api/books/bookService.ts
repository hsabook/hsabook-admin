import { api } from '../../utils/api';
import type { UpdateBookPayload, BookParams, BookResponse } from './types';

export const getBooks = async (params: BookParams = {}): Promise<BookResponse> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) queryParams.append(key, value.toString());
  });
  
  return await api(`/books?${queryParams.toString()}`);
};

export const createBook = async (payload: any): Promise<any> => {
  const result = await api('/books', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.data;
};

export const updateBook = async (id: string, payload: UpdateBookPayload): Promise<void> => {
  await api(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteBook = async (id: string): Promise<void> => {
  await api(`/books/${id}`, {
    method: 'DELETE',
  });
};