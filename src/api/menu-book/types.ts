export interface MenuBook {
  id: string;
  created_at: string;
  updated_at: string;
  book_id: string;
  type: 'DE' | 'BAI' | 'CHUONG';
  parent_id: string | null;
  title: string;
  cover: string | null;
  code_id: string;
  active: boolean;
  order: number;
  exam_id: string;
  exam: Exam;
  children: MenuBook[];
}

export interface MenuBookResponse {
  messages: string;
  data: {
    pagination: {
      current_page: number;
      total_pages: number;
      take: number;
      total: number;
    };
    data: MenuBook[];
  };
  status_code: number;
}

export interface GetMenuBookParams {
  book_id: string;
  page?: number;
  take?: number;
  sort_type?: 'ASC' | 'DESC';
  sort_field?: string;
  search?: string; // Add search parameter
}

export interface CreateMenuBookPayload {
  type: 'DE' | 'BAI' | 'CHUONG';
  book_id: string;
  title: string;
  description?: string;
  cover?: string;
  active: boolean;
  video?: string;
  attached?: any[];
  active_code_id?: boolean;
}