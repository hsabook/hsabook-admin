export interface TeacherBanner {
  index: number;
  url: string;
  name: string;
}

export interface TeacherBannersResponse {
  messages: string;
  data: TeacherBanner[];
  status_code: number;
}