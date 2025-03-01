export interface Testimonial {
  index: number;
  url: string;
  name: string;
}

export interface TestimonialsResponse {
  messages: string;
  data: Testimonial[];
  status_code: number;
}