import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Tag, message, Spin, Switch, Input, Modal, Select, Row, Col, Divider, Tooltip, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, SearchOutlined, ExclamationCircleOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import QuestionModal from '../../components/QuestionModal';
import { getQuestions, deleteQuestion, createQuestion, updateQuestion } from '../../api/questions';
import type { Question } from '../../api/questions/types';
import { HighSchoolSubjects, QUESTION_TYPE } from '../../components/QuestionModal/QuestionModal';

const { confirm } = Modal;

const Questions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchQuestions = async (page = 1, pageSize = 10, _params: any = {
    code_id: undefined,
    subject: undefined,
    type: undefined,
    status: undefined
  }) => {
    try {
      setLoading(true);
      const params: any = {
        take: pageSize,
        page: page
      };

      if (selectedSubject) {
        params.subject = _params.subject || selectedSubject;
      }

      if (selectedType) {
        params.type = _params.type || selectedType;
      }

      if (selectedStatus) {
        params.status = _params.status || selectedStatus;
      }

      if (searchText) {
        params.code_id = _params.code_id || searchText;
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
    fetchQuestions(1, pagination.pageSize, { code_id: value });
  };

  const handleReset = () => {
    setSearchText(undefined);
    setSelectedSubject(undefined);
    setSelectedType(undefined);
    setSelectedStatus(undefined);
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
      width: 250,
      render: (text: string) => (
        <Tooltip
          title={<div dangerouslySetInnerHTML={{ __html: text }} />}
          placement="topLeft"
          overlayStyle={{ maxWidth: '400px' }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: text }}
            className="line-clamp-1 max-w-[230px] cursor-pointer hover:text-blue-600 transition-colors duration-300"
          />
        </Tooltip>
      ),
    },
    {
      title: 'Môn học',
      dataIndex: 'subject',
      key: 'subject',
      width: 120,
      render: (subject: string) => {
        const subjectInfo = HighSchoolSubjects.find(s => s.value === subject);
        return (
          <Tag color="blue" className="rounded-full px-3">
            {subjectInfo ? subjectInfo.title : subject}
          </Tag>
        );
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
          'Nhập đáp án': 'orange',
          'Đọc hiểu': 'cyan'
        };
        return (
          <Tag color={colors[type] || 'default'} className="rounded-full px-3">
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
        <div className="flex items-center space-x-1">
          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{code_id}</span>
          <Button
            type="text"
            icon={<CopyOutlined className="text-gray-400 hover:text-gray-600" />}
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(code_id);
              message.success('Đã sao chép ID');
            }}
          />
        </div>
      ),
    },
    {
      title: 'Lần cuối cập nhật',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (date: string) => (
        <span className="text-gray-500 text-sm">
          {new Date(date).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_: any, record: Question) => (
        <Space size="small" className="flex justify-end">
          <Tooltip title={record.active ? "Vô hiệu hóa" : "Kích hoạt"}>
            <Switch
              size="small"
              checked={record.active}
              className={record.active ? "bg-[#45b630]" : ""}
              onChange={async (checked) => {
                try {
                  setQuestions(prevQuestions =>
                    prevQuestions.map(q =>
                      q.id === record.id ? { ...q, active: checked } : q
                    )
                  );
                  updateQuestion(record.id, { active: checked }).then(() => {
                    message.success(`${checked ? 'Kích hoạt' : 'Vô hiệu hóa'} câu hỏi thành công`);
                  }).catch((error) => {
                    setQuestions(prevQuestions =>
                      prevQuestions.map(q =>
                        q.id === record.id ? { ...q, active: checked } : q
                      )
                    );
                    console.error('Error updating question status:', error);
                    message.error(`Không thể ${checked ? 'kích hoạt' : 'vô hiệu hóa'} câu hỏi`);
                  });

                } catch (error) {
                  console.error('Error updating question status:', error);
                  message.error(`Không thể ${checked ? 'kích hoạt' : 'vô hiệu hóa'} câu hỏi`);
                }
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa câu hỏi">
            <Button
              type="text"
              icon={<EditOutlined className="text-blue-500" />}
              onClick={() => message.info('Chỉnh sửa câu hỏi')}
              className="hover:bg-blue-50 transition-colors duration-300"
            />
          </Tooltip>
          <Tooltip title="Xóa câu hỏi">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record)}
              className="hover:bg-red-50 transition-colors duration-300"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-4 bg-gray-50 min-h-screen">
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Câu hỏi</h1>
            <Badge
              count={pagination.total}
              showZero
              overflowCount={9999}
              style={{ backgroundColor: '#faad14' }}
              className="ml-2"
            />
          </div>
          <Tooltip title="Thêm câu hỏi mới">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddQuestion}
              className="bg-[#45b630] hover:bg-[#3a9c29] transition-colors duration-300"
              size="middle"
            >
              Thêm câu hỏi
            </Button>
          </Tooltip>
        </div>

        <Divider className="my-3" />

        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={6} lg={6}>
            <Input
              placeholder="Tìm kiếm CODE"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-full border-[#45b630] border hover:border-[#3a9c29] transition-colors duration-300"
              allowClear
              suffix={
                <Tooltip title="Nhập mã CODE của câu hỏi">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              }
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="Trạng thái"
              value={selectedStatus}
              onChange={setSelectedStatus}
              className="w-full"
              allowClear
              options={[
                { label: 'Kích hoạt', value: 'active' },
                { label: 'Vô hiệu', value: 'inactive' }
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              placeholder="Loại câu hỏi"
              value={selectedType}
              onChange={setSelectedType}
              className="w-full"
              allowClear
              options={Object.entries(QUESTION_TYPE).map(([key]) => ({
                label: QUESTION_TYPE[key as keyof typeof QUESTION_TYPE],
                value: key
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              placeholder="Phân loại"
              value={selectedSubject}
              onChange={setSelectedSubject}
              className="w-full"
              allowClear
              options={HighSchoolSubjects.map(subject => ({
                label: subject.title,
                value: subject.value
              }))}
            />
          </Col>
          <Col xs={24} sm={24} md={24} lg={4} className="flex justify-end">
            <Tooltip title="Làm mới bộ lọc">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                className="w-full lg:w-auto hover:bg-gray-50 transition-colors duration-300"
              >
                Làm mới
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="text-gray-500 text-sm">
                Hiển thị {questions.length} trên tổng số {pagination.total} câu hỏi
              </div>
              <div className="text-gray-500 text-sm">
                Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
              </div>
            </div>
            <Table
              dataSource={questions}
              columns={columns as any}
              rowKey="id"
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} câu hỏi`,
                className: "pagination-rounded"
              }}
              onChange={handleTableChange}
              scroll={{ x: 1200 }}
              className="ant-table-striped"
              rowClassName={(record, index) =>
                `${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-300`
              }
            />
          </>
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