export interface AddExamFormValues {
  title: string;
  content?: string;
  cover?: string;
  active: boolean;
  active_code_id: boolean;
  duration?: number;
  question_count?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  exam?: any;
  videos?: any[];
  files?: any[];
  
  // Additional fields required by API
  book_id?: string;
  type?: 'DE' | 'BAI' | 'CHUONG';
  description?: string;
  video?: string;
  attached?: any[];
  exam_id?: string;
  parent_id?: string;
  exam_url_doc?: string;
}