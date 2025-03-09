import { api } from '../../utils/api';

export interface Book {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  code_id: number;
  description: string;
  user_id: string;
  name: string;
  name_search: string;
  avatar: string;
  quantity: number;
  expiration_date: number;
  active: boolean;
  publishing_house: string | null;
  subject: string | null;
  is_file: boolean;
  file_download: null | string;
  xlsx_files: Array<{
    name: string;
    url: string;
    time: string;
    amount: number;
    timestamp: number;
  }>;
  is_public: boolean;
  file_code_id_url: string;
  file_code_id_upload_url: string;
  status_add_code_id: string;
  book_tags: BookTag[];
  authors: Author[];
}

export interface BookTag {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  book_id: string;
  tag_id: string;
  user_id: null | string;
  tag: {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    description: null | string;
    user_id: null | string;
    updated_by: null | string;
    deleted_by: null | string;
    name: string;
    name_search: null | string;
    avatar: null | string;
    parent_id: null | string;
    "_constructor-name_": string;
  };
  "_constructor-name_": string;
}

export interface Author {
  id: string;
  user: {
    id: string;
    full_name: string;
  };
}

export interface BookResponse {
  messages: string;
  data: {
    pagination: {
      current_page: number;
      total_pages: number;
      take: number;
      total: number;
    };
    data: Book[];
  };
  status_code: number;
}

export interface BookParams {
  page?: number;
  take?: number;
  search?: string;
  sort_field?: string;
  sort_type?: 'ASC' | 'DESC';
}

export interface UpdateBookPayload {
  name?: string;
  description?: string;
  avatar?: string;
  active?: boolean;
  publishing_house?: string;
  subject?: string;
  expiration_date?: number;
  is_public?: boolean;
}
