import { api } from '../../utils/api';
import type { TeacherBanner, TeacherBannersResponse } from './types';

export const getTeacherBanners = async (): Promise<TeacherBannersResponse> => {
  const result = await api('/config-data/banner-teacher');
  return result;
};

export const updateTeacherBanners = async (teachers: TeacherBanner[]): Promise<TeacherBannersResponse> => {
  const result = await api('/config-data/banner-teacher', {
    method: 'POST',
    body: JSON.stringify({ data: teachers }),
  });
  return result;
};