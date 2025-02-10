import { api } from '../../utils/api';

export const uploadVideo = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const result = await api('/media/upload', {
    method: 'POST',
    body: formData,
  });
  
  return result.data.url;
};

export const validateVideoFile = (file: File): string | null => {
  // Check file type
  const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (!validTypes.includes(file.type)) {
    return 'Chỉ hỗ trợ định dạng video MP4, WebM và OGG';
  }

  // Check file size (max 100MB)
  const maxSize = 100 * 1024 * 1024; // 100MB in bytes
  if (file.size > maxSize) {
    return 'Kích thước file không được vượt quá 100MB';
  }

  return null;
};