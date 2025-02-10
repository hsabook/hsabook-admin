import { api } from '../../utils/api';
import type { UploadResponse } from './types';

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const result = await api('/media/upload', {
    method: 'POST',
    body: formData,
  });
  
  return result.data.url;
};