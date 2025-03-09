import axios from 'axios';
import { Exam, ExamsParams, ExamsResponse, CreateExamRequest } from './types';
import { useAuthStore } from '../../store/authStore';
import CONFIG_APP from '../../utils/config';

const API_URL = CONFIG_APP.API_ENDPOINT;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const { accessToken } = useAuthStore.getState();
  return {
    'Authorization': `Bearer ${accessToken}`
  };
};

// Get all exams with pagination and filters
export const getExams = async (params: ExamsParams = {}): Promise<ExamsResponse> => {
  try {
    const queryParams = {
      page: params.page || 1,
      take: params.take || 10,
      search: params.search || '',
      status: params.status || ''
    };
    
    const response = await axios.get(`${API_URL}/exams`, {
      params: queryParams,
      headers: getAuthHeaders()
    });
    
    // Transform API response to match our internal ExamsResponse format
    return {
      data: response.data.data.data || [],
      total: response.data.data.pagination.total || 0,
      page: response.data.data.pagination.current_page || 1,
      limit: response.data.data.pagination.take || 10
    };
  } catch (error) {
    console.error('🔴 ExamsService getExams error:', error);
    throw error;
  }
};

// Get a single exam by ID
export const getExamById = async (id: string): Promise<Exam> => {
  try {
    const response = await axios.get(`${API_URL}/exams/${id}`, {
      headers: getAuthHeaders()
    });
    
    return response.data.data;
  } catch (error) {
    console.error(`🔴 ExamsService getExamById error for id ${id}:`, error);
    throw error;
  }
};

// Create a new exam
export const createExam = async (examData: Partial<CreateExamRequest>): Promise<Exam> => {
  try {
    const response = await axios.post(`${API_URL}/exams`, examData, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('🔴 ExamsService createExam error:', error);
    throw error;
  }
};

// Update an existing exam
export const updateExam = async (id: string, examData: Partial<CreateExamRequest>): Promise<Exam> => {
  try {
    const response = await axios.put(`${API_URL}/exams/${id}`, examData, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error(`🔴 ExamsService updateExam error for id ${id}:`, error);
    throw error;
  }
};

// Delete an exam
export const deleteExam = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/exams/${id}`, {
      headers: getAuthHeaders()
    });
  } catch (error) {
    console.error(`🔴 ExamsService deleteExam error for id ${id}:`, error);
    throw error;
  }
};

// Import exams from file
export const importExams = async (file: File): Promise<ExamsResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/exams/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...getAuthHeaders()
      }
    });
    
    return {
      data: response.data.data.data || [],
      total: response.data.data.pagination.total || 0,
      page: response.data.data.pagination.current_page || 1,
      limit: response.data.data.pagination.take || 10
    };
  } catch (error) {
    console.error('🔴 ExamsService importExams error:', error);
    throw error;
  }
};

// Remove questions from an exam
export const removeQuestionsFromExam = async (examId: string, questionIds: string[]): Promise<any> => {
  try {
    const response = await axios.delete(`${API_URL}/exams/${examId}/question-ids`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      data: {
        ids: questionIds
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`🔴 ExamsService removeQuestionsFromExam error for exam ${examId}:`, error);
    throw error;
  }
};

// Add a question to an exam
export const addQuestionToExam = async (examId: string, questionId: string, score: number | null = null): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/exams/${examId}/questions`, {
      question_id: questionId,
      score: score
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`🔴 ExamsService addQuestionToExam error for exam ${examId}, question ${questionId}:`, error);
    throw error;
  }
};

// Update exam questions
export const updateExamQuestions = async (examId: string, title: string, active: boolean, subject: string, questionIds: string[]): Promise<any> => {
  try {
    const questions = questionIds.map(id => ({ id }));
    
    const response = await axios.put(`${API_URL}/exams/${examId}`, {
      title,
      active,
      subject,
      questions
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`🔴 ExamsService updateExamQuestions error for exam ${examId}:`, error);
    throw error;
  }
}; 