export interface Teacher {
  id: string;
  full_name: string;
  email: string;
  avatar: string | null;
}

export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  hash_password: string;
  username: string;
  email: string;
  phone_number: string;
  full_name: string;
  avatar: string | null;
  description: string | null;
  role: 'admin' | 'user';
  rank: number | null;
  status: 'active' | 'inactive';
  book_visits: string[];
  last_login: string;
}

export interface UsersResponse {
  messages: string;
  data: {
    pagination: {
      current_page: number;
      total_pages: number;
      take: number;
      total: number;
    };
    data: User[];
  };
  status_code: number;
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