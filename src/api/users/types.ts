export interface Teacher {
  id: string;
  full_name: string;
  email: string;
  avatar: string | null;
}

export interface TeachersResponse {
  messages: string;
  data: {
    pagination: {
      current_page: number;
      total_pages: number;
      take: number;
      total: number;
    };
    data: Teacher[];
  };
  status_code: number;
}