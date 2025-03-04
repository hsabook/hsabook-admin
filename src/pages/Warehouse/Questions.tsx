import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Tag, message, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import QuestionModal from '../../components/QuestionModal';
import { QUESTION_TYPE, HighSchoolSubjects } from '../../components/QuestionModal/QuestionModal';
import { getQuestions, createQuestion, deleteQuestion } from '../../api/questions';
import type { Question } from '../../api/questions/types';

const Questions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await getQuestions();
      setQuestions(response.data.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      message.error('Không thể tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
      message.success('Xóa câu hỏi thành công');
    } catch (error) {
      console.error('Error deleting question:', error);
      message.error('Không thể xóa câu hỏi');
    }
  };

  const handleSubmitQuestion = async (values: any) => {
    try {
      setSubmitting(true);
      
      // Map form values to API payload
      const getAnswerLetter = (index: number) => String.fromCharCode(65 + index);
      
      // Process answers based on question type
      let options: any[] = [];
      let answers: string[] = [];
      
      // Đảm bảo values.answers luôn là một mảng
      const answersArray = Array.isArray(values.answers) ? values.answers : [];
      
      if (values.questionType === 'AN_ANSWER') {
        // Single choice question
        options = answersArray.map((answer: any, index: number) => ({
          checked: answer.isCorrect,
          answer: answer.content,
          value: answer.content,
          type: getAnswerLetter(index)
        }));
        
        // Find the correct answer
        const correctIndex = answersArray.findIndex((a: any) => a.isCorrect);
        if (correctIndex >= 0) {
          answers = [getAnswerLetter(correctIndex)];
        }
      } else if (values.questionType === 'MULTIPLE_ANSWERS') {
        // Multiple choice question
        options = answersArray.map((answer: any, index: number) => ({
          checked: answer.isCorrect,
          answer: answer.content,
          value: answer.content,
          type: getAnswerLetter(index)
        }));
        
        // Find all correct answers
        answers = answersArray
          .map((answer: any, index: number) => answer.isCorrect ? getAnswerLetter(index) : null)
          .filter(Boolean);
      }
      
      // Map question type to API format
      const questionTypeMap: Record<string, string> = {
        'AN_ANSWER': 'Lựa chọn một đáp án',
        'MULTIPLE_ANSWERS': 'Lựa chọn nhiều đáp án',
        'TRUE_FALSE': 'Đúng/Sai',
        'ENTER_ANSWER': 'Nhập đáp án',
        'READ_UNDERSTAND': 'Đọc hiểu'
      };
      
      // Map difficulty to API format
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
      
      if (editingQuestion) {
        // Update existing question
        // await updateQuestion(editingQuestion.id, payload);
        message.success('Cập nhật câu hỏi thành công');
      } else {
        // Add new question
        await createQuestion(payload);
        message.success('Thêm câu hỏi mới thành công');
      }
      
      setIsModalOpen(false);
      fetchQuestions();
    } catch (error) {
      console.error('Error submitting question:', error);
      message.error('Không thể lưu câu hỏi');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'question',
      key: 'question',
      render: (text: string) => (
        <div dangerouslySetInnerHTML={{ __html: text }} className="max-w-md truncate" />
      ),
    },
    {
      title: 'Loại câu hỏi',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{type}</Tag>
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
      dataIndex: 'level',
      key: 'level',
      render: (difficulty: string) => {
        const colors: Record<string, string> = {
          easy: 'green',
          normal: 'orange',
          hard: 'red',
        };
        const labels: Record<string, string> = {
          easy: 'Dễ',
          normal: 'Trung bình',
          hard: 'Khó',
        };
        return (
          <Tag color={colors[difficulty] || 'default'}>
            {labels[difficulty] || difficulty}
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
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} câu hỏi`,
          }}
        />
      )}

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