import React, { useEffect, useCallback } from "react";
import { Card, message } from "antd";

// Import custom components
import ExamList from "./ExamList";
import ExamDetailComponent from "./ExamDetail";
import AddExamModal from "./AddExamModal";
import EditExamModal from "./EditExamModal";
import RepositoryModal from "./RepositoryModal";
import QuestionModal from "../../../components/QuestionModal";

// Import hooks
import {
  useExamsList,
  useExamDetail,
  useExamForm,
  useQuestionRepository,
  useQuestionManagement,
} from "./hooks";

const Exams: React.FC = () => {
  // Use custom hooks
  const {
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
  } = useExamsList();

  const {
    isDetailDrawerVisible,
    selectedExamDetail,
    detailLoading,
    fetchExamDetail,
    showExamDetail,
    closeExamDetail,
    handleRemoveQuestion,
  } = useExamDetail();

  const refreshData = useCallback(() => {
    fetchExams();
    if (selectedExamDetail) {
      fetchExamDetail(selectedExamDetail.id);
    }
  }, [fetchExams, fetchExamDetail, selectedExamDetail]);

  const {
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
  } = useExamForm(refreshData);

  const {
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
    handleAddFromRepository,
    handleRepositoryModalCancel,
    handleRepositorySearch,
    handleRepositoryQuestionTypeChange,
    handleRepositorySubjectChange,
    handleRepositoryPageChange,
    handleSelectAllQuestions,
    handleSelectQuestion,
    handleConfirmAddQuestions,
  } = useQuestionRepository(refreshData);

  const {
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
  } = useQuestionManagement(refreshData);

  // Initial data fetch
  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Handle edit exam with selected exam
  const handleEditExamWithId = async (values: any) => {
    if (selectedExamDetail) {
      return handleEditExam(selectedExamDetail.id, values);
    }
    return Promise.resolve();
  };

  // Handle add from repository with selected exam
  const handleAddFromRepositoryWithId = () => {
    if (selectedExamDetail) {
      handleAddFromRepository(selectedExamDetail.id);
    }
  };

  // Handle confirm add questions with selected exam
  const handleConfirmAddQuestionsWithId = () => {
    if (selectedExamDetail) {
      return handleConfirmAddQuestions(selectedExamDetail.id);
    }
    return Promise.resolve();
  };

  // Handle question created with selected exam
  const handleQuestionCreatedWithId = (newQuestion: any) => {
    if (selectedExamDetail) {
      return handleQuestionCreated(selectedExamDetail.id, newQuestion, selectedExamDetail)
        .then(() => {
          // Refresh exam detail after adding new question
          if (selectedExamDetail) {
            fetchExamDetail(selectedExamDetail.id);
          }
        });
    }
    return Promise.resolve();
  };

  return (
    <div className="exams-page">
      <Card title="Exams Management" bordered={false}>
        <ExamList
          loading={loading}
          exams={exams}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          searchText={searchText}
          statusFilter={statusFilter}
          onSearch={handleSearch}
          onStatusChange={handleStatusChange}
          onRefresh={handleRefresh}
          onPageChange={handlePageChange}
          onShowDetail={showExamDetail}
          onShowAddModal={showAddModal}
          onShowEditModal={showEditExamModal}
          fetchExams={fetchExams}
        />
      </Card>

      {/* Add Exam Modal */}
      <AddExamModal
        visible={isAddModalVisible}
        loading={addExamLoading}
        onCancel={handleAddModalCancel}
        onAdd={handleAddExam}
      />

      {/* Edit Exam Modal */}
      <EditExamModal
        visible={isEditModalVisible}
        loading={editExamLoading}
        examDetail={selectedExamDetail}
        onCancel={handleEditModalCancel}
        onEdit={handleEditExamWithId}
      />

      {/* Repository Modal */}
      <RepositoryModal
        visible={isRepositoryModalVisible}
        loading={repositoryLoading}
        questions={repositoryQuestions}
        selectedQuestionIds={selectedQuestionIds}
        searchText={repositorySearchText}
        questionType={repositoryQuestionType}
        subject={repositorySubject}
        total={repositoryTotal}
        currentPage={repositoryCurrentPage}
        pageSize={repositoryPageSize}
        onSearch={handleRepositorySearch}
        onQuestionTypeChange={handleRepositoryQuestionTypeChange}
        onSubjectChange={handleRepositorySubjectChange}
        onPageChange={handleRepositoryPageChange}
        onSelectAllQuestions={handleSelectAllQuestions}
        onSelectQuestion={handleSelectQuestion}
        onConfirmAdd={handleConfirmAddQuestionsWithId}
        onCancel={handleRepositoryModalCancel}
        confirmLoading={confirmLoading}
      />

      {/* Exam Detail Drawer */}
      <ExamDetailComponent
        visible={isDetailDrawerVisible}
        loading={detailLoading}
        examDetail={selectedExamDetail}
        onClose={closeExamDetail}
        onShowEditModal={showEditExamModal}
        onAddFromRepository={handleAddFromRepositoryWithId}
        onAddNewQuestion={handleAddNewQuestion}
        onShowQuestionDetail={showQuestionDetail}
        onPrepareQuestionForEditing={prepareQuestionForEditing}
        onRemoveQuestion={handleRemoveQuestion}
        fetchExamDetail={fetchExamDetail}
      />

      {/* Question Modal */}
      <QuestionModal
        open={isQuestionModalVisible}
        onCancel={handleQuestionModalCancel}
        onSubmit={handleQuestionCreatedWithId}
        questionId={editingQuestionId || undefined}
      />
    </div>
  );
};

export default Exams;
