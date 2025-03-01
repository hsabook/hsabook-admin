import { api } from '../../utils/api';

export interface BannerItem {
  index: number;
  url: string;
  name: string;
}

export interface BannerData {
  data: BannerItem[];
}

/**
 * Gửi dữ liệu banner lên server
 * @param bannerData Dữ liệu banner cần gửi
 * @returns Kết quả từ API
 */
export const uploadBannerData = async (bannerData: BannerData): Promise<any> => {
  const result = await api('/config-data/banner', {
    method: 'POST',
    body: JSON.stringify(bannerData),
  });
  
  return result;
};

/**
 * Lấy dữ liệu banner từ server
 * @returns Dữ liệu banner
 */
export const getBannerData = async (): Promise<BannerData> => {
  const result = await api('/config-data/banner', {
    method: 'GET',
  });
  
  return result;
}; 