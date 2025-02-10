import { api } from '../../utils/api';
import type { TeachersResponse } from './types';

export const getTeachers = async (): Promise<TeachersResponse> => {
  const result = await api('/users?sort_type=DESC&role=teacher');
  return result;
};