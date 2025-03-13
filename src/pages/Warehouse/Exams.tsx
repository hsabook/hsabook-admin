import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Table,
  message,
  Select,
  Pagination,
  Space,
  Tooltip,
  Switch,
  Form,
  Drawer,
  Modal,
  Tag,
  Spin,
  Typography,
  Upload,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  ImportOutlined,
  EditOutlined,
  DeleteOutlined,
  DatabaseOutlined,
  CloseOutlined,
  SyncOutlined,
  EyeOutlined,
  UploadOutlined,
  CopyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  getExams,
  deleteExam,
  createExam,
  Exam,
  ExamsParams,
  CreateExamRequest,
  Question,
  removeQuestionsFromExam,
  updateExam,
  addQuestionToExam,
  getExamById,
  updateExamQuestions,
  importExams,
} from "../../api/exams";
import { getQuestions } from "../../api/questions/questionService";
import {
  HighSchoolSubjects,
  QUESTION_TYPE,
} from "../../components/QuestionModal/QuestionModal";
import QuestionModal from "../../components/QuestionModal";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import QuestionDetail from "../../components/QuestionDetail";
import CONFIG_APP from "../../utils/config";
import QuestionRepositoryDrawer from "./QuestionRepositoryDrawer";
import { uploadFile } from "../../api/upload/uploadService";
import ExamDetailDrawer from "../../components/ExamDetailDrawer";

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

interface ExamDetail extends Exam {
  exams_question: ExamQuestionEntity[];
}

const { Option } = Select;
const { confirm } = Modal;

const Exams: React.FC = () => {
  // State for managing exams data
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // State for add exam modal
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [addExamForm] = Form.useForm();
  const [addExamLoading, setAddExamLoading] = useState<boolean>(false);

  // State for questions table in add exam modal
  const [questions, setQuestions] = useState<Question[]>([]);

  // State for questions repository modal
  const [isRepositoryModalVisible, setIsRepositoryModalVisible] =
    useState<boolean>(false);
  const [repositoryQuestions, setRepositoryQuestions] = useState<Question[]>(
    []
  );
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [repositorySearchText, setRepositorySearchText] = useState<string>("");
  const [repositoryQuestionType, setRepositoryQuestionType] =
    useState<string>("");
  const [repositorySubject, setRepositorySubject] = useState<string>("");
  const [repositoryLoading, setRepositoryLoading] = useState<boolean>(false);
  const [repositoryTotal, setRepositoryTotal] = useState<number>(0);
  const [repositoryCurrentPage, setRepositoryCurrentPage] = useState<number>(1);
  const [repositoryPageSize, setRepositoryPageSize] = useState<number>(10);

  // State for question detail modal
  const [isQuestionDetailVisible, setIsQuestionDetailVisible] =
    useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionEntity | null>(null);

  // State for editing question
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [addQuestionLoading, setAddQuestionLoading] = useState<boolean>(false);

  console.log("🔍 editingQuestion:", editingQuestionId);

  // State for exam detail drawer
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState<boolean>(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  // State for edit exam modal
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [editExamForm] = Form.useForm();
  const [editExamLoading, setEditExamLoading] = useState<boolean>(false);

  // State for confirm loading
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  // State for force update
  const [forceUpdate, setForceUpdate] = useState<Record<string, any>>({});

  // Refs
  const fileUploadRef = React.useRef<any>(null);

  // Fetch exams data
  const fetchExams = async (params: ExamsParams = {}) => {
    try {
      setLoading(true);
      const response = await getExams({
        page: params.page || currentPage,
        take: params.take || pageSize,
        search: params.search !== undefined ? params.search : searchText,
        status: params.status !== undefined ? params.status : statusFilter,
      });

      console.log("📥 Exams fetchExams response:", response);

      // Add index to each exam for display
      const indexedData = response.data.map((exam, index) => ({
        ...exam,
        index: (response.page - 1) * response.limit + index + 1,
      }));

      setExams(indexedData);
      setTotal(response.total);
      setCurrentPage(response.page);
      setPageSize(response.limit);
    } catch (error) {
      console.error("🔴 Exams fetchExams error:", error);
      message.error("Failed to fetch exams data");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchExams();
  }, []);

  // Show exam detail drawer with the new component
  const showExamDetail = (examId: string) => {
    setSelectedExamId(examId);
    setIsDetailDrawerVisible(true);
  };

  // Close exam detail drawer
  const closeExamDetail = () => {
    setIsDetailDrawerVisible(false);
    setSelectedExamId(null);
  };

  // Handle toggle active status
  const handleToggleActive = async (record: Exam, checked: boolean) => {
    // Store original active state for potential rollback
    const originalActiveState = record.active;

    try {
      // Update local state immediately for better UX
      const updatedExams = exams.map((exam) => {
        if (exam.id === record.id) {
          return { ...exam, active: checked };
        }
        return exam;
      });
      setExams(updatedExams);

      // Create a minimal update payload with just the active status
      const updateData = {
        active: checked,
      };

      // Call API to update exam
      await updateExam(record.id, updateData);

      // Success message
      message.success(
        `${record.title} ${checked ? "Đã kích hoạt" : "Đã tắt"} thành công`
      );
    } catch (error) {
      console.error("🔴 Exams handleToggleActive error:", error);

      // Revert the local state change
      const revertedExams = exams.map((exam) => {
        if (exam.id === record.id) {
          return { ...exam, active: originalActiveState };
        }
        return exam;
      });
      setExams(revertedExams);

      // Show error message
      message.error("Không thể cập nhật trạng thái bộ đề");
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 80,
    },
    {
      title: "Bộ đề",
      dataIndex: "title",
      key: "title",
      sorter: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      render: (active: boolean, record: Exam) => {
        const isDocxToHtml =
          record.file_upload && record.status_exam === "docx_to_html";
          
        const isDocWainting =
          record.file_upload && record.status_exam === "await";

        return (
          <div className="flex items-center justify-center">
            {isDocWainting ? (
              <Tag color="blue" icon={<SyncOutlined spin />} style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                Chờ xử lý
              </Tag>
            ) : isDocxToHtml ? (
              <Tag color="blue" icon={<SyncOutlined spin />} style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                Docx to html
              </Tag>
            ) : (
              <Switch
                checked={active}
                onChange={(checked) => handleToggleActive(record, checked)}
                size="small"
              />
            )}
          </div>
        );
      },
    },
    {
      title: "ID bộ đề",
      dataIndex: "code_id",
      key: "code_id",
      render: (code_id: string) => (
        <div className="flex items-center">
          <span className="mr-1">{code_id}</span>
          <Tooltip title="Copy ID">
            <Button
              type="text"
              icon={<CopyOutlined style={{ fontSize: "14px" }} />}
              size="small"
              style={{ padding: "0 4px", height: "22px" }}
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(code_id);
                message.success("Đã sao chép ID bộ đề");
              }}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "File",
      dataIndex: "file_upload",
      key: "file_upload",
      render: (file_upload: string | null) => (
        <div className="flex items-center justify-center">
          {file_upload ? (
            <Tooltip title="Đã upload file">
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
            </Tooltip>
          ) : (
            <Tooltip title="Chưa upload file">
              <CloseOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Số câu hỏi",
      dataIndex: "total_question",
      key: "total_question",
    },
    {
      title: "Lần cuối cập nhật",
      dataIndex: "updated_at",
      key: "updated_at",
      sorter: true,
      render: (date: string) => {
        if (!date) return "-";

        const dateObj = new Date(date);

        // Format: DD/MM/YYYY HH:MM
        const day = dateObj.getDate().toString().padStart(2, "0");
        const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        const year = dateObj.getFullYear();
        const hours = dateObj.getHours().toString().padStart(2, "0");
        const minutes = dateObj.getMinutes().toString().padStart(2, "0");

        return `${day}/${month}/${year} ${hours}:${minutes}`;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_: any, record: Exam) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ fontSize: "14px" }} />}
              size="small"
              style={{ padding: "0 4px", height: "22px" }}
              onClick={(e) => {
                e.stopPropagation();
                showExamDetail(record.id);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined style={{ fontSize: "14px" }} />}
              size="small"
              style={{ padding: "0 4px", height: "22px" }}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(record.id);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchExams({ search: value, page: 1 });
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    fetchExams({ status: value, page: 1 });
  };

  // Handle refresh
  const handleRefresh = () => {
    setSearchText("");
    setStatusFilter("");
    fetchExams({ page: 1 });
  };

  // Handle page change
  const handlePageChange = (page: number, pageSize?: number) => {
    console.log(
      `📊 Exams handlePageChange page: ${page}, pageSize: ${pageSize}`
    );
    const newPageSize = pageSize || 10;
    fetchExams({ page, take: newPageSize });
  };

  // Handle delete exam
  const handleDelete = (id: string) => {
    confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa bộ đề này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteExam(id);
          message.success("Xóa bộ đề thành công");
          fetchExams();
        } catch (error: any) {
          console.error("🔴 Exams handleDelete error:", error);

          // Hiển thị thông báo lỗi từ backend nếu có
          if (
            error.response &&
            error.response.data &&
            error.response.data.message
          ) {
            message.error(error.response.data.message);
          } else {
            message.error("Xóa bộ đề thất bại");
          }
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Handle add exam modal
  const showAddModal = () => {
    setIsAddModalVisible(true);
    // Đặt giá trị mặc định cho môn học trong modal Thêm từ kho câu hỏi
    setRepositorySubject("Toán");
  };

  const handleAddModalCancel = () => {
    setIsAddModalVisible(false);
    addExamForm.resetFields();
    setQuestions([]);
  };

  // Handle add exam
  const handleAddExam = async (values: any) => {
    try {
      setAddExamLoading(true);

      const newExam: CreateExamRequest = {
        title: values.name,
        active: values.active || false,
        subject: values.subject || "Toán",
        questions: questions.map((q) => ({ id: q.id })),
        file_upload: values.file_upload || null,
      };

      console.log("📤 Exams handleAddExam payload:", newExam);

      const result = await createExam(newExam);
      console.log("📥 Exams handleAddExam response:", result);
      
      message.success("Thêm bộ đề thành công");
      setIsAddModalVisible(false);
      addExamForm.resetFields();
      setQuestions([]);
      fetchExams();
    } catch (error) {
      console.error("🔴 Exams handleAddExam error:", error);
      message.error("Failed to add exam");
    } finally {
      setAddExamLoading(false);
    }
  };

  // Handle add from repository
  const handleAddFromRepository = () => {
    setIsRepositoryModalVisible(true);
    setSelectedQuestionIds([]);
    // Reset filters
    setRepositorySearchText("");
    setRepositoryQuestionType("");
    setRepositorySubject("");
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

      if (repositoryQuestionType) {
        // Convert Lựa chọn một đáp án => AN_ANSWER
        try {
          const questionType = Object.values(QUESTION_TYPE).findIndex(
            (type) => type === repositoryQuestionType
          );
          params.type = Object.keys(QUESTION_TYPE)[questionType];
        } catch (error) {
          console.error("🔴 Exams fetchRepositoryQuestions error:", error);
          message.error("Failed to fetch questions");
        }
      }

      try {
        params.subject = Object.values(HighSchoolSubjects).find(
          (type) => type.title === repositorySubject
        )?.value;
      } catch (error) {
        console.error("🔴 Exams fetchRepositoryQuestions error:", error);
        message.error("Failed to fetch questions");
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
      console.error("🔴 Exams fetchRepositoryQuestions error:", error);
      message.error("Failed to fetch questions");
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
    // fetchRepositoryQuestions();
  };

  // Handle repository question type change
  const handleRepositoryQuestionTypeChange = (value: string) => {
    setRepositoryQuestionType(value);
    setRepositoryCurrentPage(1); // Reset to first page when filtering
    // fetchRepositoryQuestions();
  };

  // Handle repository subject change
  const handleRepositorySubjectChange = (value: string) => {
    setRepositorySubject(value);
    setRepositoryCurrentPage(1); // Reset to first page when filtering
    // fetchRepositoryQuestions();
  };

  // Handle repository page change
  const handleRepositoryPageChange = (page: number, pageSize?: number) => {
    setRepositoryCurrentPage(page);
    if (pageSize) setRepositoryPageSize(pageSize);
    // fetchRepositoryQuestions();
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
      // We're in create exam view, just update the local state
      // Add selected questions to the exam
      const selectedQuestions = repositoryQuestions.filter((q) =>
        selectedQuestionIds.includes(q.id)
      );

      // Chỉ lấy các thông tin cần thiết để hiển thị trong bảng câu hỏi của bộ đề
      const questionsToAdd = selectedQuestions.map((q) => ({
        id: q.id,
        code_id: q.code_id,
        content: q.content,
        type: q.type,
      }));

      setQuestions((prev) => {
        // Lọc ra các câu hỏi chưa có trong danh sách
        const newQuestions = questionsToAdd.filter(
          (newQ) => !prev.some((existingQ) => existingQ.id === newQ.id)
        );

        if (newQuestions.length === 0) {
          message.info("Các câu hỏi đã tồn tại trong bộ đề");
          return prev;
        }

        message.success(`Đã thêm ${newQuestions.length} câu hỏi vào bộ đề`);
        return [...prev, ...newQuestions];
      });

      handleRepositoryModalCancel();
    } catch (error) {
      console.error("🔴 Exams handleConfirmAddQuestions error:", error);
      message.error("Không thể thêm câu hỏi vào bộ đề");
    }
  };

  // Handle add new question
  const handleAddNewQuestion = () => {
    setIsQuestionModalVisible(true);
  };

  // Handle question created
  const handleQuestionCreated = async (newQuestion: any) => {
    // If repository modal is open, refresh the questions list
    if (isRepositoryModalVisible) {
      message.success("Câu hỏi mới đã được thêm vào kho câu hỏi");
    }

    const formattedRepositoryQuestion = {
      id: newQuestion.id,
      code_id: newQuestion.code_id || "",
      content: newQuestion.question,
      question: newQuestion.question,
      type: newQuestion.type,
      subject: newQuestion.subject || "",
      level: newQuestion.level,
      active: newQuestion.active,
      options: newQuestion.options || [],
      answers: newQuestion.answers || [],
    };
    // Update repository questions list
    setQuestions((prev) => [...prev, formattedRepositoryQuestion]);
    setRepositoryQuestions((prev) => [formattedRepositoryQuestion, ...prev]);
  };

  // Handle question modal cancel
  const handleQuestionModalCancel = () => {
    setIsQuestionModalVisible(false);
    setEditingQuestionId(null);
  };

  // Handle import questions
  const handleImportQuestions = () => {
    // Kích hoạt nút upload file thông qua ref
    if (fileUploadRef.current) {
      fileUploadRef.current.upload.uploader.onClick();
    } else {
      message.error("Không tìm thấy nút upload file");
    }
  };

  // Handle subject change in add exam form
  const handleExamSubjectChange = (value: string) => {
    // Cập nhật giá trị môn học cho modal Thêm từ kho câu hỏi
    setRepositorySubject(value);
  };

  // Empty data message
  const emptyText = "Không có dữ liệu!";

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

  // Prepare question for editing
  const prepareQuestionForEditing = (questionId: string) => {
    // Show loading message
    const loadingMessage = message.loading("Loading question details...", 0);

    // Set the editing question ID and open the modal
    setEditingQuestionId(questionId);
    setIsQuestionModalVisible(true);
    loadingMessage();
  };

  // Close question detail
  const closeQuestionDetail = () => {
    setIsQuestionDetailVisible(false);
    setSelectedQuestion(null);
  };

  // Show edit exam modal
  const showEditExamModal = () => {
    if (!selectedExamId) return;
    
    // Set form values - this would be handled by the ExamDetailDrawer component now
    // No need to duplicate this logic
  };

  return (
    <>
      <Card title="Bộ đề" className="h-full">
        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="Tìm kiếm"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={(e) =>
                handleSearch((e.target as HTMLInputElement).value)
              }
            />
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              style={{ width: 150 }}
            >
              <Option value="">Trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              Thêm đề
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={exams}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText }}
        />

        <div className="flex justify-end mt-4">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={handlePageChange}
            showSizeChanger
            showTotal={(total) => `${total} / page`}
          />
        </div>

        {/* Add Exam Drawer */}
        <Drawer
          title="Thêm mới bộ đề"
          open={isAddModalVisible}
          onClose={handleAddModalCancel}
          width={1000}
          zIndex={1000}
          extra={
            <Space>
              <Button onClick={handleAddModalCancel}>Hủy</Button>
              <Button
                type="primary"
                loading={addExamLoading}
                onClick={() => addExamForm.submit()}
                style={{ backgroundColor: "#22c55e" }}
              >
                Lưu
              </Button>
            </Space>
          }
        >
          <Form
            form={addExamForm}
            layout="vertical"
            onFinish={handleAddExam}
            className="bg-gray-50 p-6 rounded-md"
          >
            <div className="flex items-center justify-between mb-6">
              <Form.Item
                name="name"
                label={<span className="flex items-center"> Tên bộ đề</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập tên bộ đề!" },
                ]}
                className="mb-0 w-3/4"
              >
                <Input placeholder="Nhập tên bộ đề" />
              </Form.Item>

              <Form.Item
                name="active"
                valuePropName="checked"
                className="mb-0"
                initialValue={false}
              >
                <div className="flex items-center">
                  <span className="mr-2">Kích hoạt</span>
                  <Switch defaultChecked />
                </div>
              </Form.Item>
            </div>

            <Form.Item name="subject" label="Môn học" initialValue="Toán">
              <Select
                placeholder="Chọn môn học"
                onChange={handleExamSubjectChange}
              >
                {HighSchoolSubjects.map((subject) => (
                  <Option key={subject.value} value={subject.title}>
                    {subject.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="file_upload" label="Upload file">
              <div className="flex items-center">
                <Upload
                  name="file"
                  accept=".docx,.xlsx,.xls,.csv"
                  showUploadList={false}
                  beforeUpload={async (file) => {
                    try {
                      // Show loading message
                      const loadingMessage = message.loading('Đang upload file...', 0);
                      
                      // Check if this is an import operation (from Import button)
                      const isImportOperation = file.name.endsWith('.xlsx') || 
                                               file.name.endsWith('.xls') || 
                                               file.name.endsWith('.csv');
                      
                      if (isImportOperation) {
                        try {
                          // Import the file using the API
                          await importExams(file);
                          loadingMessage();
                          message.success('Import bộ đề thành công');
                          // Refresh the exams list
                          fetchExams();
                        } catch (importError: any) {
                          loadingMessage();
                          console.error('🔴 Exams import error:', importError);
                          
                          // Display error message from backend if available
                          if (importError.response && importError.response.data && importError.response.data.message) {
                            message.error(importError.response.data.message);
                          } else {
                            message.error('Import bộ đề thất bại');
                          }
                        }
                      } else {
                        // Upload file using the uploadFile API
                        const url = await uploadFile(file);
                        
                        // Close loading message
                        loadingMessage();
                        
                        // Set the file_upload value in the form
                        addExamForm.setFieldsValue({ file_upload: url });
                        
                        // Show success message with filename
                        message.success(`Upload file ${file.name} thành công`);
                        
                        console.log('File uploaded successfully:', url);
                      }
                    } catch (error) {
                      console.error('🔴 Upload file error:', error);
                      message.error('Upload file thất bại');
                    }
                    return false;
                  }}
                  ref={fileUploadRef}
                >
                  <Button icon={<UploadOutlined />}>Chọn file</Button>
                </Upload>
                {addExamForm.getFieldValue('file_upload') && (
                  <div className="ml-4 flex items-center">
                    <CheckCircleOutlined className="text-green-500 mr-2" />
                    <span className="text-green-500">File đã được tải lên</span>
                    <Button 
                      type="text" 
                      icon={<CloseOutlined />} 
                      size="small"
                      className="ml-2"
                      onClick={() => {
                        addExamForm.setFieldsValue({ file_upload: null });
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="mt-1 text-gray-500 text-sm">
                Hỗ trợ: .docx
              </div>
            </Form.Item>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Thêm câu hỏi</h3>
                <div className="flex gap-2">
                  <Button
                    icon={<DatabaseOutlined />}
                    onClick={handleAddFromRepository}
                  >
                    Thêm từ kho câu hỏi
                  </Button>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={handleAddNewQuestion}
                  >
                    Thêm mới
                  </Button>
                </div>
              </div>

              <Table
                columns={[
                  {
                    title: "STT",
                    dataIndex: "index",
                    key: "index",
                    width: 80,
                    render: (_, __, index) => index + 1,
                  },
                  {
                    title: "Câu hỏi",
                    dataIndex: "content",
                    key: "content",
                    render: (content: string) => (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: content || "Không có nội dung",
                        }}
                        className="max-h-20 overflow-y-auto"
                      />
                    ),
                  },
                  {
                    title: "Loại câu hỏi",
                    dataIndex: "type",
                    key: "type",
                    width: 180,
                    render: (type: string) => {
                      let color = "blue";
                      if (type === "Lựa chọn một đáp án") color = "green";
                      if (type === "Lựa chọn nhiều đáp án") color = "purple";
                      if (type === "Đúng/Sai") color = "orange";
                      if (type === "Nhập đáp án") color = "cyan";
                      if (type === "Đọc hiểu") color = "magenta";

                      return <Tag color={color}>{type}</Tag>;
                    },
                  },
                  {
                    title: "ID Câu hỏi",
                    dataIndex: "code_id",
                    key: "code_id",
                    width: 120,
                  },
                  {
                    title: "Thao tác",
                    key: "actions",
                    width: 80,
                    render: (_, record: Question, index) => (
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        size="small"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          const newQuestions = [...questions];
                          newQuestions.splice(index, 1);
                          setQuestions(newQuestions);
                        }}
                      />
                    ),
                  },
                ]}
                dataSource={questions}
                rowKey="id"
                pagination={false}
                locale={{ emptyText: "Không có dữ liệu!" }}
                className="border border-gray-200 rounded-md"
              />
            </div>
          </Form>
        </Drawer>

        {/* Question Repository Drawer */}
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

        {/* Replaced Exam Detail Drawer with the new component */}
        <ExamDetailDrawer
          examId={selectedExamId || undefined}
          visible={isDetailDrawerVisible}
          onClose={closeExamDetail}
          onExamUpdated={fetchExams}
          QUESTION_TYPE={QUESTION_TYPE}
          HighSchoolSubjects={HighSchoolSubjects}
        />

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
            if (selectedExamId) {
              fetchExams();
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
          onCancel={showEditExamModal}
          onOk={() => editExamForm.submit()}
          confirmLoading={editExamLoading}
        >
          <Form form={editExamForm} layout="vertical" onFinish={showEditExamModal}>
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
              label="Upload file"
            >
              <div className="flex items-center">
                <Upload
                  name="file"
                  accept=".docx,.xlsx,.xls,.csv"
                  showUploadList={false}
                  beforeUpload={async (file) => {
                    try {
                      // Show loading message
                      const loadingMessage = message.loading('Đang upload file...', 0);
                      
                      // Check if this is an import operation (from Import button)
                      const isImportOperation = file.name.endsWith('.xlsx') || 
                                               file.name.endsWith('.xls') || 
                                               file.name.endsWith('.csv');
                      
                      if (isImportOperation) {
                        try {
                          // Import the file using the API
                          await importExams(file);
                          loadingMessage();
                          message.success('Import bộ đề thành công');
                          // Refresh the exams list
                          fetchExams();
                        } catch (importError: any) {
                          loadingMessage();
                          console.error('🔴 Exams import error:', importError);
                          
                          // Display error message from backend if available
                          if (importError.response && importError.response.data && importError.response.data.message) {
                            message.error(importError.response.data.message);
                          } else {
                            message.error('Import bộ đề thất bại');
                          }
                        }
                      } else {
                        // Upload file using the uploadFile API
                        const url = await uploadFile(file);
                        
                        // Close loading message
                        loadingMessage();
                        
                        // Set the file_upload value in the form
                        editExamForm.setFieldsValue({ file_upload: url });
                        
                        // Show success message with filename
                        message.success(`Upload file ${file.name} thành công`);
                        
                        // Force form to re-render to show the uploaded file info
                        setForceUpdate({});
                        
                        console.log('File uploaded successfully:', url);
                      }
                    } catch (error) {
                      console.error('🔴 Upload file error:', error);
                      message.error('Upload file thất bại');
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
      </Card>
    </>
  );
};

export default Exams;
