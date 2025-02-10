export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  quantity_book: number;
  parent_id: string | null;
  children: Category[];
}

export interface CategoriesResponse {
  messages: string;
  data: {
    pagination: {
      current_page: number;
      total_pages: number;
      take: number;
      total: number;
    };
    data: Category[];
  };
  status_code: number;
}