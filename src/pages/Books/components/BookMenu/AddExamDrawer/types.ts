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
}