import { useState, useCallback } from "react";
import { message } from "antd";
import { createExam, updateExam } from "../../../../api/exams";
import { ExamDetail } from "../types";

export const useExamForm = (onSuccess: () => void) => {
  // State for add exam modal
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [addExamLoading, setAddExamLoading] = useState<boolean>(false);

  // State for edit exam modal
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [editExamLoading, setEditExamLoading] = useState<boolean>(false);

  // Show add modal
  const showAddModal = useCallback(() => {
    setIsAddModalVisible(true);
  }, []);

  // Handle add modal cancel
  const handleAddModalCancel = useCallback(() => {
    setIsAddModalVisible(false);
  }, []);

  // Handle add exam
  const handleAddExam = useCallback(async (values: any) => {
    try {
      setAddExamLoading(true);
      const examData = {
        title: values.title,
        code_id: values.code_id,
        description: values.description || "",
        active: values.active,
      };

      await createExam(examData);
      message.success("Exam created successfully");
      setIsAddModalVisible(false);
      onSuccess();
    } catch (error) {
      console.error("🔴 useExamForm handleAddExam error:", error);
      message.error("Failed to create exam");
    } finally {
      setAddExamLoading(false);
    }
  }, [onSuccess]);

  // Show edit exam modal
  const showEditExamModal = useCallback(() => {
    setIsEditModalVisible(true);
  }, []);

  // Handle edit modal cancel
  const handleEditModalCancel = useCallback(() => {
    setIsEditModalVisible(false);
  }, []);

  // Handle edit exam
  const handleEditExam = useCallback(async (examId: string, values: any) => {
    try {
      setEditExamLoading(true);
      const examData = {
        title: values.title,
        code_id: values.code_id,
        description: values.description || "",
        active: values.active,
      };

      await updateExam(examId, examData);
      message.success("Exam updated successfully");
      setIsEditModalVisible(false);
      onSuccess();
    } catch (error) {
      console.error("🔴 useExamForm handleEditExam error:", error);
      message.error("Failed to update exam");
    } finally {
      setEditExamLoading(false);
    }
  }, [onSuccess]);

  return {
    isAddModalVisible,
    addExamLoading,
    isEditModalVisible,
    editExamLoading,
    showAddModal,
    handleAddModalCancel,
    handleAddExam,
    showEditExamModal,
    handleEditModalCancel,
    handleEditExam,
  };
}; 