// Define interfaces for question detail
export interface QuestionOption {
  type: string;
  value: string;
  answer: string;
  checked: boolean;
}

export interface QuestionEntity {
  id: string;
  code_id: string;
  question: string;
  type: string;
  solution: string;
  options: QuestionOption[];
  answers: string[];
  subject: string;
  level: string;
  active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  video?: string;
}

// Define interfaces for exam detail
export interface ExamQuestionEntity {
  id: string;
  exam_id: string;
  question_id: string;
  score: number | null;
  question: QuestionEntity;
}

export interface Exam {
  id: string;
  title: string;
  code_id: string;
  description?: string;
  active: boolean;
  total_question: number;
  created_at: string;
  updated_at: string;
  index?: number;
}

export interface ExamDetail extends Exam {
  exams_question: ExamQuestionEntity[];
}

export interface Question {
  id: string;
  code_id: string;
  content: string;
  type: string;
  subject: string;
  index?: number;
}

export interface ExamsParams {
  page?: number;
  take?: number;
  search?: string;
  status?: string;
}
