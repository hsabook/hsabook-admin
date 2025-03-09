import { useState, useCallback } from "react";
import { message } from "antd";
import { getQuestions } from "../../../../api/questions/questionService";
import { addQuestionToExam } from "../../../../api/exams";
import { Question } from "../types";

export const useQuestionRepository = (onSuccess: () => void) => {
  // State for questions repository modal
  const [isRepositoryModalVisible, setIsRepositoryModalVisible] = useState<boolean>(false);
  const [repositoryQuestions, setRepositoryQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [repositorySearchText, setRepositorySearchText] = useState<string>("");
  const [repositoryQuestionType, setRepositoryQuestionType] = useState<string>("");
  const [repositorySubject, setRepositorySubject] = useState<string>("");
  const [repositoryLoading, setRepositoryLoading] = useState<boolean>(false);
  const [repositoryTotal, setRepositoryTotal] = useState<number>(0);
  const [repositoryCurrentPage, setRepositoryCurrentPage] = useState<number>(1);
  const [repositoryPageSize, setRepositoryPageSize] = useState<number>(10);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  // Fetch repository questions
  const fetchRepositoryQuestions = useCallback(async () => {
    try {
      setRepositoryLoading(true);
      const params: any = {
        page: repositoryCurrentPage,
        take: repositoryPageSize,
      };

      if (repositorySearchText) {
        params.search = repositorySearchText;
      }

      if (repositoryQuestionType) {
        params.type = repositoryQuestionType;
      }

      if (repositorySubject) {
        params.subject = repositorySubject;
      }

      console.log("Params:", params);

      const response = await getQuestions(params);

      // Transform API response data
      const transformedData = response.data.data.map(
        (item: any, index: number) => ({
          id: item.id,
          code_id: item.code_id,
          content: item.question,
          type: item.type,
          subject: item.subject,
          index:
            (response.data.pagination.current_page - 1) *
              response.data.pagination.take +
            index +
            1,
        })
      );

      setRepositoryQuestions(transformedData);
      setRepositoryTotal(response.data.pagination.total);
      setRepositoryCurrentPage(response.data.pagination.current_page);
    } catch (error) {
      console.error("🔴 useQuestionRepository fetchRepositoryQuestions error:", error);
      message.error("Failed to fetch questions");
    } finally {
      setRepositoryLoading(false);
    }
  }, [
    repositoryCurrentPage,
    repositoryPageSize,
    repositorySearchText,
    repositoryQuestionType,
    repositorySubject,
  ]);

  // Handle add from repository
  const handleAddFromRepository = useCallback((examId: string) => {
    if (!examId) {
      message.error("No exam selected");
      return;
    }
    setIsRepositoryModalVisible(true);
    fetchRepositoryQuestions();
  }, [fetchRepositoryQuestions]);

  // Handle repository modal cancel
  const handleRepositoryModalCancel = useCallback(() => {
    setIsRepositoryModalVisible(false);
    setSelectedQuestionIds([]);
    setRepositorySearchText("");
    setRepositoryQuestionType("");
    setRepositorySubject("");
  }, []);

  // Handle repository search
  const handleRepositorySearch = useCallback((value: string) => {
    setRepositorySearchText(value);
    setRepositoryCurrentPage(1);
    fetchRepositoryQuestions();
  }, [fetchRepositoryQuestions]);

  // Handle repository question type change
  const handleRepositoryQuestionTypeChange = useCallback((value: string) => {
    setRepositoryQuestionType(value);
    setRepositoryCurrentPage(1);
    fetchRepositoryQuestions();
  }, [fetchRepositoryQuestions]);

  // Handle repository subject change
  const handleRepositorySubjectChange = useCallback((value: string) => {
    setRepositorySubject(value);
    setRepositoryCurrentPage(1);
    fetchRepositoryQuestions();
  }, [fetchRepositoryQuestions]);

  // Handle repository page change
  const handleRepositoryPageChange = useCallback((page: number, pageSize?: number) => {
    setRepositoryCurrentPage(page);
    if (pageSize) setRepositoryPageSize(pageSize);
    fetchRepositoryQuestions();
  }, [fetchRepositoryQuestions]);

  // Handle select all questions
  const handleSelectAllQuestions = useCallback((selected: boolean, selectedRows: any[]) => {
    if (selected) {
      const ids = selectedRows.map((item) => item.id);
      setSelectedQuestionIds(ids);
    } else {
      setSelectedQuestionIds([]);
    }
  }, []);

  // Handle select question
  const handleSelectQuestion = useCallback((record: any, selected: boolean) => {
    if (selected) {
      setSelectedQuestionIds((prev) => [...prev, record.id]);
    } else {
      setSelectedQuestionIds((prev) => prev.filter((id) => id !== record.id));
    }
  }, []);

  // Handle confirm add questions
  const handleConfirmAddQuestions = useCallback(async (examId: string) => {
    if (!examId || selectedQuestionIds.length === 0) {
      return;
    }

    try {
      setConfirmLoading(true);
      const promises = selectedQuestionIds.map((questionId) =>
        addQuestionToExam(examId, questionId)
      );

      await Promise.all(promises);
      message.success("Questions added to exam successfully");
      setIsRepositoryModalVisible(false);
      setSelectedQuestionIds([]);
      onSuccess();
    } catch (error) {
      console.error("🔴 useQuestionRepository handleConfirmAddQuestions error:", error);
      message.error("Failed to add questions to exam");
    } finally {
      setConfirmLoading(false);
    }
  }, [selectedQuestionIds, onSuccess]);

  return {
    isRepositoryModalVisible,
    repositoryQuestions,
    selectedQuestionIds,
    repositorySearchText,
    repositoryQuestionType,
    repositorySubject,
    repositoryLoading,
    repositoryTotal,
    repositoryCurrentPage,
    repositoryPageSize,
    confirmLoading,
    fetchRepositoryQuestions,
    handleAddFromRepository,
    handleRepositoryModalCancel,
    handleRepositorySearch,
    handleRepositoryQuestionTypeChange,
    handleRepositorySubjectChange,
    handleRepositoryPageChange,
    handleSelectAllQuestions,
    handleSelectQuestion,
    handleConfirmAddQuestions,
  };
}; 