export interface ImageItem {
  index: number;
  url: string;
  name: string;
}

export interface ImagesResponse {
  messages: string;
  data: ImageItem[];
  status_code: number;
}