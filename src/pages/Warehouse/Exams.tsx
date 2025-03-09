import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Table, message, Select, Pagination, Space, Tooltip, Switch, Form, Drawer, Modal, Checkbox, Tag, Spin, Typography } from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  PlusOutlined, 
  ImportOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  DatabaseOutlined,
  CloseOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { getExams, deleteExam, createExam, Exam, ExamsParams, CreateExamRequest, Question } from '../../api/exams';
import { getQuestions } from '../../api/questions/questionService';
import { HighSchoolSubjects, QUESTION_TYPE } from '../../components/QuestionModal/QuestionModal';
import QuestionModal from '../../components/QuestionModal';
import { createQuestion } from '../../api/questions/questionService';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import QuestionDetail from '../../components/QuestionDetail';
import QuestionContent from '../../components/QuestionDetail/QuestionContent';
import { removeQuestionsFromExam } from '../../api/exams/service';

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
const { Title, Text, Paragraph } = Typography;

const Exams: React.FC = () => {
  // State for managing exams data
  const [loading, setLoading] = useState<boolean>(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // State for add exam modal
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [addExamForm] = Form.useForm();
  const [addExamLoading, setAddExamLoading] = useState<boolean>(false);
  
  // State for questions table in add exam modal
  const [questions, setQuestions] = useState<Question[]>([]);

  // State for questions repository modal
  const [isRepositoryModalVisible, setIsRepositoryModalVisible] = useState<boolean>(false);
  const [repositoryQuestions, setRepositoryQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [repositorySearchText, setRepositorySearchText] = useState<string>('');
  const [repositoryQuestionType, setRepositoryQuestionType] = useState<string>('');
  const [repositorySubject, setRepositorySubject] = useState<string>('');
  const [repositoryLoading, setRepositoryLoading] = useState<boolean>(false);
  const [repositoryTotal, setRepositoryTotal] = useState<number>(0);
  const [repositoryCurrentPage, setRepositoryCurrentPage] = useState<number>(1);
  const [repositoryPageSize, setRepositoryPageSize] = useState<number>(10);

  // State for add question modal
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState<boolean>(false);
  const [addQuestionLoading, setAddQuestionLoading] = useState<boolean>(false);

  // State for exam detail drawer
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState<boolean>(false);
  const [selectedExamDetail, setSelectedExamDetail] = useState<ExamDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  
  // State for question detail modal
  const [isQuestionDetailVisible, setIsQuestionDetailVisible] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionEntity | null>(null);

  // Fetch exams data
  const fetchExams = async (params: ExamsParams = {}) => {
    try {
      setLoading(true);
      const response = await getExams({
        page: currentPage,
        take: pageSize,
        search: searchText,
        status: statusFilter,
        ...params
      });
      
      // Add index to each exam for STT column
      const indexedData = response.data.map((exam, index) => ({
        ...exam,
        index: (response.page - 1) * response.limit + index + 1
      }));
      
      setExams(indexedData);
      setTotal(response.total);
      setCurrentPage(response.page);
      setPageSize(response.limit);
    } catch (error) {
      console.error('🔴 Exams fetchExams error:', error);
      message.error('Failed to fetch exams data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchExams();
  }, []);

  // Fetch exam detail
  const fetchExamDetail = async (examId: string) => {
    try {
      setDetailLoading(true);
      const response = await axios.get(`https://hsabook-backend-dev.up.railway.app/exams/${examId}`, {
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${useAuthStore.getState().accessToken}`
        }
      });
      
      if (response.data && response.data.data) {
        setSelectedExamDetail(response.data.data);
      } else {
        message.error('Failed to fetch exam details');
      }
    } catch (error) {
      console.error('🔴 Exams fetchExamDetail error:', error);
      message.error('Failed to fetch exam details');
    } finally {
      setDetailLoading(false);
    }
  };

  // Show exam detail drawer
  const showExamDetail = (examId: string) => {
    setIsDetailDrawerVisible(true);
    fetchExamDetail(examId);
  };

  // Close exam detail drawer
  const closeExamDetail = () => {
    setIsDetailDrawerVisible(false);
    setSelectedExamDetail(null);
  };

  // Table columns configuration
  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 80,
    },
    {
      title: 'Bộ đề',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <span className={`px-2 py-1 rounded text-xs ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {active ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      ),
    },
    {
      title: 'ID bộ đề',
      dataIndex: 'code_id',
      key: 'code_id',
    },
    {
      title: 'Số câu hỏi',
      dataIndex: 'total_question',
      key: 'total_question',
    },
    {
      title: 'Lần cuối cập nhật',
      dataIndex: 'updated_at',
      key: 'updated_at',
      sorter: true,
      render: (date: string) => {
        if (!date) return '-';
        
        const dateObj = new Date(date);
        
        // Format: DD/MM/YYYY HH:MM
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_: any, record: Exam) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                showExamDetail(record.id);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                // Handle edit
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
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
    setSearchText('');
    setStatusFilter('');
    fetchExams({ page: 1 });
  };

  // Handle page change
  const handlePageChange = (page: number, pageSize?: number) => {
    console.log(`📊 Exams handlePageChange page: ${page}, pageSize: ${pageSize}`);
    const newPageSize = pageSize || 10;
    fetchExams({ page, take: newPageSize });
  };

  // Handle delete
  const handleDelete = (id: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa bộ đề này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(true);
          await deleteExam(id);
          message.success('Đã xóa bộ đề thành công');
          fetchExams();
        } catch (error) {
          console.error(`🔴 Exams handleDelete error for id ${id}:`, error);
          message.error('Failed to delete exam');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Handle import
  const handleImport = () => {
    message.info('Chức năng import đang được phát triển');
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
        subject: values.subject || 'Toán',
        questions: questions.map(q => ({ id: q.id }))
      };
      
      console.log('Payload gửi lên:', newExam);
      
      await createExam(newExam);
      message.success('Thêm bộ đề thành công');
      setIsAddModalVisible(false);
      addExamForm.resetFields();
      setQuestions([]);
      fetchExams();
    } catch (error) {
      console.error('🔴 Exams handleAddExam error:', error);
      message.error('Failed to add exam');
    } finally {
      setAddExamLoading(false);
    }
  };

  // Handle add question from repository
  const handleAddFromRepository = () => {
    // Lấy giá trị môn học từ form Thêm mới bộ đề
    const currentSubject = addExamForm.getFieldValue('subject');
    
    // Đặt giá trị môn học cho modal Thêm từ kho câu hỏi
    setRepositorySubject(currentSubject);
    // setRepositoryQuestionType(currentSubject);
    
    setIsRepositoryModalVisible(true);
    fetchRepositoryQuestions();
  };

  // Fetch questions from repository
  const fetchRepositoryQuestions = async () => {
    try {
      setRepositoryLoading(true);
      
      const params: any = {
        take: repositoryPageSize,
        page: repositoryCurrentPage
      };
      
      // Add filters if they exist
      if (repositorySearchText) {
        params.search = repositorySearchText;
      }
      
      if (repositoryQuestionType) {
        // Convert Lựa chọn một đáp án => AN_ANSWER
        try {
          const questionType = Object.values(QUESTION_TYPE).findIndex(type => type === repositoryQuestionType)
        params.type = Object.keys(QUESTION_TYPE)[questionType]
        } catch (error) {
          console.error('🔴 Exams fetchRepositoryQuestions error:', error);
          message.error('Failed to fetch questions');
        }
      }

      
      try {
        params.subject = Object.values(HighSchoolSubjects).find(type => type.title === repositorySubject)?.value;
      } catch (error) {
        console.error('🔴 Exams fetchRepositoryQuestions error:', error);
        message.error('Failed to fetch questions');
      }
      
      console.log('Params:', params);
      
      const response = await getQuestions(params);
      
      // Transform API response data
      const transformedData = response.data.data.map((item: any, index: number) => ({
        id: item.id,
        code_id: item.code_id,
        content: item.question,
        type: item.type,
        subject: item.subject,
        index: (response.data.pagination.current_page - 1) * response.data.pagination.take + index + 1
      }));
      
      setRepositoryQuestions(transformedData);
      setRepositoryTotal(response.data.pagination.total);
      setRepositoryCurrentPage(response.data.pagination.current_page);
      
    } catch (error) {
      console.error('🔴 Exams fetchRepositoryQuestions error:', error);
      message.error('Failed to fetch questions');
    } finally {
      setRepositoryLoading(false);
    }
  };
  
  // Handle repository modal cancel
  const handleRepositoryModalCancel = () => {
    setIsRepositoryModalVisible(false);
    setSelectedQuestionIds([]);
    setRepositorySearchText('');
    setRepositoryQuestionType('');
    setRepositorySubject('');
  };
  
  // Call fetchRepositoryQuestions when these states change
  useEffect(() => {
    if (isRepositoryModalVisible) {
      fetchRepositoryQuestions();
    }
  }, [repositorySearchText, repositoryQuestionType, repositorySubject, repositoryCurrentPage, repositoryPageSize]);

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
      const selectedIds = selectedRows.map(row => row.id);
      setSelectedQuestionIds(selectedIds);
    } else {
      setSelectedQuestionIds([]);
    }
  };

  // Handle select question
  const handleSelectQuestion = (record: any, selected: boolean) => {
    if (selected) {
      setSelectedQuestionIds(prev => [...prev, record.id]);
    } else {
      setSelectedQuestionIds(prev => prev.filter(id => id !== record.id));
    }
  };

  // Handle confirm add questions
  const handleConfirmAddQuestions = () => {
    if (selectedQuestionIds.length === 0) {
      message.warning('Vui lòng chọn ít nhất một câu hỏi');
      return;
    }
    
    // Add selected questions to the exam
    const selectedQuestions = repositoryQuestions.filter(q => selectedQuestionIds.includes(q.id));
    
    // Chỉ lấy các thông tin cần thiết để hiển thị trong bảng câu hỏi của bộ đề
    const questionsToAdd = selectedQuestions.map(q => ({
      id: q.id,
      code_id: q.code_id,
      content: q.content,
      type: q.type
    }));
    
    setQuestions(prev => {
      // Lọc ra các câu hỏi chưa có trong danh sách
      const newQuestions = questionsToAdd.filter(
        newQ => !prev.some(existingQ => existingQ.id === newQ.id)
      );
      
      if (newQuestions.length === 0) {
        message.info('Các câu hỏi đã tồn tại trong bộ đề');
        return prev;
      }
      
      message.success(`Đã thêm ${newQuestions.length} câu hỏi vào bộ đề`);
      return [...prev, ...newQuestions];
    });
    
    handleRepositoryModalCancel();
  };

  // Handle add new question
  const handleAddNewQuestion = () => {
    setIsQuestionModalVisible(true);
  };

  // Handle question modal cancel
  const handleQuestionModalCancel = () => {
    setIsQuestionModalVisible(false);
  };

  // Handle add question submit
  const handleAddQuestion = async (values: any) => {
    try {
      setAddQuestionLoading(true);

      // Validate question content
      if (!values.content || values.content.includes('tox-placeholder') || values.content.trim() === '<p>&nbsp;</p>') {
        message.error('Please enter question content');
        setAddQuestionLoading(false);
        return;
      }

      const getAnswerLetter = (index: number) => String.fromCharCode(65 + index);

      let options: any[] = [];
      let answers: string[] = [];

      const answersArray = Array.isArray(values.answers) ? values.answers : [];

      if (values.questionType === 'AN_ANSWER') {
        // Validate that at least one answer is selected as correct
        const correctIndex = answersArray.findIndex((a: any) => a.isCorrect);
        if (correctIndex < 0 && answersArray.length > 0) {
          message.error('Please select a correct answer');
          setAddQuestionLoading(false);
          return;
        }

        options = answersArray.map((answer: any, index: number) => ({
          checked: answer.isCorrect,
          answer: answer.content,
          value: answer.content,
          type: getAnswerLetter(index)
        }));

        if (correctIndex >= 0) {
          answers = [getAnswerLetter(correctIndex)];
        }
      } else if (values.questionType === 'MULTIPLE_ANSWERS') {
        // Validate that at least one answer is selected as correct for multiple choice
        const correctAnswers = answersArray.filter((a: any) => a.isCorrect);
        if (correctAnswers.length === 0 && answersArray.length > 0) {
          message.error('Please select at least one correct answer');
          setAddQuestionLoading(false);
          return;
        }

        options = answersArray.map((answer: any, index: number) => ({
          checked: answer.isCorrect,
          answer: answer.content,
          value: answer.content,
          type: getAnswerLetter(index)
        }));

        answers = answersArray
          .map((answer: any, index: number) => answer.isCorrect ? getAnswerLetter(index) : null)
          .filter(Boolean);
      }

      const questionTypeMap: Record<string, string> = {
        'AN_ANSWER': 'Lựa chọn một đáp án',
        'MULTIPLE_ANSWERS': 'Lựa chọn nhiều đáp án',
        'TRUE_FALSE': 'Đúng/Sai',
        'ENTER_ANSWER': 'Nhập đáp án',
        'READ_UNDERSTAND': 'Đọc hiểu'
      };

      const difficultyMap: Record<string, string> = {
        'easy': 'easy',
        'medium': 'normal',
        'hard': 'hard'
      };

      const payload = {
        active: values.active !== undefined ? values.active : true,
        subject: values.subject,
        level: difficultyMap[values.difficulty] || 'normal',
        video: values.embedVideo || values.videoUrl || '',
        question: values.content,
        type: questionTypeMap[values.questionType],
        solution: values.solution || '',
        options: options.length > 0 ? options : [],
        answers: answers.length > 0 ? answers : []
      };

      console.log('📝 Exams handleAddQuestion payload:', payload);

      // Show loading message
      const loadingMessage = message.loading('Creating new question...', 0);

      try {
        // Create new question
        const response = await createQuestion(payload);
        loadingMessage();
        
        // Check if response contains the expected data structure
        if (!response || !response.id) {
          console.error('Invalid response from API:', response);
          message.error('Failed to create question: Invalid response from server');
          return;
        }
        
        // Log the full response for debugging
        console.log('📝 Exams API response:', response);
        
        message.success('Question created successfully');
        
        // Add the new question to the questions list with data from API response
        const responseData = response as any;
        
        // Create a question object for the table
        // Using type assertion to handle the code_id property
        const newQuestionForTable = {
          id: responseData.id,
          content: responseData.question || values.content,
          type: responseData.type || questionTypeMap[values.questionType],
          code_id: responseData.code_id || ''
        } as Question;
        
        // Log the question details for debugging
        console.log('📝 Exams adding new question to table:', newQuestionForTable);
        
        setQuestions(prev => [...prev, newQuestionForTable]);
        setIsQuestionModalVisible(false);
      } catch (error) {
        loadingMessage();
        console.error('Error creating question:', error);
        message.error(`Failed to create question: ${(error as any)?.message || 'Unknown error'}`);
      }
    } catch (validationError) {
      console.error('Validation failed:', validationError);
      message.error('Please check the question information');
    } finally {
      setAddQuestionLoading(false);
    }
  };

  // Handle import questions
  const handleImportQuestions = () => {
    message.info('Chức năng import câu hỏi đang được phát triển');
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
      updated_at: question.updated_at || new Date().toISOString()
    };
    
    setSelectedQuestion(enhancedQuestion);
    setIsQuestionDetailVisible(true);
  };

  // Close question detail
  const closeQuestionDetail = () => {
    setIsQuestionDetailVisible(false);
    setSelectedQuestion(null);
  };

  // Handle remove question from exam
  const handleRemoveQuestion = async (examId: string, questionId: string) => {
    try {
      setDetailLoading(true);
      
      // Call API to remove question from exam using the service function
      const response = await removeQuestionsFromExam(examId, [questionId]);
      
      if (response && response.status_code === 200) {
        message.success('Đã xóa câu hỏi khỏi bộ đề');
        
        // Refresh exam detail to update the question list
        if (selectedExamDetail) {
          fetchExamDetail(examId);
        }
      } else {
        message.error('Không thể xóa câu hỏi khỏi bộ đề');
      }
    } catch (error) {
      console.error('🔴 Exams handleRemoveQuestion error:', error);
      message.error('Không thể xóa câu hỏi khỏi bộ đề');
    } finally {
      setDetailLoading(false);
    }
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
              onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
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
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>Làm mới</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>Thêm đề</Button>
            <Button icon={<ImportOutlined />} onClick={handleImport}>Import</Button>
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
          extra={
            <Space>
              <Button onClick={handleAddModalCancel}>
                Hủy
              </Button>
              <Button
                type="primary"
                loading={addExamLoading}
                onClick={() => addExamForm.submit()}
                style={{ backgroundColor: '#22c55e' }}
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
                rules={[{ required: true, message: 'Vui lòng nhập tên bộ đề!' }]}
                className="mb-0 w-3/4"
              >
                <Input placeholder="Nhập tên bộ đề" />
              </Form.Item>
              
              <Form.Item name="active" valuePropName="checked" className="mb-0" initialValue={false}>
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
                {HighSchoolSubjects.map(subject => (
                  <Option key={subject.value} value={subject.title}>
                    {subject.title}
                  </Option>
                ))}
              </Select>
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
                  <Button 
                    icon={<ImportOutlined />} 
                    onClick={handleImportQuestions}
                  >
                    Import
                  </Button>
                </div>
              </div>
              
              <Table
                columns={[
                  {
                    title: 'STT',
                    dataIndex: 'index',
                    key: 'index',
                    width: 80,
                    render: (_, __, index) => index + 1
                  },
                  {
                    title: 'Câu hỏi',
                    dataIndex: 'content',
                    key: 'content',
                    render: (content: string) => (
                      <div 
                        dangerouslySetInnerHTML={{ __html: content || 'Không có nội dung' }} 
                        className="max-h-20 overflow-y-auto"
                      />
                    ),
                  },
                  {
                    title: 'Loại câu hỏi',
                    dataIndex: 'type',
                    key: 'type',
                    width: 180,
                    render: (type: string) => {
                      let color = 'blue';
                      if (type === 'Lựa chọn một đáp án') color = 'green';
                      if (type === 'Lựa chọn nhiều đáp án') color = 'purple';
                      if (type === 'Đúng/Sai') color = 'orange';
                      if (type === 'Nhập đáp án') color = 'cyan';
                      if (type === 'Đọc hiểu') color = 'magenta';
                      
                      return <Tag color={color}>{type}</Tag>;
                    }
                  },
                  {
                    title: 'ID Câu hỏi',
                    dataIndex: 'code_id',
                    key: 'code_id',
                    width: 120,
                  },
                  {
                    title: 'Thao tác',
                    key: 'actions',
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
                    )
                  }
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

        {/* Question Repository Modal */}
        <Modal
          title={<div className="text-xl">Thêm câu hỏi vào bộ đề</div>}
          open={isRepositoryModalVisible}
          onCancel={handleRepositoryModalCancel}
          width={1000}
          footer={[
            <Button key="cancel" onClick={handleRepositoryModalCancel}>
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleConfirmAddQuestions}
              style={{ backgroundColor: '#22c55e' }}
            >
              Xác nhận
            </Button>,
          ]}
          closeIcon={<CloseOutlined />}
        >
          <div className="mb-4">
            <p className="mb-4 text-gray-600">Chọn câu hỏi để thêm vào bộ đề</p>
            
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <Input 
                placeholder="Tìm kiếm" 
                prefix={<SearchOutlined />} 
                style={{ width: 250 }}
                value={repositorySearchText}
                onChange={(e) => setRepositorySearchText(e.target.value)}
                onPressEnter={(e) => handleRepositorySearch((e.target as HTMLInputElement).value)}
              />
              
              <Select 
                placeholder="Loại câu hỏi"
                style={{ width: 200 }}
                value={repositoryQuestionType}
                onChange={handleRepositoryQuestionTypeChange}
                allowClear
              >
                {Object.values(QUESTION_TYPE).map(type => (
                  <Select.Option key={type} value={type}>
                    {type}
                  </Select.Option>
                ))}
              </Select>
              
              <Select 
                placeholder="Môn học"
                style={{ width: 200 }}
                value={repositorySubject}
                onChange={handleRepositorySubjectChange}
                allowClear
              >
                {HighSchoolSubjects.map(subject => (
                  <Select.Option key={subject.value} value={subject.title}>
                    {subject.title}
                  </Select.Option>
                ))}
              </Select>
              
              <Button 
                icon={<SyncOutlined />} 
                onClick={() => fetchRepositoryQuestions()}
                loading={repositoryLoading}
                className="ml-auto"
              >
                Làm mới
              </Button>
            </div>
            
            <Table
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys: selectedQuestionIds,
                columnWidth: 60,
                onSelectAll: handleSelectAllQuestions,
                onSelect: handleSelectQuestion
              }}
              columns={[
                {
                  title: 'Câu hỏi',
                  dataIndex: 'content',
                  key: 'content',
                  render: (content: string) => (
                    <div 
                      dangerouslySetInnerHTML={{ __html: content || 'Không có nội dung' }} 
                      className="max-h-20 overflow-y-auto"
                    />
                  ),
                },
                {
                  title: 'Loại câu hỏi',
                  dataIndex: 'type',
                  key: 'type',
                  width: 180,
                  render: (type: string) => {
                    let color = 'blue';
                    if (type === 'Lựa chọn một đáp án') color = 'green';
                    if (type === 'Lựa chọn nhiều đáp án') color = 'purple';
                    if (type === 'Đúng/Sai') color = 'orange';
                    if (type === 'Nhập đáp án') color = 'cyan';
                    if (type === 'Đọc hiểu') color = 'magenta';
                    
                    return <Tag color={color}>{type}</Tag>;
                  }
                },
                {
                  title: 'Môn học',
                  dataIndex: 'subject',
                  key: 'subject',
                  width: 120,
                  render: (subject: string) => {
                    let color = 'blue';
                    if (subject === 'Toán') color = 'blue';
                    if (subject === 'Ngữ văn') color = 'green';
                    if (subject === 'Tiếng Anh') color = 'purple';
                    if (subject === 'Vật lý') color = 'orange';
                    if (subject === 'Hóa học') color = 'red';
                    if (subject === 'Sinh học') color = 'cyan';
                    
                    return <Tag color={color}>{subject}</Tag>;
                  }
                },
                {
                  title: 'ID Câu hỏi',
                  dataIndex: 'code_id',
                  key: 'code_id',
                  width: 120,
                },
              ]}
              dataSource={repositoryQuestions}
              rowKey="id"
              loading={repositoryLoading}
              pagination={false}
              locale={{ emptyText: "Không có dữ liệu!" }}
              className="border border-gray-200 rounded-md"
              rowClassName={(record) => selectedQuestionIds.includes(record.id) ? 'bg-green-50' : 'hover:bg-gray-50'}
              onRow={(record) => ({
                onClick: () => {
                  // Toggle selection when clicking on row
                  if (selectedQuestionIds.includes(record.id)) {
                    setSelectedQuestionIds(prev => prev.filter(id => id !== record.id));
                  } else {
                    setSelectedQuestionIds(prev => [...prev, record.id]);
                  }
                },
                style: { cursor: 'pointer' }
              })}
            />
            
            <div className="flex items-center justify-between mt-4">
              <div>
                {repositoryTotal > 0 && (
                  <span className="text-gray-600">{repositoryCurrentPage} / page</span>
                )}
              </div>
              <div className="flex items-center">
                <Button 
                  type="text" 
                  disabled={repositoryCurrentPage <= 1}
                  onClick={() => handleRepositoryPageChange(repositoryCurrentPage - 1)}
                >
                  &lt;
                </Button>
                <Button type="text" className="mx-2 bg-green-500 text-white">
                  {repositoryCurrentPage}
                </Button>
                <Button 
                  type="text"
                  disabled={repositoryCurrentPage >= Math.ceil(repositoryTotal / repositoryPageSize)}
                  onClick={() => handleRepositoryPageChange(repositoryCurrentPage + 1)}
                >
                  &gt;
                </Button>
                
                <Select
                  className="ml-4"
                  value={`${repositoryPageSize} / page`}
                  style={{ width: 120 }}
                  onChange={(value) => {
                    const newPageSize = parseInt(value.split(' ')[0]);
                    setRepositoryPageSize(newPageSize);
                    handleRepositoryPageChange(1, newPageSize);
                  }}
                >
                  <Select.Option value="10 / page">10 / page</Select.Option>
                  <Select.Option value="20 / page">20 / page</Select.Option>
                  <Select.Option value="50 / page">50 / page</Select.Option>
                </Select>
              </div>
            </div>
          </div>
        </Modal>
      </Card>

      {/* Exam Detail Drawer */}
      <Drawer
        title={
          <div className="flex items-center">
            <span className="mr-2">{selectedExamDetail?.title || 'Chi tiết bộ đề'}</span>
            {selectedExamDetail?.active && (
              <Tag color="green">Hoạt động</Tag>
            )}
            {!selectedExamDetail?.active && (
              <Tag color="red">Không hoạt động</Tag>
            )}
          </div>
        }
        placement="right"
        width={800}
        onClose={closeExamDetail}
        open={isDetailDrawerVisible}
        extra={
          <Space>
            <Button onClick={closeExamDetail}>Đóng</Button>
            {selectedExamDetail && (
              <Button type="primary" onClick={() => {
                // Handle edit exam
              }}>
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
                  <div className="font-medium">{selectedExamDetail.code_id}</div>
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
                      {selectedExamDetail.active ? "Hoạt động" : "Không hoạt động"}
                    </Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Ngày tạo:</Text>
                  <div className="font-medium">
                    {new Date(selectedExamDetail.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Cập nhật lần cuối:</Text>
                  <div className="font-medium">
                    {new Date(selectedExamDetail.updated_at).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Số câu hỏi:</Text>
                  <div className="font-medium">
                    {selectedExamDetail.exams_question?.length || 0}
                  </div>
                </div>
              </div>
            </div>

            {selectedExamDetail.description && (
              <div>
                <Title level={5}>Mô tả</Title>
                <div 
                  dangerouslySetInnerHTML={{ __html: selectedExamDetail.description }} 
                  className="p-3 bg-gray-50 rounded mt-2"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between items-center">
                <Title level={5}>Danh sách câu hỏi</Title>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => {
                    // Handle add question to exam
                  }}
                >
                  Thêm câu hỏi
                </Button>
              </div>
              {selectedExamDetail.exams_question && selectedExamDetail.exams_question.length > 0 ? (
                <Table
                  dataSource={selectedExamDetail.exams_question}
                  rowKey="id"
                  pagination={false}
                  className="mt-4"
                  columns={[
                    {
                      title: 'STT',
                      key: 'index',
                      width: 60,
                      render: (_, __, index) => index + 1,
                    },
                    {
                      title: 'Mã câu hỏi',
                      dataIndex: ['question', 'code_id'],
                      key: 'code_id',
                      width: 120,
                    },
                    {
                      title: 'Nội dung câu hỏi',
                      dataIndex: ['question', 'question'],
                      key: 'question',
                      render: (_, record: ExamQuestionEntity) => (
                        <div 
                          dangerouslySetInnerHTML={{ __html: record.question?.question || 'Không có nội dung' }} 
                          className="max-h-20 overflow-y-auto"
                        />
                      ),
                    },
                    {
                      title: 'Loại câu hỏi',
                      dataIndex: ['question', 'type'],
                      key: 'type',
                      width: 180,
                      render: (_, record: ExamQuestionEntity) => {
                        const type = record.question?.type || '';
                        let color = 'blue';
                        if (type === 'Lựa chọn một đáp án') color = 'green';
                        if (type === 'Lựa chọn nhiều đáp án') color = 'purple';
                        if (type === 'Đúng/Sai') color = 'orange';
                        if (type === 'Nhập đáp án') color = 'cyan';
                        if (type === 'Đọc hiểu') color = 'magenta';
                        
                        return <Tag color={color}>{type}</Tag>;
                      }
                    },
                    {
                      title: 'Môn học',
                      dataIndex: ['question', 'subject'],
                      key: 'subject',
                      width: 120,
                      render: (_, record: ExamQuestionEntity) => {
                        const subject = record.question?.subject || '';
                        let color = 'blue';
                        if (subject === 'Toán') color = 'blue';
                        if (subject === 'Ngữ văn') color = 'green';
                        if (subject === 'Tiếng Anh') color = 'purple';
                        if (subject === 'Vật lý') color = 'orange';
                        if (subject === 'Hóa học') color = 'red';
                        if (subject === 'Sinh học') color = 'cyan';
                        
                        return <Tag color={color}>{subject}</Tag>;
                      }
                    },
                    {
                      title: 'Thao tác',
                      key: 'action',
                      width: 120,
                      render: (_, record: ExamQuestionEntity) => (
                        <Space>
                          <Button 
                            type="link" 
                            onClick={() => {
                              // Show question detail using the new component
                              showQuestionDetail(record.question);
                            }}
                          >
                            Chi tiết
                          </Button>
                          <Button 
                            type="link" 
                            danger
                            onClick={() => {
                              // Handle remove question from exam
                              confirm({
                                title: 'Xác nhận xóa câu hỏi',
                                content: 'Bạn có chắc chắn muốn xóa câu hỏi này khỏi bộ đề?',
                                okText: 'Xóa',
                                okType: 'danger',
                                cancelText: 'Hủy',
                                onOk() {
                                  // Call the function to remove question
                                  handleRemoveQuestion(selectedExamDetail.id, record.question_id);
                                },
                              });
                            }}
                          >
                            Xóa
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              ) : (
                <div className="text-center text-gray-500 p-4">Không có câu hỏi nào</div>
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
        onSubmit={handleAddQuestion}
        title="Add New Question"
      />
    </>
  );
};

export default Exams;