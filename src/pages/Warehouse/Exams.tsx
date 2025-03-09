import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Table, message, Select, Pagination, Space, Tooltip, Switch, Form, Drawer, Modal, Checkbox } from 'antd';
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
  CloseOutlined
} from '@ant-design/icons';
import { getExams, deleteExam, createExam, Exam, ExamsParams, CreateExamRequest, Question } from '../../api/exams';
import { getQuestions } from '../../api/questions/questionService';
import { HighSchoolSubjects, QUESTION_TYPE } from '../../components/QuestionModal/QuestionModal';

const { Option } = Select;
const { confirm } = Modal;

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
      key: 'actions',
      width: 120,
      render: (_: any, record: Exam) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small" 
              className="text-blue-500 hover:text-blue-700"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              className="text-green-500 hover:text-green-700" 
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              size="small" 
              className="text-red-500 hover:text-red-700"
              onClick={() => handleDelete(record.id)}
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
          fetchExams({ page: 1 });
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
        params.type = repositoryQuestionType;
      }
      
      if (repositorySubject) {
        params.subject = repositorySubject;
      }
      
      const response = await getQuestions(params);
      
      // Add index to each question for STT column
      const indexedData = response.data.data.map((question: any, index: number) => ({
        ...question,
        index: (response.data.pagination.current_page - 1) * response.data.pagination.take + index + 1
      }));
      
      setRepositoryQuestions(indexedData);
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

  // Handle repository search
  const handleRepositorySearch = (value: string) => {
    setRepositorySearchText(value);
    setRepositoryCurrentPage(1); // Reset to first page when searching
    fetchRepositoryQuestions();
  };

  // Handle repository question type change
  const handleRepositoryQuestionTypeChange = (value: string) => {
    setRepositoryQuestionType(value);
    setRepositoryCurrentPage(1); // Reset to first page when filtering
    fetchRepositoryQuestions();
  };

  // Handle repository subject change
  const handleRepositorySubjectChange = (value: string) => {
    setRepositorySubject(value);
    setRepositoryCurrentPage(1); // Reset to first page when filtering
    fetchRepositoryQuestions();
  };

  // Handle repository page change
  const handleRepositoryPageChange = (page: number, pageSize?: number) => {
    setRepositoryCurrentPage(page);
    if (pageSize) setRepositoryPageSize(pageSize);
    fetchRepositoryQuestions();
  };

  // Handle select all questions
  const handleSelectAllQuestions = (e: any) => {
    if (e.target.checked) {
      setSelectedQuestionIds(repositoryQuestions.map(q => q.id));
    } else {
      setSelectedQuestionIds([]);
    }
  };

  // Handle select question
  const handleSelectQuestion = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    } else {
      setSelectedQuestionIds(selectedQuestionIds.filter(qId => qId !== id));
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
    setQuestions(prev => [...prev, ...selectedQuestions]);
    
    message.success(`Đã thêm ${selectedQuestionIds.length} câu hỏi vào bộ đề`);
    handleRepositoryModalCancel();
  };

  // Handle add new question
  const handleAddNewQuestion = () => {
    message.info('Chức năng thêm mới câu hỏi đang được phát triển');
  };

  // Handle import questions
  const handleImportQuestions = () => {
    message.info('Chức năng import câu hỏi đang được phát triển');
  };

  // Empty data message
  const emptyText = "Không có dữ liệu!";

  return (
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
              rules={[{ required: true, message: 'Please input exam name!' }]}
              className="mb-0 w-3/4"
            >
              <Input placeholder="Nhập tên bộ đề" />
            </Form.Item>
            
            <Form.Item name="active" valuePropName="checked" className="mb-0" initialValue={true}>
              <div className="flex items-center">
                <span className="mr-2">Kích hoạt</span>
                <Switch defaultChecked />
              </div>
            </Form.Item>
          </div>
          
          {/* <Form.Item name="subject" label="Môn học" initialValue="Toan"> */}
          <Form.Item name="subject" label="Môn học">
            <Select placeholder="Chọn môn học">
              {HighSchoolSubjects.map(subject => (
                <Option key={subject.title} value={subject.title}>
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
                  sorter: true,
                },
                {
                  title: 'Loại câu hỏi',
                  dataIndex: 'type',
                  key: 'type',
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
            />
          </div>
        </Form>
      </Drawer>

      {/* Question Repository Modal */}
      <Modal
        title="Thêm câu hỏi vào bộ đề"
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
          <p className="mb-4">Chọn câu hỏi để thêm vào bộ đề</p>
          
          <div className="flex gap-2 mb-4">
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
                <Select.Option key={subject.value} value={subject.value}>
                  {subject.title}
                </Select.Option>
              ))}
            </Select>
          </div>
          
          <Table
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedQuestionIds,
              onSelectAll: handleSelectAllQuestions,
              onSelect: (record, selected) => handleSelectQuestion(record.id, selected)
            }}
            columns={[
              {
                title: '',
                dataIndex: 'selection',
                key: 'selection',
                width: 50,
                render: () => null // Cột này chỉ để hiển thị checkbox từ rowSelection
              },
              {
                title: 'Câu hỏi',
                dataIndex: 'content',
                key: 'content',
                render: (content) => content || 'Không có nội dung',
              },
              {
                title: 'Loại câu hỏi',
                dataIndex: 'type',
                key: 'type',
                width: 180,
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
          />
          
          <div className="flex items-center justify-between mt-4">
            <div>
              {repositoryTotal > 0 && (
                <span>{repositoryCurrentPage} / page</span>
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
  );
};

export default Exams;