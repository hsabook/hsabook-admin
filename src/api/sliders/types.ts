export interface Slider {
  index: number;
  url: string;
  name: string;
}

export interface SlidersResponse {
  messages: string;
  data: Slider[];
  status_code: number;
}