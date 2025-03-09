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
  ["_constructor-name_"]: string;
}

export interface Code {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  book_id: string;
  code: string;
  active_by: null | string;
  active: null | {
    id: string;
    email: string;
    name?: string;
  };
  book: Book;
  ["_constructor-name_"]: string;
}

export interface CodeResponse {
  data: Code[];
  pagination: {
    current_page: number;
    total_pages: number;
    take: number;
    total: number;
  };
}

export interface CodeParams {
  page?: number;
  take?: number;
  search?: string;
  status?: string;
  book_id?: string | number;
  active?: boolean;
  code_id?: string;
}

export interface CreateCodePayload {
  code: string;
  book_id: string;
  status?: string;
}

export interface UpdateCodePayload {
  code?: string;
  book_id?: string;
  status?: string;
} 