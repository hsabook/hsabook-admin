import { api } from '../../utils/api';
import type { Link, LinksResponse } from './types';

export const getLinks = async (): Promise<LinksResponse> => {
  const result = await api('/config-data/link');
  return result;
};

export const updateLinks = async (links: Link[]): Promise<LinksResponse> => {
  const result = await api('/config-data/link', {
    method: 'POST',
    body: JSON.stringify({ data: links }),
  });
  return result;
};