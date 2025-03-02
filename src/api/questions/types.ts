export interface Question {
  id: string;
  active: boolean;
  subject: string;
  level: string;
  video?: string;
  question: string;
  type: string;
  solution?: string;
  options: QuestionOption[];
  answers: string[];
  created_at?: string;
  updated_at?: string;
}

export interface QuestionOption {
  checked: boolean;
  answer: string;
  value: string;
  type: string; // A, B, C, etc.
}

export interface CreateQuestionPayload {
  active: boolean;
  subject: string;
  level: string;
  video?: string;
  question: string;
  type: string;
  solution?: string;
  options: QuestionOption[];
  answers: string[];
}

export interface QuestionsResponse {
  messages: string;
  data: {
    pagination: {
      current_page: number;
      total_pages: number;
      take: number;
      total: number;
    };
    data: Question[];
  };
  status_code: number;
}