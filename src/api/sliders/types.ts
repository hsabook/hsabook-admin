export interface Slider {
  index: number;
  url: string;
  name: string;
  link?: string;
}

export interface SlidersResponse {
  messages: string;
  data: Slider[];
  status_code: number;
}