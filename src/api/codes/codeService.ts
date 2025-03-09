import { api } from '../../utils/api';
import type { CodeParams, CodeResponse, CreateCodePayload, UpdateCodePayload } from './types';

export const getCodes = async (params: CodeParams = {}): Promise<CodeResponse> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) queryParams.append(key, value.toString());
  });
  
  return await api(`/codes?${queryParams.toString()}`);
};

export const getCode = async (id: string): Promise<any> => {
  return await api(`/codes/${id}`);
};

export const createCode = async (payload: CreateCodePayload): Promise<any> => {
  const result = await api('/codes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result;
};

export const updateCode = async (id: string, payload: UpdateCodePayload): Promise<void> => {
  await api(`/codes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const deleteCode = async (id: string): Promise<void> => {
  await api(`/codes/${id}`, {
    method: 'DELETE',
  });
};

export const activateCode = async (code: string): Promise<any> => {
  const result = await api(`/codes/activate/${code}`, {
    method: 'POST',
  });
  return result;
}; 