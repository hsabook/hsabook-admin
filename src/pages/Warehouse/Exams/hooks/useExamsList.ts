import { useState, useCallback } from "react";
import { message } from "antd";
import { getExams } from "../../../../api/exams";
import { Exam, ExamsParams } from "../types";

export const useExamsList = () => {
  // State for managing exams data
  const [loading, setLoading] = useState<boolean>(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Fetch exams data
  const fetchExams = useCallback(async (params: ExamsParams = {}) => {
    try {
      setLoading(true);
      const response = await getExams({
        page: currentPage,
        take: pageSize,
        search: searchText,
        status: statusFilter,
        ...params,
      });

      // Add index to each exam for STT column
      const indexedData = response.data.map((exam, index) => ({
        ...exam,
        description: exam.description || undefined, // Convert null to undefined
        index: (response.page - 1) * response.limit + index + 1,
      }));

      setExams(indexedData);
      setTotal(response.total);
      setCurrentPage(response.page);
      setPageSize(response.limit);
    } catch (error) {
      console.error("🔴 useExamsList fetchExams error:", error);
      message.error("Failed to fetch exams data");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchText, statusFilter]);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    fetchExams({ page: 1, search: value });
  }, [fetchExams]);

  // Handle status change
  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    fetchExams({ page: 1, status: value });
  }, [fetchExams]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setSearchText("");
    setStatusFilter("");
    fetchExams({ page: 1 });
  }, [fetchExams]);

  // Handle page change
  const handlePageChange = useCallback((page: number, pageSize?: number) => {
    fetchExams({
      page,
      take: pageSize || 10,
    });
  }, [fetchExams]);

  return {
    loading,
    exams,
    total,
    currentPage,
    pageSize,
    searchText,
    statusFilter,
    fetchExams,
    handleSearch,
    handleStatusChange,
    handleRefresh,
    handlePageChange,
  };
}; 