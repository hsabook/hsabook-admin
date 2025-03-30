import { api } from '../../utils/api';
import type { StatisticsResponse } from './types';

/**
 * Fetches dashboard statistics from the API
 * @returns Promise with dashboard statistics data
 */
export const getStatistics = async (): Promise<StatisticsResponse> => {
  try {
    const result = await api('/dashboard/statistics');
    return result;
  } catch (error) {
    console.error('🔴 DashboardService getStatistics error:', error);
    throw error;
  }
}; 