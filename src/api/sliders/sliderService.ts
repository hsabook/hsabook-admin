import { api } from '../../utils/api';
import type { Slider, SlidersResponse } from './types';

export const getSliders = async (): Promise<SlidersResponse> => {
  const result = await api('/config-data/banner');
  return result;
};

export const updateSliders = async (sliders: Slider[]): Promise<SlidersResponse> => {
  const result = await api('/config-data/banner', {
    method: 'POST',
    body: JSON.stringify({ data: sliders }),
  });
  return result;
};