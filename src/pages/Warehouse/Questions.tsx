import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Tag, message, Spin, Switch, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, SearchOutlined } from '@ant-design/icons';
import QuestionModal from '../../components/QuestionModal';
import { getQuestions, createQuestion, deleteQuestion } from '../../api/questions';
import type { Question } from '../../api/questions/types';

const Questions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

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

  const handleSearch = (value: string) => {
    setSearchText(value);
    // Implement search logic here
  };

  const columns = [
    {
      title: 'Câu hỏi',
      dataIndex: 'question',
      key: 'question',
      render: (text: string) => (
        <div dangerouslySetInnerHTML={{ __html: text }} className="line-clamp-2" />
      ),
      sorter: (a: Question, b: Question) => a.question.localeCompare(b.question),
    },
    {
      title: 'Môn học',
      dataIndex: 'subject',
      key: 'subject',
      width: 120,
      filters: [
        { text: 'Toán', value: 'Toán' },
        { text: 'Lý', value: 'Lý' },
        { text: 'Hóa', value: 'Hóa' },
      ],
      onFilter: (value: string, record: Question) => record.subject === value,
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
      },
      filters: [
        { text: 'Lựa chọn một đáp án', value: 'Lựa chọn một đáp án' },
        { text: 'Lựa chọn nhiều đáp án', value: 'Lựa chọn nhiều đáp án' },
        { text: 'Đúng/Sai', value: 'Đúng/Sai' },
      ],
      onFilter: (value: string, record: Question) => record.type === value,
    },
    {
      title: 'ID Câu hỏi',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <Space>
          <span>Q{id.slice(-5)}</span>
          <Button
            type="text"
            icon={<CopyOutlined className="text-gray-400 hover:text-gray-600" />}
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(id);
              message.success('Đã sao chép ID');
            }}
          />
        </Space>
      ),
      sorter: (a: Question, b: Question) => a.id.localeCompare(b.id),
    },
    {
      title: 'Lần cuối cập nhật',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: (a: Question, b: Question) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
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
              // Handle status change
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
            onClick={() => handleDeleteQuestion(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Tìm kiếm câu hỏi..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-md"
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddQuestion}
            className="bg-[#45b630]"
          >
            Thêm câu hỏi
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
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} câu hỏi`,
            }}
            scroll={{ x: 1200 }}
            className="ant-table-striped"
          />
        )}
      </Card>

      <QuestionModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={(values) => {
          console.log(values);
          setIsModalOpen(false);
        }}
        initialValues={editingQuestion}
        title={editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm mới câu hỏi'}
      />
    </div>
  );
};

export default Questions;