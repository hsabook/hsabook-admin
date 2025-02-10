import { api } from '../../utils/api';
import type { CategoriesResponse } from './types';

export const getCategories = async (): Promise<CategoriesResponse> => {
  const result = await api('/categories?take=100&page=1');
  return result;
};