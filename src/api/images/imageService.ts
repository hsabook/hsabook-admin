import { api } from '../../utils/api';
import type { ImageItem, ImagesResponse } from './types';

export const getImages = async (): Promise<ImagesResponse> => {
  const result = await api('/config-data/vinh-danh');
  return result;
};

export const updateImages = async (images: ImageItem[]): Promise<ImagesResponse> => {
  const result = await api('/config-data/vinh-danh', {
    method: 'POST',
    body: JSON.stringify({ data: images }),
  });
  return result;
};