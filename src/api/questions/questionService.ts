import { api } from '../../utils/api';
import type { Question, QuestionsResponse, CreateQuestionPayload } from './types';

export const getQuestions = async (params?: any): Promise<QuestionsResponse> => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
  }
  
  return await api(`/questions?${queryParams.toString()}`);
};

export const createQuestion = async (payload: CreateQuestionPayload): Promise<Question> => {
  const result = await api('/questions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.data;
};

export const updateQuestion = async (id: string, payload: Partial<CreateQuestionPayload>): Promise<Question> => {
  const result = await api(`/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return result.data;
};

export const deleteQuestion = async (id: string): Promise<void> => {
  await api(`/questions/${id}`, {
    method: 'DELETE',
  });
};