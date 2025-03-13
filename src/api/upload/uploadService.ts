import { api } from '../../utils/api';
import type { UploadResponse } from './types';

export const uploadFile = async (file: File): Promise<string> => {
  console.log(`📤 uploadFile: Starting upload of ${file.name} (${file.size} bytes, type: ${file.type})`);
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    const result = await api('/media/upload', {
      method: 'POST',
      body: formData,
    });
    
    console.log(`✅ uploadFile: Successfully uploaded ${file.name}, received URL:`, result.data.url);
    return result.data.url;
  } catch (error) {
    console.error(`❌ uploadFile: Failed to upload ${file.name}:`, error);
    throw error;
  }
};