import { useState, useCallback } from "react";
import { message } from "antd";
import axios from "axios";
import { ExamDetail } from "../types";
import { useAuthStore } from "../../../../store/authStore";
import CONFIG_APP from "../../../../utils/config";
import { removeQuestionsFromExam } from "../../../../api/exams";

export const useExamDetail = () => {
  // State for exam detail drawer
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState<boolean>(false);
  const [selectedExamDetail, setSelectedExamDetail] = useState<ExamDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // Fetch exam detail
  const fetchExamDetail = useCallback(async (examId: string) => {
    try {
      setDetailLoading(true);
      const response = await axios.get(
        `${CONFIG_APP.API_ENDPOINT}/exams/${examId}`,
        {
          headers: {
            accept: "application/json",
            authorization: `Bearer ${useAuthStore.getState().accessToken}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setSelectedExamDetail(response.data.data);
      } else {
        message.error("Failed to fetch exam details");
      }
    } catch (error) {
      console.error("🔴 useExamDetail fetchExamDetail error:", error);
      message.error("Failed to fetch exam details");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Show exam detail drawer
  const showExamDetail = useCallback((examId: string) => {
    setIsDetailDrawerVisible(true);
    fetchExamDetail(examId);
  }, [fetchExamDetail]);

  // Close exam detail drawer
  const closeExamDetail = useCallback(() => {
    setIsDetailDrawerVisible(false);
    setSelectedExamDetail(null);
  }, []);

  // Handle remove question from exam
  const handleRemoveQuestion = useCallback(async (examId: string, questionId: string) => {
    try {
      await removeQuestionsFromExam(examId, [questionId]);
      message.success("Question removed from exam successfully");
      return Promise.resolve();
    } catch (error) {
      console.error("🔴 useExamDetail handleRemoveQuestion error:", error);
      message.error("Failed to remove question from exam");
      return Promise.reject(error);
    }
  }, []);

  return {
    isDetailDrawerVisible,
    selectedExamDetail,
    detailLoading,
    fetchExamDetail,
    showExamDetail,
    closeExamDetail,
    handleRemoveQuestion,
  };
}; 