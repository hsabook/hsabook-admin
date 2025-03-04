import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Tag, message, Spin, Switch, Input, Modal, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, SearchOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import QuestionModal from '../../components/QuestionModal';
import { getQuestions, deleteQuestion, createQuestion } from '../../api/questions';
import type { Question } from '../../api/questions/types';
import { HighSchoolSubjects, QUESTION_TYPE } from '../../components/QuestionModal/QuestionModal';

const { confirm } = Modal;

const Questions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchQuestions = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const params: any = {
        take: pageSize,
        page: page
      };

      if (selectedSubject) {
        params.subject = selectedSubject;
      }

      if (selectedType) {
        params.type = selectedType;
      }

      if (selectedStatus) {
        params.status = selectedStatus;
      }

      if (searchText) {
        params.code_id = searchText;
      }

      const response = await getQuestions(params);
      setQuestions(response.data.data);
      setPagination({
        current: response.data.pagination.current_page,
        pageSize: response.data.pagination.take,
        total: response.data.pagination.total
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      message.error('Không thể tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedSubject, selectedType, selectedStatus]);

  const handleTableChange = (newPagination: any) => {
    fetchQuestions(newPagination.current, newPagination.pageSize);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const showDeleteConfirm = (record: Question) => {
    confirm({
      title: 'Xác nhận xóa câu hỏi',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa câu hỏi này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteQuestion(record.id);
          fetchQuestions(pagination.current, pagination.pageSize);
          message.success('Xóa câu hỏi thành công');
        } catch (error) {
          console.error('Error deleting question:', error);
          message.error('Không thể xóa câu hỏi');
        }
      },
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchQuestions(1, pagination.pageSize);
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedSubject('');
    setSelectedType('');
    setSelectedStatus('');
    fetchQuestions(1, pagination.pageSize);
  };

  const handleSubmitQuestion = async (values: any) => {
    try {
      setSubmitting(true);
      
      const getAnswerLetter = (index: number) => String.fromCharCode(65 + index);
      
      let options: any[] = [];
      let answers: string[] = [];
      
      const answersArray = Array.isArray(values.answers) ? values.answers : [];
      
      if (values.questionType === 'AN_ANSWER') {
        options = answersArray.map((answer: any, index: number) => ({
          checked: answer.isCorrect,
          answer: answer.content,
          value: answer.content,
          type: getAnswerLetter(index)
        }));
        
        const correctIndex = answersArray.findIndex((a: any) => a.isCorrect);
        if (correctIndex >= 0) {
          answers = [getAnswerLetter(correctIndex)];
        }
      } else if (values.questionType === 'MULTIPLE_ANSWERS') {
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
        active: values.active,
        subject: values.subject,
        level: difficultyMap[values.difficulty] || 'normal',
        video: values.embedVideo || values.videoUrl,
        question: values.content,
        type: questionTypeMap[values.questionType],
        solution: values.solution || '',
        options,
        answers
      };

      await createQuestion(payload);
      message.success('Thêm câu hỏi mới thành công');
      setIsModalOpen(false);
      fetchQuestions(1, pagination.pageSize);
    } catch (error) {
      console.error('Error creating question:', error);
      message.error('Không thể tạo câu hỏi');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Câu hỏi',
      dataIndex: 'question',
      key: 'question',
      render: (text: string) => (
        <div dangerouslySetInnerHTML={{ __html: text }} className="line-clamp-2" />
      ),
    },
    {
      title: 'Môn học',
      dataIndex: 'subject',
      key: 'subject',
      width: 120,
      render: (subject: string) => {
        const subjectInfo = HighSchoolSubjects.find(s => s.value === subject);
        return subjectInfo ? subjectInfo.title : subject;
      }
    },
    {
      title: 'Loại câu hỏi',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: string) => {
        const colors: Record<string, string> = {
          'Lựa chọn một đáp án': 'success',
          'Lựa chọn nhiều đáp án': 'purple',
          'Đúng/Sai': 'blue',
        };
        return (
          <Tag color={colors[type] || 'default'} className="rounded-full">
            {type}
          </Tag>
        );
      }
    },
    {
      title: 'ID Câu hỏi',
      dataIndex: 'code_id',
      key: 'code_id',
      width: 120,
      render: (code_id: string) => (
        <Space>
          <span>{code_id}</span>
          <Button
            type="text"
            icon={<CopyOutlined className="text-gray-400 hover:text-gray-600" />}
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(code_id);
              message.success('Đã sao chép ID');
            }}
          />
        </Space>
      ),
    },
    {
      title: 'Lần cuối cập nhật',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_: any, record: Question) => (
        <Space>
          <Switch 
            size="small" 
            checked={record.active}
            onChange={(checked) => {
              message.success(`${checked ? 'Kích hoạt' : 'Vô hiệu hóa'} câu hỏi thành công`);
            }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => message.info('Chỉnh sửa câu hỏi')}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Câu hỏi</h1>
          <Tag color="gold" className="rounded-full">{pagination.total} câu</Tag>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddQuestion}
          className="bg-[#45b630]"
        >
          Thêm câu hỏi
        </Button>
      </div>

      <Card className="shadow-sm">
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Tìm kiếm CODE"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-64 border-[#45b630] border"
            allowClear
          />

          <Select
            placeholder="Trạng thái"
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="w-32"
            allowClear
            options={[
              { label: 'Kích hoạt', value: 'active' },
              { label: 'Vô hiệu', value: 'inactive' }
            ]}
          />

          <Select
            placeholder="Loại câu hỏi"
            value={selectedType}
            onChange={setSelectedType}
            className="w-40"
            allowClear
            options={Object.entries(QUESTION_TYPE).map(([key]) => ({
              label: QUESTION_TYPE[key as keyof typeof QUESTION_TYPE],
              value: key
            }))}
          />

          <Select
            placeholder="Phân loại"
            value={selectedSubject}
            onChange={setSelectedSubject}
            className="w-40"
            allowClear
            options={HighSchoolSubjects.map(subject => ({
              label: subject.title,
              value: subject.value
            }))}
          />

          <Button 
            icon={<ReloadOutlined />}
            onClick={handleReset}
          >
            Làm mới
          </Button>
        </div>
      </Card>

      <Card className="shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={questions}
            columns={columns}
            rowKey="id"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} câu hỏi`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            className="ant-table-striped"
          />
        )}
      </Card>

      <QuestionModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleSubmitQuestion}
        initialValues={editingQuestion}
        title={editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm mới câu hỏi'}
      />
    </div>
  );
};

export default Questions;