import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Tag, message, Spin, Switch, Input, Modal, Select, Row, Col, Divider, Tooltip, Badge, Tabs, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, SearchOutlined, ExclamationCircleOutlined, ReloadOutlined, InfoCircleOutlined, UploadOutlined } from '@ant-design/icons';
import QuestionModal from '../../components/QuestionModal';
import VideoDisplay from '../../components/VideoDisplay';
import { getQuestions, deleteQuestion, createQuestion, updateQuestion } from '../../api/questions';
import type { Question } from '../../api/questions/types';
import { HighSchoolSubjects, QUESTION_TYPE } from '../../components/QuestionModal/QuestionModal';
import { api } from '../../utils/api';
import { uploadVideoByExcel, validateExcelFile } from '../../api/upload/videoService';

const { confirm } = Modal;

const Questions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [_, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState<string | undefined | any>(undefined);
  const [selectedSubject, setSelectedSubject] = useState<string | undefined | any>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined | any>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined | any>(undefined);
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [viewingQuestion, setViewingQuestion] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [codeFilter, setCodeFilter] = useState('');

  const fetchQuestions = async (page = 1, pageSize = 10, _params: any = {
    code_id: undefined,
    subject: undefined,
    type: undefined,
    status: undefined
  }) => {
    console.log('====> ', {
      page,
      pageSize,
      _params
    })
    try {
      setLoading(true);
      const params: any = {
        take: pageSize,
        page: page
      };

      if (_params?.subject || selectedSubject) {
        params.subject = _params.subject || selectedSubject;
      }

      if (_params?.type || selectedType) {
        params.type = _params.type || selectedType;
      }

      if (_params?.status|| selectedStatus) {
        params.status = _params?.status || selectedStatus;
      }

      if (_params?.code_id) {
        params.code_id = _params?.code_id;
      }

      const response = await getQuestions(params);
      console.log("🔍 Response:", response.data.data?.length);
      setQuestions(response.data.data);
      setPagination({
        current: response.data.pagination.current_page,
        pageSize: response.data.pagination.take,
        total: response.data.pagination.total
      });
      setLastFetchTime(new Date());
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
    setEditingQuestionId(null);
    setIsModalOpen(true);
  };

  const handleEditQuestion = (id: string) => {
    setEditingQuestionId(id);
    setIsModalOpen(true);
  };

  const showDeleteConfirm = (record: Question) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa câu hỏi này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Dữ liệu sẽ không thể khôi phục sau khi xóa.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteQuestion(record.id);
          message.success('Xóa câu hỏi thành công');
          fetchQuestions(pagination.current, pagination.pageSize);
        } catch (error) {
          console.error('Error deleting question:', error);
          message.error('Không thể xóa câu hỏi');
        }
      },
    });
  };

  const handleSearch = (value: string = '') => {
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

  const handleUploadExcel = async (file: File) => {
    const error = validateExcelFile(file);
    if (error) {
      message.error(error);
      return false;
    }

    setUploadLoading(true);
    setUploadResult(null);
    try {
      const result = await uploadVideoByExcel(file);
      console.log('API response:', result); // Log để debug
      
      // Cấu trúc dữ liệu API trả về có thể có nhiều dạng khác nhau
      // Dạng 1: { messages, data: { total, success,...}, status_code }
      // Dạng 2: { total, success, failed, skipped, details: [...] }
      
      // Xác định responseData dựa trên cấu trúc thực tế
      // Nếu result.data tồn tại và chứa total, success thì đó là dạng 1
      // Nếu result trực tiếp chứa total, success thì đó là dạng 2
      const responseData = 
        (result.data && (typeof result.data.total === 'number' || typeof result.data.success === 'number'))
          ? result.data
          : (typeof result.total === 'number' || typeof result.success === 'number')
            ? result
            : {};
      
      console.log('Extracted response data:', responseData);
      
      // Lấy mảng details
      const details = responseData.details || [];
      
      // Tính toán các mã thành công và thất bại
      const successCodes = details
        .filter((item: any) => item.status === "SUCCESS")
        .map((item: any) => item.code_id);
      
      const failedCodes = details
        .filter((item: any) => item.status !== "SUCCESS")
        .map((item: any) => item.code_id);
      
      console.log('Success codes:', successCodes);
      console.log('Failed codes:', failedCodes);
      
      // Chuẩn bị dữ liệu để hiển thị
      const resultData = {
        total: responseData.total || 0,
        success: responseData.success || 0,
        failed: responseData.failed || 0,
        skipped: responseData.skipped || 0,
        successCodes,
        failedCodes
      };
      
      console.log('Final result data:', resultData);
      
      setUploadResult({ 
        success: true, 
        data: resultData,
        message: result.messages || 'Success'
      });
      
      message.success(`Upload thành công! Đã cập nhật ${resultData.success}/${resultData.total} mã.`);
      
      // Tự động làm mới danh sách câu hỏi sau khi upload thành công
      if (successCodes.length > 0) {
        fetchQuestions(pagination.current, pagination.pageSize);
      }
      
    } catch (error: any) {
      console.error('Error uploading Excel file:', error);
      const errorMessage = error.response?.data?.message || 'Không thể upload file Excel';
      setUploadResult({ success: false, error: errorMessage });
      message.error(errorMessage);
    } finally {
      setUploadLoading(false);
    }
    return false;
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
      width: 180,
      fixed: 'right',
      render: (_: any, record: Question) => (
        <Space size="small" className="flex justify-end">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<InfoCircleOutlined className="text-green-500" />}
              onClick={() => {
                // Hiển thị loading message
                const loadingMessage = message.loading('Đang tải thông tin câu hỏi...', 0);
                
                // Gọi API để lấy thông tin chi tiết của câu hỏi
                api(`/questions/${record.id}`)
                  .then((response) => {
                    loadingMessage();
                    const questionData = response.data;
                    setViewingQuestion(questionData);
                    setIsViewModalOpen(true);
                  })
                  .catch((error) => {
                    loadingMessage();
                    console.error('Error fetching question details:', error);
                    message.error('Không thể tải thông tin chi tiết của câu hỏi');
                  });
              }}
              className="hover:bg-green-50 transition-colors duration-300"
            />
          </Tooltip>
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
              onClick={() => handleEditQuestion(record.id)}
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
    <div className="space-y-4 min-h-screen">
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
          <div className="flex gap-2">
            <Tooltip title="Upload video bằng file xlsx">
              <Button
                icon={<UploadOutlined />}
                onClick={() => setUploadModalVisible(true)}
                className="border-[#45b630] hover:border-[#3a9c29] text-[#45b630] hover:text-[#3a9c29] transition-colors duration-300"
                size="middle"
              >
                Upload Video
              </Button>
            </Tooltip>
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
              // onClear={() => {
                // fetchQuestions(pagination.current, pagination.pageSize);
                // setSearchText('');
              // }}
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
                Cập nhật lần cuối: {lastFetchTime.toLocaleString('vi-VN')}
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
        onCancel={() => {
          setIsModalOpen(false);
          setEditingQuestionId(null);
        }}
        questionId={editingQuestionId || undefined}
        title={editingQuestionId ? 'Chỉnh sửa câu hỏi' : 'Thêm mới câu hỏi'}
        refreshData={() => fetchQuestions(pagination.current, pagination.pageSize)}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingQuestionId(null);
        }}
      />

      <Modal
        title={
          <div className="flex items-center">
            <InfoCircleOutlined className="text-blue-500 mr-2" />
            <span>Chi tiết câu hỏi</span>
          </div>
        }
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setViewingQuestion(null);
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setIsViewModalOpen(false);
              setViewingQuestion(null);
            }}
          >
            Đóng
          </Button>
        ]}
        width={800}
        maskClosable={true}
        destroyOnClose={false}
        className="question-detail-modal"
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        {viewingQuestion && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-2 mb-4">
              <Tag className="rounded-full px-3 py-1">
                Mã: <span className="font-medium">{viewingQuestion.code_id}</span>
              </Tag>
              <Tag color="blue" className="rounded-full px-3 py-1">
                {HighSchoolSubjects.find(s => s.value === viewingQuestion.subject)?.title || viewingQuestion.subject}
              </Tag>
              <Tag color="purple" className="rounded-full px-3 py-1">
                {viewingQuestion.type}
              </Tag>
              <Tag 
                color={
                  viewingQuestion.level === 'easy' ? 'success' : 
                  viewingQuestion.level === 'hard' ? 'error' : 'warning'
                } 
                className="rounded-full px-3 py-1"
              >
                {viewingQuestion.level === 'easy' ? 'Dễ' : viewingQuestion.level === 'hard' ? 'Khó' : 'Trung bình'}
              </Tag>
              <Tag 
                color={viewingQuestion.active ? 'success' : 'default'} 
                className="rounded-full px-3 py-1"
              >
                {viewingQuestion.active ? 'Đang kích hoạt' : 'Vô hiệu hóa'}
              </Tag>
            </div>
            
            <Tabs
              defaultActiveKey="question"
              items={[
                {
                  key: 'question',
                  label: 'Câu hỏi & Đáp án',
                  children: (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Nội dung câu hỏi:</h3>
                        <div className="p-3 bg-gray-50 rounded-md" dangerouslySetInnerHTML={{ __html: viewingQuestion.question }} />
                      </div>
                      
                      {viewingQuestion.options && viewingQuestion.options.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Các đáp án:</h3>
                          <div className="space-y-2">
                            {viewingQuestion.options.map((option: any, index: number) => (
                              <div 
                                key={index} 
                                className={`p-2 rounded-md flex items-start ${
                                  viewingQuestion.answers.includes(option.type) 
                                    ? 'bg-green-50 border border-green-200' 
                                    : 'bg-gray-50'
                                }`}
                              >
                                <div className="mr-2">
                                  {viewingQuestion.answers.includes(option.type) ? (
                                    <Badge status="success" />
                                  ) : (
                                    <Badge status="default" />
                                  )}
                                </div>
                                <div>
                                  <span className="font-medium mr-2">{option.type}.</span>
                                  <span dangerouslySetInnerHTML={{ __html: option.answer }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'solution',
                  label: 'Giải thích',
                  children: (
                    <div className="space-y-4">
                      {viewingQuestion.solution ? (
                        <div className="p-3 bg-blue-50 rounded-md" dangerouslySetInnerHTML={{ __html: viewingQuestion.solution }} />
                      ) : (
                        <div className="text-gray-500 italic p-4 text-center">
                          Không có giải thích cho câu hỏi này
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'video',
                  label: 'Video giải thích',
                  children: (
                    <div className="space-y-4">
                      {viewingQuestion.video ? (
                        <div className="p-3 bg-gray-50 rounded-md">
                          <VideoDisplay videoSource={viewingQuestion.video} />
                        </div>
                      ) : (
                        <div className="text-gray-500 italic p-4 text-center">
                          Không có video giải thích cho câu hỏi này
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'info',
                  label: 'Thông tin khác',
                  children: (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold">Ngày tạo:</span> 
                          <div className="mt-1 text-gray-600">
                            {new Date(viewingQuestion.created_at).toLocaleString('vi-VN')}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold">Cập nhật lần cuối:</span> 
                          <div className="mt-1 text-gray-600">
                            {new Date(viewingQuestion.updated_at).toLocaleString('vi-VN')}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold">ID:</span> 
                          <div className="mt-1 text-gray-600">
                            {viewingQuestion.id}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold">Mã câu hỏi:</span> 
                          <div className="mt-1 text-gray-600">
                            {viewingQuestion.code_id}
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      <Modal
        title={
          <div className="flex items-center">
            <UploadOutlined className="text-blue-500 mr-2" />
            <span>Upload Video Bằng File Excel</span>
          </div>
        }
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          setUploadResult(null);
          setCodeFilter('');
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setUploadModalVisible(false);
              setUploadResult(null);
              setCodeFilter('');
            }}
          >
            Đóng
          </Button>
        ]}
        width={600}
      >
        <div className="py-4">
          {!uploadResult && (
            <>
              <Upload.Dragger
                name="file"
                accept=".xlsx"
                beforeUpload={handleUploadExcel}
                showUploadList={false}
                disabled={uploadLoading}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ fontSize: 32, color: '#45b630' }} />
                </p>
                <p className="ant-upload-text">Nhấp hoặc kéo thả file Excel vào khu vực này</p>
                <p className="ant-upload-hint text-gray-500">
                  Chỉ hỗ trợ file Excel (.xlsx) có định dạng đúng. Kích thước tối đa: 10MB
                </p>
              </Upload.Dragger>
              
              <div className="mt-4 text-center">
                <Button 
                  type="link"
                  onClick={() => {
                    // Tải xuống file mẫu (làm giả bằng cách mở URL hoặc tải từ server)
                    // message.info('Đang tải file mẫu...');
                    window.open('https://s3-website-r1.s3cloud.vn/hsa/2025-04-08/1744066245663.xlsx', '_blank');
                  }}
                >
                  Tải xuống file mẫu Excel
                </Button>
              </div>
            </>
          )}

          {uploadLoading && (
            <div className="text-center mt-4">
              <Spin tip="Đang upload..." />
            </div>
          )}

          {uploadResult && uploadResult.success && (
            <div className="mt-4 p-4 bg-green-50 rounded border border-green-200">
              <h3 className="text-green-600 font-medium mb-2">Upload thành công!</h3>
              <p className="text-gray-700 mb-2">
                Các video đã được cập nhật vào hệ thống.
              </p>
              
              <div className="text-gray-500 text-xs mb-3">
                Thời gian: {new Date().toLocaleString('vi-VN')}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white p-2 rounded border border-gray-100">
                  <span className="text-sm font-medium">Tổng số mã:</span>
                  <span className="float-right font-bold">{uploadResult.data?.total || 0}</span>
                </div>
                <div className="bg-white p-2 rounded border border-green-100">
                  <span className="text-sm font-medium">Thành công:</span>
                  <span className="float-right font-bold text-green-600">{uploadResult.data?.success || 0}</span>
                </div>
                <div className="bg-white p-2 rounded border border-red-100">
                  <span className="text-sm font-medium">Thất bại:</span>
                  <span className="float-right font-bold text-red-600">{uploadResult.data?.failed || 0}</span>
                </div>
                <div className="bg-white p-2 rounded border border-yellow-100">
                  <span className="text-sm font-medium">Bỏ qua:</span>
                  <span className="float-right font-bold text-yellow-600">{uploadResult.data?.skipped || 0}</span>
                </div>
              </div>
              
              {uploadResult.data?.successCodes && uploadResult.data.successCodes.length > 0 ? (
                <div className="mt-3">
                  <p className="font-medium text-sm text-gray-700">
                    Các mã đã cập nhật thành công ({uploadResult.data.successCodes.length}):
                  </p>
                  
                  <div className="flex justify-between items-center mb-2">
                    <Input
                      placeholder="Tìm kiếm mã..."
                      value={codeFilter}
                      onChange={(e) => setCodeFilter(e.target.value)}
                      className="mr-2"
                      prefix={<SearchOutlined className="text-gray-400" />}
                      allowClear
                    />
                    
                    <Button
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => {
                        const textToCopy = uploadResult.data.successCodes.join(', ');
                        navigator.clipboard.writeText(textToCopy);
                        message.success('Đã sao chép tất cả mã');
                      }}
                      className="flex-shrink-0"
                      disabled={uploadResult.data.successCodes.length === 0}
                    >
                      Sao chép
                    </Button>
                  </div>
                  
                  <div className="mt-2 max-h-40 overflow-y-auto bg-white p-2 rounded border border-green-100">
                    {uploadResult.data.successCodes
                      .filter((code: string) => code.toLowerCase().includes(codeFilter.toLowerCase()))
                      .map((code: string, index: number) => (
                        <Tag 
                          key={index} 
                          className="mb-1 mr-1 px-2 py-1 bg-green-50 text-green-800 border-green-200"
                        >
                          {code}
                        </Tag>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm mt-2">
                  Không có mã nào được cập nhật thành công.
                </p>
              )}
              
              {uploadResult.data?.failedCodes && uploadResult.data.failedCodes.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-sm text-red-700">
                    Các mã thất bại ({uploadResult.data.failedCodes.length}):
                  </p>
                  
                  <div className="mt-2 max-h-32 overflow-y-auto bg-white p-2 rounded border border-red-100">
                    {uploadResult.data.failedCodes
                      .filter((code: string) => code.toLowerCase().includes(codeFilter.toLowerCase()))
                      .map((code: string, index: number) => (
                        <Tag 
                          key={index} 
                          className="mb-1 mr-1 px-2 py-1 bg-red-50 text-red-800 border-red-200"
                        >
                          {code}
                        </Tag>
                      ))}
                  </div>
                </div>
              )}
              
              <div className="mt-3 flex justify-between">
                <Button 
                  onClick={() => {
                    setUploadResult(null);
                    setCodeFilter('');
                  }}
                >
                  Upload lại
                </Button>
                
                <Button 
                  type="primary" 
                  onClick={() => fetchQuestions(pagination.current, pagination.pageSize)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Làm mới danh sách
                </Button>
              </div>
            </div>
          )}

          {uploadResult && !uploadResult.success && (
            <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
              <h3 className="text-red-600 font-medium mb-2">Upload thất bại!</h3>
              <p className="text-gray-700">
                {uploadResult.error}
              </p>
              <p className="text-gray-500 mt-2 text-sm">
                Vui lòng kiểm tra lại file Excel và thử lại. Hãy đảm bảo file Excel có đúng định dạng yêu cầu.
              </p>
              
              <div className="mt-3 flex justify-between">
                <Button 
                  onClick={() => {
                    setUploadResult(null);
                    setCodeFilter('');
                  }}
                >
                  Thử lại
                </Button>
                
                <Button 
                  type="link"
                  onClick={() => {
                    window.open('https://s3-website-r1.s3cloud.vn/hsa/2025-04-08/1744066245663.xlsx', '_blank');
                  }}
                >
                  Tải xuống file mẫu
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Questions;