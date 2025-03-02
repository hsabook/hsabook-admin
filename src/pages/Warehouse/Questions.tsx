import React, { useState } from 'react';
import { Card, Button, Table, Space, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import QuestionModal from '../../components/QuestionModal';
import { QUESTION_TYPE, HighSchoolSubjects } from '../../components/QuestionModal/QuestionModal';

// Mock data for questions
const mockQuestions = [
  {
    id: '1',
    content: 'Tính giá trị của biểu thức 2 + 3 × 4',
    type: 'AN_ANSWER',
    subject: 'Toan',
    difficulty: 'easy',
    active: true,
    createdAt: '2025-01-05T12:00:00Z',
  },
  {
    id: '2',
    content: 'Nước sôi ở nhiệt độ bao nhiêu độ C?',
    type: 'ENTER_ANSWER',
    subject: 'VatLy',
    difficulty: 'easy',
    active: true,
    createdAt: '2025-01-04T14:30:00Z',
  },
  {
    id: '3',
    content: 'Nguyên tố hóa học O là ký hiệu của?',
    type: 'AN_ANSWER',
    subject: 'HoaHoc',
    difficulty: 'medium',
    active: false,
    createdAt: '2025-01-03T09:15:00Z',
  },
];

const Questions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questions, setQuestions] = useState(mockQuestions);

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    message.success('Xóa câu hỏi thành công');
  };

  const handleSubmitQuestion = (values: any) => {
    console.log('Question values:', values);
    
    if (editingQuestion) {
      // Update existing question
      setQuestions(questions.map(q => 
        q.id === editingQuestion.id ? { ...q, ...values } : q
      ));
      message.success('Cập nhật câu hỏi thành công');
    } else {
      // Add new question
      const newQuestion = {
        id: Date.now().toString(),
        ...values,
        createdAt: new Date().toISOString(),
      };
      setQuestions([...questions, newQuestion]);
      message.success('Thêm câu hỏi mới thành công');
    }
    
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: (text: string) => (
        <div dangerouslySetInnerHTML={{ __html: text }} className="max-w-md truncate" />
      ),
    },
    {
      title: 'Loại câu hỏi',
      dataIndex: 'type',
      key: 'type',
      render: (type: keyof typeof QUESTION_TYPE) => (
        <Tag color="blue">{QUESTION_TYPE[type]}</Tag>
      ),
    },
    {
      title: 'Môn học',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject: string) => {
        const subjectObj = HighSchoolSubjects.find(s => s.value === subject);
        return <span>{subjectObj?.title || subject}</span>;
      },
    },
    {
      title: 'Mức độ',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty: string) => {
        const colors = {
          easy: 'green',
          medium: 'orange',
          hard: 'red',
        };
        const labels = {
          easy: 'Dễ',
          medium: 'Trung bình',
          hard: 'Khó',
        };
        return (
          <Tag color={colors[difficulty as keyof typeof colors]}>
            {labels[difficulty as keyof typeof labels]}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'Kích hoạt' : 'Chưa kích hoạt'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => message.info('Xem chi tiết câu hỏi')}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditQuestion(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteQuestion(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="Quản lý câu hỏi"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddQuestion}
          className="bg-[#45b630]"
        >
          Thêm câu hỏi
        </Button>
      }
    >
      <Table
        dataSource={questions}
        columns={columns}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} câu hỏi`,
        }}
      />

      <QuestionModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleSubmitQuestion}
        initialValues={editingQuestion}
        title={editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm mới câu hỏi'}
      />
    </Card>
  );
};

export default Questions;