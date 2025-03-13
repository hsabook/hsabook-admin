import React, { useState, useEffect } from "react";
import {
  Drawer,
  Button,
  Space,
  Spin,
  Typography,
  Tag,
  Table,
  message,
  Modal,
  Tooltip,
  Form,
  Input,
  Switch,
  Select,
  Upload,
} from "antd";
import {
  UploadOutlined,
  DatabaseOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import CONFIG_APP from "../../utils/config";
import QuestionDetail from "../QuestionDetail";
import QuestionModal from "../QuestionModal";
import QuestionRepositoryDrawer from "../../pages/Warehouse/QuestionRepositoryDrawer";
import { uploadFile } from "../../api/upload/uploadService";
import { 
  removeQuestionsFromExam,
  updateExam,
  addQuestionToExam,
} from "../../api/exams";
import { getQuestions } from "../../api/questions/questionService";

// Define interfaces for question detail
interface QuestionOption {
  type: string;
  value: string;
  answer: string;
  checked: boolean;
}

interface QuestionEntity {
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
interface ExamQuestionEntity {
  id: string;
  exam_id: string;
  question_id: string;
  score: number | null;
  question: QuestionEntity;
}

interface ExamDetail {
  id: string;
  title: string;
  code_id: string;
  description?: string;
  active: boolean;
  subject: string;
  file_upload: string | null;
  total_question: number;
  created_at: string;
  updated_at: string;
  exams_question: ExamQuestionEntity[];
}

// Props for ExamDetailDrawer component
interface ExamDetailDrawerProps {
  examId?: string;
  visible: boolean;
  onClose: () => void;
  onExamUpdated?: () => void;
  QUESTION_TYPE?: Record<string, string>;
  HighSchoolSubjects?: Array<{title: string, value: string}>;
}

const { Title, Text } = Typography;
const { confirm } = Modal;

const ExamDetailDrawer: React.FC<ExamDetailDrawerProps> = ({
  examId,
  visible,
  onClose,
  onExamUpdated,
  QUESTION_TYPE = {},
  HighSchoolSubjects = [],
}) => {
  // State for exam detail
  const [selectedExamDetail, setSelectedExamDetail] = useState<ExamDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  
  // State for edit exam modal
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [editExamForm] = Form.useForm();
  const [editExamLoading, setEditExamLoading] = useState<boolean>(false);
  
  // State for force update
  const [forceUpdate, setForceUpdate] = useState<Record<string, any>>({});

  // State for question detail modal
  const [isQuestionDetailVisible, setIsQuestionDetailVisible] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionEntity | null>(null);

  // State for editing question
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState<boolean>(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // State for questions repository modal
  const [isRepositoryModalVisible, setIsRepositoryModalVisible] = useState<boolean>(false);
  const [repositoryQuestions, setRepositoryQuestions] = useState<any[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [repositorySearchText, setRepositorySearchText] = useState<string>("");
  const [repositoryQuestionType, setRepositoryQuestionType] = useState<string>("");
  const [repositorySubject, setRepositorySubject] = useState<string>("");
  const [repositoryLoading, setRepositoryLoading] = useState<boolean>(false);
  const [repositoryTotal, setRepositoryTotal] = useState<number>(0);
  const [repositoryCurrentPage, setRepositoryCurrentPage] = useState<number>(1);
  const [repositoryPageSize, setRepositoryPageSize] = useState<number>(10);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  // Fetch exam detail when examId changes or when visible becomes true
  useEffect(() => {
    if (examId && visible) {
      fetchExamDetail(examId);
    }
  }, [examId, visible]);

  // Fetch exam detail
  const fetchExamDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      const response = await axios.get(
        `${CONFIG_APP.API_ENDPOINT}/exams/${id}`,
        {
          headers: {
            accept: "application/json",
            authorization: `Bearer ${useAuthStore.getState().accessToken}`,
          },
        }
      );

      console.log(`📥 ExamDetailDrawer fetchExamDetail response for id ${id}:`, response.data);

      if (response.data && response.data.data) {
        setSelectedExamDetail(response.data.data);
      }
    } catch (error: any) {
      console.error(`🔴 ExamDetailDrawer fetchExamDetail error for id ${id}:`, error);
      message.error(error?.response?.data?.message || "Lỗi khi tải bộ đề");
    } finally {
      setDetailLoading(false);
    }
  };

  // Show edit exam modal
  const showEditExamModal = () => {
    if (selectedExamDetail) {
      // Set form values
      editExamForm.setFieldsValue({
        title: selectedExamDetail.title,
        active: selectedExamDetail.active,
        subject: selectedExamDetail.subject,
        file_upload: selectedExamDetail.file_upload,
      });

      // Force form to re-render to show the uploaded file info
      setForceUpdate({});

      setIsEditModalVisible(true);
    }
  };

  // Handle edit exam modal cancel
  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    editExamForm.resetFields();
  };

  // Handle edit exam submit
  const handleEditExam = async (values: any) => {
    if (!selectedExamDetail) return;

    try {
      setEditExamLoading(true);

      // Prepare data for API
      const examData = {
        title: values.title,
        active: values.active,
        subject: values.subject,
        questions: selectedExamDetail.exams_question.map((q) => ({
          id: q.question_id,
        })),
        file_upload: values.file_upload || selectedExamDetail.file_upload,
      };

      console.log("📤 ExamDetailDrawer handleEditExam payload:", examData);

      // Call API to update exam
      const response = await updateExam(selectedExamDetail.id, examData);
      console.log("📥 ExamDetailDrawer handleEditExam response:", response);

      if (response) {
        message.success("Cập nhật bộ đề thành công");

        // Close modal and refresh data
        setIsEditModalVisible(false);
        editExamForm.resetFields();

        // Refresh exam detail
        if (examId) {
          fetchExamDetail(examId);
        }

        // Notify parent component if exam was updated
        if (onExamUpdated) {
          onExamUpdated();
        }
      }
    } catch (error: any) {
      console.error("🔴 ExamDetailDrawer handleEditExam error:", error);
      message.error(error.response?.data?.message || "Cập nhật bộ đề thất bại");
    } finally {
      setEditExamLoading(false);
    }
  };

  // Show question detail
  const showQuestionDetail = (question: any) => {
    // Add required fields for QuestionEntity if they don't exist
    const enhancedQuestion: QuestionEntity = {
      ...question,
      created_at: question.created_at || new Date().toISOString(),
      updated_at: question.updated_at || new Date().toISOString(),
    };

    setSelectedQuestion(enhancedQuestion);
    setIsQuestionDetailVisible(true);
  };

  // Close question detail
  const closeQuestionDetail = () => {
    setIsQuestionDetailVisible(false);
    setSelectedQuestion(null);
  };

  // Prepare question for editing
  const prepareQuestionForEditing = (questionId: string) => {
    // Check if exam is active
    if (selectedExamDetail?.active) {
      message.warning("Tính năng này không thể sử dụng khi đề thi đang hoạt động. Vui lòng vô hiệu hóa đề thi trước.");
      return;
    }

    // Show loading message
    const loadingMessage = message.loading("Đang tải thông tin câu hỏi...", 0);

    // Set the editing question ID and open the modal
    setEditingQuestionId(questionId);
    setIsQuestionModalVisible(true);
    loadingMessage();
  };

  // Handle question modal cancel
  const handleQuestionModalCancel = () => {
    setIsQuestionModalVisible(false);
    setEditingQuestionId(null);
  };

  // Handle remove question from exam
  const handleRemoveQuestion = async (examId: string, questionId: string) => {
    // Check if exam is active
    if (selectedExamDetail?.active) {
      message.warning("Tính năng này không thể sử dụng khi đề thi đang hoạt động. Vui lòng vô hiệu hóa đề thi trước.");
      return;
    }

    try {
      setDetailLoading(true);

      if (selectedExamDetail) {
        // Call API to update exam
        const response = await removeQuestionsFromExam(examId, [questionId]);

        if (response) {
          message.success("Đã xóa câu hỏi khỏi bộ đề");

          // Refresh exam detail
          fetchExamDetail(examId);

          // Notify parent component if exam was updated
          if (onExamUpdated) {
            onExamUpdated();
          }
        } else {
          message.error(response.message);
        }
      } else {
        message.error("Không tìm thấy thông tin bộ đề");
      }
    } catch (error: any) {
      console.error("🔴 ExamDetailDrawer handleRemoveQuestion error:", error);
      message.error(error?.response?.data?.message || "Không thể xóa câu hỏi khỏi bộ đề");
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle add from repository
  const handleAddFromRepository = () => {
    // Check if exam is active
    if (selectedExamDetail?.active) {
      message.warning("Tính năng này không thể sử dụng khi đề thi đang hoạt động. Vui lòng vô hiệu hóa đề thi trước.");
      return;
    }

    setIsRepositoryModalVisible(true);
    setSelectedQuestionIds([]);
    // Reset filters
    setRepositorySearchText("");
    setRepositoryQuestionType("");
    if (selectedExamDetail?.subject) {
      setRepositorySubject(selectedExamDetail.subject);
    } else {
      setRepositorySubject("");
    }
    setRepositoryCurrentPage(1);
    // Fetch latest questions
    fetchRepositoryQuestions();
  };

  // Fetch questions from repository
  const fetchRepositoryQuestions = async () => {
    try {
      setRepositoryLoading(true);

      const params: any = {
        take: repositoryPageSize,
        page: repositoryCurrentPage,
      };

      // Add filters if they exist
      if (repositorySearchText) {
        params.search = repositorySearchText;
      }

      if (repositoryQuestionType && Object.keys(QUESTION_TYPE).length > 0) {
        // Convert question type to API format
        try {
          const questionTypeValues = Object.values(QUESTION_TYPE);
          const index = questionTypeValues.findIndex(
            (type) => type === repositoryQuestionType
          );
          if (index !== -1) {
            params.type = Object.keys(QUESTION_TYPE)[index];
          }
        } catch (error) {
          console.error("🔴 ExamDetailDrawer fetchRepositoryQuestions error:", error);
        }
      }

      if (repositorySubject && HighSchoolSubjects.length > 0) {
        try {
          const subject = HighSchoolSubjects.find(
            (subj) => subj.title === repositorySubject
          );
          if (subject) {
            params.subject = subject.value;
          }
        } catch (error) {
          console.error("🔴 ExamDetailDrawer fetchRepositoryQuestions error:", error);
        }
      }

      console.log("Repository search params:", params);

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
      console.error("🔴 ExamDetailDrawer fetchRepositoryQuestions error:", error);
      message.error("Không thể tải danh sách câu hỏi");
    } finally {
      setRepositoryLoading(false);
    }
  };

  // Handle repository modal cancel
  const handleRepositoryModalCancel = () => {
    setIsRepositoryModalVisible(false);
    setSelectedQuestionIds([]);
    setRepositorySearchText("");
    setRepositoryQuestionType("");
    setRepositorySubject("");
  };

  // Call fetchRepositoryQuestions when these states change
  useEffect(() => {
    if (isRepositoryModalVisible) {
      fetchRepositoryQuestions();
    }
  }, [
    repositorySearchText,
    repositoryQuestionType,
    repositorySubject,
    repositoryCurrentPage,
    repositoryPageSize,
  ]);

  // Handle repository search
  const handleRepositorySearch = (value: string) => {
    setRepositorySearchText(value);
    setRepositoryCurrentPage(1); // Reset to first page when searching
  };

  // Handle repository question type change
  const handleRepositoryQuestionTypeChange = (value: string) => {
    setRepositoryQuestionType(value);
    setRepositoryCurrentPage(1); // Reset to first page when filtering
  };

  // Handle repository subject change
  const handleRepositorySubjectChange = (value: string) => {
    setRepositorySubject(value);
    setRepositoryCurrentPage(1); // Reset to first page when filtering
  };

  // Handle repository page change
  const handleRepositoryPageChange = (page: number, pageSize?: number) => {
    setRepositoryCurrentPage(page);
    if (pageSize) setRepositoryPageSize(pageSize);
  };

  // Handle select all questions
  const handleSelectAllQuestions = (selected: boolean, selectedRows: any[]) => {
    if (selected) {
      const selectedIds = selectedRows.map((row) => row.id);
      setSelectedQuestionIds(selectedIds);
    } else {
      setSelectedQuestionIds([]);
    }
  };

  // Handle select question
  const handleSelectQuestion = (record: any, selected: boolean) => {
    if (selected) {
      setSelectedQuestionIds((prev) => [...prev, record.id]);
    } else {
      setSelectedQuestionIds((prev) => prev.filter((id) => id !== record.id));
    }
  };

  // Handle confirm add questions
  const handleConfirmAddQuestions = async () => {
    if (selectedQuestionIds.length === 0) {
      message.warning("Vui lòng chọn ít nhất một câu hỏi");
      return;
    }

    try {
      if (selectedExamDetail) {
        setConfirmLoading(true);

        // Get current question IDs
        const currentQuestionIds = selectedExamDetail.exams_question.map(
          (q) => q.question_id
        );

        // Add new question IDs (avoid duplicates)
        const updatedQuestionIds = [
          ...new Set([...currentQuestionIds, ...selectedQuestionIds]),
        ];

        // Prepare data for API
        const examData = {
          title: selectedExamDetail.title,
          active: selectedExamDetail.active,
          subject: selectedExamDetail.subject,
          questions: updatedQuestionIds.map((id) => ({ id })),
        };

        // Call API to update exam
        const response = await updateExam(selectedExamDetail.id, examData);

        if (response) {
          message.success(
            `Đã thêm ${selectedQuestionIds.length} câu hỏi vào bộ đề`
          );

          // Refresh exam detail
          if (examId) {
            fetchExamDetail(examId);
          }

          // Close modal
          handleRepositoryModalCancel();

          // Notify parent component if exam was updated
          if (onExamUpdated) {
            onExamUpdated();
          }
        }
      }
    } catch (error: any) {
      console.error("🔴 ExamDetailDrawer handleConfirmAddQuestions error:", error);
      message.error(error?.response?.data?.message || "Không thể thêm câu hỏi vào bộ đề");
    } finally {
      setConfirmLoading(false);
    }
  };

  // Handle question created - for future use
  const handleQuestionCreated = async (newQuestion: any) => {
    if (selectedExamDetail && examId) {
      try {
        // Show loading message
        const loadingMessage = message.loading(
          "Đang thêm câu hỏi vào bộ đề...",
          0
        );

        // Call API to add question to exam
        await addQuestionToExam(selectedExamDetail.id, newQuestion.id);

        loadingMessage();

        // Refresh exam detail
        fetchExamDetail(examId);

        // Show success message
        message.success("Đã thêm câu hỏi vào bộ đề");

        // Notify parent component if exam was updated
        if (onExamUpdated) {
          onExamUpdated();
        }
      } catch (error) {
        console.error("Error adding question to exam:", error);
        message.error("Không thể thêm câu hỏi vào bộ đề");
      }
    }
  };

  return (
    <>
      <Drawer
        title={
          <div className="flex items-center">
            <span className="mr-2">
              {selectedExamDetail?.title || "Chi tiết bộ đề"}
            </span>
            {selectedExamDetail?.active && <Tag color="green">Hoạt động</Tag>}
            {!selectedExamDetail?.active && (
              <Tag color="red">Không hoạt động</Tag>
            )}
          </div>
        }
        placement="right"
        width="80%"
        onClose={onClose}
        open={visible}
        extra={
          <Space>
            <Button onClick={onClose}>Đóng</Button>
            {selectedExamDetail && (
              <Button type="primary" onClick={showEditExamModal}>
                Chỉnh sửa
              </Button>
            )}
          </Space>
        }
        className="exam-detail-drawer"
      >
        {detailLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spin size="large" />
          </div>
        ) : selectedExamDetail ? (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text type="secondary">ID bộ đề:</Text>
                  <div className="font-medium">
                    {selectedExamDetail.code_id}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Môn học:</Text>
                  <div>
                    <Tag color="blue">{selectedExamDetail.subject}</Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Trạng thái:</Text>
                  <div>
                    <Tag color={selectedExamDetail.active ? "green" : "red"}>
                      {selectedExamDetail.active
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Ngày tạo:</Text>
                  <div className="font-medium">
                    {new Date(selectedExamDetail.created_at).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Lần cập nhật cuối:</Text>
                  <div className="font-medium">
                    {new Date(selectedExamDetail.updated_at).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Số câu hỏi:</Text>
                  <div className="font-medium">
                    {selectedExamDetail.exams_question?.length || 0}
                  </div>
                </div>
                {selectedExamDetail.file_upload && (
                  <div>
                    <Text type="secondary">File đã tải lên:</Text>
                    <div className="font-medium">
                      <a 
                        href={selectedExamDetail.file_upload} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                      >
                        <UploadOutlined className="mr-1" /> Xem file
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedExamDetail.description && (
              <div>
                <Title level={5}>Mô tả</Title>
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedExamDetail.description,
                  }}
                  className="p-3 bg-gray-50 rounded mt-2"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between items-center">
                <Title level={5}>Danh sách câu hỏi</Title>
                <Space>
                  <Button
                    type="primary"
                    icon={<DatabaseOutlined />}
                    onClick={handleAddFromRepository}
                    disabled={selectedExamDetail?.active}
                    className={selectedExamDetail?.active ? "bg-gray-400 hover:bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}
                    title={selectedExamDetail?.active ? "Tính năng này không thể sử dụng khi đề thi đang hoạt động" : ""}
                  >
                    Thêm từ kho câu hỏi
                  </Button>
                </Space>
              </div>
              {selectedExamDetail.exams_question &&
              selectedExamDetail.exams_question.length > 0 ? (
                <Table
                  dataSource={selectedExamDetail.exams_question}
                  rowKey="id"
                  pagination={false}
                  className="mt-4"
                  columns={[
                    {
                      title: "STT",
                      key: "index",
                      width: 60,
                      render: (_, __, index) => index + 1,
                    },
                    {
                      title: "Mã câu hỏi",
                      dataIndex: ["question", "code_id"],
                      key: "code_id",
                      width: 120,
                    },
                    {
                      title: "Nội dung câu hỏi",
                      dataIndex: ["question", "question"],
                      key: "question",
                      render: (_, record: ExamQuestionEntity) => (
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              record.question?.question ||
                              "Không có nội dung",
                          }}
                          className="max-h-20 overflow-y-auto"
                        />
                      ),
                    },
                    {
                      title: "Loại câu hỏi",
                      dataIndex: ["question", "type"],
                      key: "type",
                      width: 180,
                      render: (_, record: ExamQuestionEntity) => {
                        const type = record.question?.type || "";
                        let color = "blue";
                        if (type === "Lựa chọn một đáp án") color = "green";
                        if (type === "Lựa chọn nhiều đáp án")
                          color = "purple";
                        if (type === "Đúng/Sai") color = "orange";
                        if (type === "Nhập đáp án") color = "cyan";
                        if (type === "Đọc hiểu") color = "magenta";

                        return <Tag color={color}>{type}</Tag>;
                      },
                    },
                    {
                      title: "Môn học",
                      dataIndex: ["question", "subject"],
                      key: "subject",
                      width: 120,
                      render: (_, record: ExamQuestionEntity) => {
                        const subject = record.question?.subject || "";
                        let color = "blue";
                        if (subject === "Toán") color = "blue";
                        if (subject === "Ngữ văn") color = "green";
                        if (subject === "Tiếng Anh") color = "purple";
                        if (subject === "Vật lý") color = "orange";
                        if (subject === "Hóa học") color = "red";
                        if (subject === "Sinh học") color = "cyan";

                        return <Tag color={color}>{subject}</Tag>;
                      },
                    },
                    {
                      title: "Thao tác",
                      key: "action",
                      width: 120,
                      render: (_, record: ExamQuestionEntity) => (
                        <Space>
                          <Tooltip title="Chi tiết">
                            <Button
                              type="text"
                              icon={
                                <EyeOutlined className="text-green-500" />
                              }
                              onClick={() => {
                                // Show question detail using the new component
                                showQuestionDetail(record.question);
                              }}
                              className="hover:bg-green-50 transition-colors duration-300"
                            />
                          </Tooltip>
                          <Tooltip title={selectedExamDetail?.active ? "Tính năng này không thể sử dụng khi đề thi đang hoạt động" : "Chỉnh sửa"}>
                            <Button
                              type="text"
                              icon={
                                <EditOutlined className={selectedExamDetail?.active ? "text-gray-400" : "text-blue-500"} />
                              }
                              disabled={selectedExamDetail?.active}
                              onClick={() => {
                                // Check if exam is active
                                if (selectedExamDetail?.active) {
                                  message.warning("Tính năng này không thể sử dụng khi đề thi đang hoạt động. Vui lòng vô hiệu hóa đề thi trước.");
                                  return;
                                }
                                
                                // Debug question object
                                console.log(
                                  "🔍 Debug question object:",
                                  record.question
                                );
                                console.log(
                                  "🔍 Debug question_id:",
                                  record.question_id
                                );

                                // Prepare question for editing
                                if (record.question && record.question_id) {
                                  prepareQuestionForEditing(
                                    record.question_id
                                  );
                                } else {
                                  message.error(
                                    "Không thể chỉnh sửa: Thiếu thông tin câu hỏi"
                                  );
                                }
                              }}
                              className={selectedExamDetail?.active ? "hover:bg-gray-50" : "hover:bg-blue-50 transition-colors duration-300"}
                            />
                          </Tooltip>
                          <Tooltip title={selectedExamDetail?.active ? "Tính năng này không thể sử dụng khi đề thi đang hoạt động" : "Xóa"}>
                            <Button
                              type="text"
                              danger
                              disabled={selectedExamDetail?.active}
                              icon={<DeleteOutlined className={selectedExamDetail?.active ? "text-gray-400" : ""} />}
                              onClick={() => {
                                // Check if exam is active
                                if (selectedExamDetail?.active) {
                                  message.warning("Tính năng này không thể sử dụng khi đề thi đang hoạt động. Vui lòng vô hiệu hóa đề thi trước.");
                                  return;
                                }
                                
                                // Handle remove question from exam
                                confirm({
                                  title: "Xác nhận xóa",
                                  content:
                                    "Bạn có chắc chắn muốn xóa câu hỏi này khỏi bộ đề?",
                                  okText: "Xóa",
                                  okType: "danger",
                                  cancelText: "Hủy",
                                  onOk() {
                                    // Call the function to remove question
                                    if (selectedExamDetail) {
                                      handleRemoveQuestion(
                                        selectedExamDetail.id,
                                        record.question_id
                                      );
                                    }
                                  },
                                });
                              }}
                              className={selectedExamDetail?.active ? "hover:bg-gray-50" : "hover:bg-red-50 transition-colors duration-300"}
                            />
                          </Tooltip>
                        </Space>
                      ),
                    },
                  ]}
                />
              ) : (
                <div className="text-center text-gray-500 p-4">
                  Không có câu hỏi nào
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">Không có dữ liệu</div>
        )}
      </Drawer>

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <QuestionDetail
          question={selectedQuestion}
          isModalVisible={isQuestionDetailVisible}
          onClose={closeQuestionDetail}
        />
      )}

      {/* Question Modal */}
      <QuestionModal
        open={isQuestionModalVisible}
        onCancel={handleQuestionModalCancel}
        questionId={editingQuestionId || undefined}
        title={editingQuestionId ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
        zIndex={1001}
        refreshData={() => {
          // If we're in exam detail view, refresh the questions
          if (selectedExamDetail && examId) {
            fetchExamDetail(examId);
          }
        }}
        onSuccess={() => {
          setIsQuestionModalVisible(false);
          setEditingQuestionId(null);
        }}
        onQuestionCreated={handleQuestionCreated}
      />

      {/* Edit Exam Modal */}
      <Modal
        title="Chỉnh sửa bộ đề"
        open={isEditModalVisible}
        onCancel={handleEditModalCancel}
        onOk={() => editExamForm.submit()}
        confirmLoading={editExamLoading}
      >
        <Form form={editExamForm} layout="vertical" onFinish={handleEditExam}>
          <Form.Item
            name="title"
            label="Tên bộ đề"
            rules={[{ required: true, message: "Vui lòng nhập tên bộ đề!" }]}
          >
            <Input placeholder="Nhập tên bộ đề" />
          </Form.Item>
          <Form.Item
            name="active"
            label="Trạng thái"
            valuePropName="checked"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="subject"
            label="Môn học"
            rules={[{ required: true, message: "Vui lòng chọn môn học!" }]}
          >
            <Select placeholder="Chọn môn học">
              <Select.Option value="Toán">Toán</Select.Option>
              <Select.Option value="Ngữ văn">Ngữ văn</Select.Option>
              <Select.Option value="Tiếng Anh">Tiếng Anh</Select.Option>
              <Select.Option value="Vật lý">Vật lý</Select.Option>
              <Select.Option value="Hóa học">Hóa học</Select.Option>
              <Select.Option value="Sinh học">Sinh học</Select.Option>
              <Select.Option value="Lịch sử">Lịch sử</Select.Option>
              <Select.Option value="Địa lý">Địa lý</Select.Option>
              <Select.Option value="GDCD">GDCD</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="file_upload"
            label="Tải lên file"
          >
            <div className="flex items-center">
              <Upload
                name="file"
                accept=".docx"
                showUploadList={false}
                beforeUpload={async (file) => {
                  try {
                    // Show loading message
                    const loadingMessage = message.loading('Đang tải lên file...', 0);
                    
                    // Upload file using the uploadFile API
                    const url = await uploadFile(file);
                    
                    // Close loading message
                    loadingMessage();
                    
                    // Set the file_upload value in the form
                    editExamForm.setFieldsValue({ file_upload: url });
                    
                    // Show success message with filename
                    message.success(`Tải lên file ${file.name} thành công`);
                    
                    // Force form to re-render to show the uploaded file info
                    setForceUpdate({});
                    
                    console.log('File uploaded successfully:', url);
                  } catch (error) {
                    console.error('🔴 Upload file error:', error);
                    message.error('Tải lên file thất bại');
                  }
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Chọn file</Button>
              </Upload>
              {editExamForm.getFieldValue('file_upload') && (
                <div className="ml-4 flex items-center">
                  <CheckCircleOutlined className="text-green-500 mr-2" />
                  <span className="text-green-500">File đã được tải lên</span>
                  <Button 
                    type="text" 
                    icon={<CloseOutlined />} 
                    size="small"
                    className="ml-2"
                    onClick={() => {
                      editExamForm.setFieldsValue({ file_upload: null });
                      // Force form to re-render
                      setForceUpdate({});
                    }}
                  />
                </div>
              )}
            </div>
            <div className="mt-1 text-gray-500 text-sm">
              Hỗ trợ: .docx
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Question Repository Drawer */}
      {isRepositoryModalVisible && (
        <QuestionRepositoryDrawer
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
          confirmLoading={confirmLoading}
          QUESTION_TYPE={QUESTION_TYPE}
          onSearch={handleRepositorySearch}
          onQuestionTypeChange={handleRepositoryQuestionTypeChange}
          onSubjectChange={handleRepositorySubjectChange}
          onPageChange={handleRepositoryPageChange}
          onSelectAllQuestions={handleSelectAllQuestions}
          onSelectQuestion={handleSelectQuestion}
          onConfirmAdd={handleConfirmAddQuestions}
          onCancel={handleRepositoryModalCancel}
          onRefresh={fetchRepositoryQuestions}
          setPageSize={setRepositoryPageSize}
        />
      )}
    </>
  );
};

export default ExamDetailDrawer; 