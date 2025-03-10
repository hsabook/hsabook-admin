export interface Exam {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  code_id: string;
  title: string;
  title_search: string;
  cover: string | null;
  description: string | null;
  type: string | null;
  time: string | null;
  user_id: string;
  subject: string;
  active: boolean;
  file_upload: string | null;
  file_download: string | null;
  status_upload: string;
  status_exam: string | null;
  file_download_draft: string | null;
  total_question: number;
  questions?: Question[];
}

export interface Question {
  id: string;
  code_id?: string;
  content?: string;
  type?: string;
}

export interface CreateExamRequest {
  title: string;
  active: boolean;
  subject: string;
  questions: { id: string }[];
  file_upload?: string | null;
}

export interface ApiResponse<T> {
  messages: string;
  data: T;
  status_code: number;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  take: number;
  total: number;
}

export interface ExamsData {
  data: Exam[];
  pagination: PaginationInfo;
}

export interface ExamsResponse {
  data: Exam[];
  total: number;
  page: number;
  limit: number;
}

export interface ExamsParams {
  page?: number;
  take?: number;
  search?: string;
  status?: string;
}