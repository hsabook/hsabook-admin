import { useState, useCallback } from "react";
import { message } from "antd";
import { createQuestion } from "../../../../api/questions/questionService";
import { addQuestionToExam, updateExamQuestions } from "../../../../api/exams";
import { QuestionEntity, ExamDetail } from "../types";

interface QuestionResponse {
  id: string;
  // Các trường khác nếu cần
}

export const useQuestionManagement = (onSuccess: () => void) => {
  // State for question detail modal
  const [isQuestionDetailVisible, setIsQuestionDetailVisible] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionEntity | null>(null);

  // State for editing question
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [addQuestionLoading, setAddQuestionLoading] = useState<boolean>(false);

  // Show question detail
  const showQuestionDetail = useCallback((question: QuestionEntity) => {
    setSelectedQuestion(question);
    setIsQuestionDetailVisible(true);
  }, []);

  // Close question detail
  const closeQuestionDetail = useCallback(() => {
    setIsQuestionDetailVisible(false);
    setSelectedQuestion(null);
  }, []);

  // Prepare question for editing
  const prepareQuestionForEditing = useCallback((questionId: string) => {
    setEditingQuestionId(questionId);
    setIsQuestionModalVisible(true);
  }, []);

  // Handle add new question
  const handleAddNewQuestion = useCallback(() => {
    setEditingQuestionId(null); // Ensure we're creating a new question, not editing
    setIsQuestionModalVisible(true);
  }, []);

  // Handle question created
  const handleQuestionCreated = useCallback(async (examId: string, newQuestion: any, examDetail: ExamDetail | null) => {
    try {
      setAddQuestionLoading(true);
      // Create the question
      const questionData = await createQuestion(newQuestion);
      
      if (questionData && questionData.id && examId && examDetail) {
        // Get all existing question IDs
        const existingQuestionIds = examDetail.exams_question.map(eq => eq.question_id);
        
        // Add the new question ID
        const updatedQuestionIds = [...existingQuestionIds, questionData.id];
        
        // Update the exam with all questions
        await updateExamQuestions(
          examId,
          examDetail.title,
          examDetail.active,
          "Toán", // Default to "Toán" since subject is not in ExamDetail
          updatedQuestionIds
        );
        
        message.success("Question created and added to exam successfully");
        
        // Refresh the exam detail to show the new question
        onSuccess();
      } else {
        // Fallback to the old method if examDetail is not available
        await addQuestionToExam(examId, questionData.id);
        message.success("Question created and added to exam successfully");
        onSuccess();
      }
    } catch (error) {
      console.error("🔴 useQuestionManagement handleQuestionCreated error:", error);
      message.error("Failed to create question");
    } finally {
      setAddQuestionLoading(false);
      setIsQuestionModalVisible(false);
    }
  }, [onSuccess]);

  // Handle question modal cancel
  const handleQuestionModalCancel = useCallback(() => {
    setIsQuestionModalVisible(false);
    setEditingQuestionId(null);
  }, []);

  // Handle import questions
  const handleImportQuestions = useCallback(() => {
    message.info("Import questions functionality not implemented yet");
  }, []);

  return {
    isQuestionDetailVisible,
    selectedQuestion,
    isQuestionModalVisible,
    editingQuestionId,
    addQuestionLoading,
    showQuestionDetail,
    closeQuestionDetail,
    prepareQuestionForEditing,
    handleAddNewQuestion,
    handleQuestionCreated,
    handleQuestionModalCancel,
    handleImportQuestions,
  };
}; 