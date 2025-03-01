import { api } from '../../utils/api';
import type { Testimonial, TestimonialsResponse } from './types';

export const getTestimonials = async (): Promise<TestimonialsResponse> => {
  const result = await api('/config-data/cam-nhan');
  return result;
};

export const updateTestimonials = async (testimonials: Testimonial[]): Promise<TestimonialsResponse> => {
  const result = await api('/config-data/cam-nhan', {
    method: 'POST',
    body: JSON.stringify({ data: testimonials }),
  });
  return result;
};