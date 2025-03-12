import React, { useState, useEffect } from 'react';
import { Drawer, Input, Button, Table, Space, Badge, message, Spin, Empty, Tag, Alert } from 'antd';
import { SearchOutlined, CopyOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';

interface ExamsListDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectExams: (selectedExams: any[]) => void;
}

interface Exam {
  id: string;
  title: string;
  code_id: string;
  total_question: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  subject: string;
  description: string | null;
  cover: string | null;
  file_upload: string | null;
  status_exam: string;
  user_id: string;
}

interface ApiResponse {
  messages: string;
  data: {
    data: Exam[];
    pagination: {
      current_page: number;
      total_pages: number;
      take: number;
      total: number;
    }
  };
  status_code: number;
}

// Thêm debounce function để tránh gọi API liên tục khi người dùng nhập
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ExamsListDrawer: React.FC<ExamsListDrawerProps> = ({
  open,
  onClose,
  onSelectExams
}) => {
  const [searchText, setSearchText] = useState<string>('');
  const debouncedSearchText = useDebounce(searchText, 500); // 500ms debounce
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const fetchExams = async (page = 1, searchTerm = '') => {
    setLoading(true);
    try {
      // Use the API endpoint and auth token from the curl command
      const token = localStorage.getItem('token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMDZjYjQ4Zi01ZDM2LTQ2YjEtOThmMy1lNTc0ZmNiZWZmZmUiLCJpYXQiOjE3NDE1MzY4MzksImV4cCI6MTc0MjE0MTYzOX0.bkgEGRLhRkaGIolE38unbPZbLUkA77uDncPzFcQgSsc';
      
      console.log(`🔍 Tìm kiếm bộ đề với từ khóa: "${searchTerm}"`);

      if (searchTerm) {
        message.loading({ content: `Đang tìm kiếm "${searchTerm}"...`, key: 'search' });
      }
      
      const response = await axios.get<ApiResponse>('https://hsabook-backend-dev.up.railway.app/exams', {
        params: {
          page,
          take: pagination.pageSize,
          active: true,
          search: searchTerm
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
          'accept-language': 'en-US,en;q=0.9,vi;q=0.8'
        }
      });
      
      console.log("📚 ExamsListDrawer fetchExams response:", response.data);
      
      if (response.data && response.data.data && response.data.data.data) {
        const examsList = response.data.data.data;
        setExams(examsList);
        
        const paginationData = response.data.data.pagination;
        setPagination({
          current: paginationData.current_page,
          pageSize: paginationData.take,
          total: paginationData.total
        });

        // Hiển thị thông báo kết quả tìm kiếm
        if (searchTerm) {
          if (examsList.length > 0) {
            message.success({ 
              content: `Tìm thấy ${examsList.length} bộ đề với từ khóa "${searchTerm}"`, 
              key: 'search' 
            });
          } else {
            message.info({ 
              content: `Không tìm thấy bộ đề nào với từ khóa "${searchTerm}"`, 
              key: 'search' 
            });
          }
        }
      } else {
        setExams([]);
        if (searchTerm) {
          message.info({ 
            content: `Không tìm thấy bộ đề nào với từ khóa "${searchTerm}"`,
            key: 'search'
          });
        } else {
          message.warning('Không tìm thấy bộ đề nào');
        }
      }
    } catch (error) {
      console.error("❌ ExamsListDrawer fetchExams error:", error);
      message.error({
        content: 'Không thể tải danh sách bộ đề. Vui lòng thử lại sau.',
        key: 'search'
      });
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (debouncedSearchText !== '') {
        // Chỉ gọi API khi người dùng đã ngừng nhập trong 500ms và có từ khóa tìm kiếm
        setIsSearching(true);
        fetchExams(1, debouncedSearchText);
      }
    }
  }, [debouncedSearchText, open]);

  useEffect(() => {
    if (open) {
      fetchExams(1, searchText);
    } else {
      // Reset states when drawer closes
      setSelectedRowKeys([]);
      setSearchText('');
      setIsSearching(false);
    }
  }, [open]);

  const handleSearch = () => {
    console.log("🔍 Thực hiện tìm kiếm với từ khóa:", searchText);
    setIsSearching(true);
    fetchExams(1, searchText);
  };

  const handleTableChange = (newPagination: any) => {
    fetchExams(newPagination.current, searchText);
  };

  const handleSelectExams = () => {
    const selectedExamsList = exams.filter(exam => 
      selectedRowKeys.includes(exam.id)
    );
    
    if (selectedExamsList.length > 0) {
      onSelectExams(selectedExamsList);
      onClose();
    } else {
      message.warning('Vui lòng chọn ít nhất một bộ đề');
    }
  };

  const renderExamStatus = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      'docx_to_html': { color: 'processing', text: 'Đang xử lý' },
      'done': { color: 'success', text: 'Hoàn thành' },
      'error': { color: 'error', text: 'Lỗi' },
      'none': { color: 'default', text: 'Chưa xử lý' }
    };
    
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  // Thêm hàm highlight text tìm kiếm
  const highlightSearchText = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return <span>{text}</span>;
    
    try {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      const parts = text.split(regex);
      
      return (
        <span>
          {parts.map((part, index) => {
            return regex.test(part) ? (
              <span key={index} className="bg-yellow-200 font-medium">{part}</span>
            ) : (
              <span key={index}>{part}</span>
            );
          })}
        </span>
      );
    } catch (e) {
      // Nếu có lỗi regex, trả về text gốc
      return <span>{text}</span>;
    }
  };

  // Cập nhật columns để highlight text tìm kiếm
  const columns = [
    {
      title: 'Tên bộ đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string) => (
        <div className="font-medium">
          {highlightSearchText(text, searchText)}
        </div>
      )
    },
    {
      title: 'Môn học',
      dataIndex: 'subject',
      key: 'subject',
      width: 120,
      render: (subject: string) => (
        <Tag color="blue">{subject || 'Chưa xác định'}</Tag>
      )
    },
    {
      title: 'ID bộ đề',
      dataIndex: 'code_id',
      key: 'code_id',
      width: 120,
      render: (code: string) => (
        <Space>
          <span className="font-mono text-xs">{highlightSearchText(code, searchText)}</span>
          <CopyOutlined className="text-blue-500 cursor-pointer" 
            onClick={() => {
              navigator.clipboard.writeText(code);
              message.success('Đã sao chép mã ID');
            }}
          />
        </Space>
      ),
    },
    {
      title: 'Trạng thái xử lý',
      dataIndex: 'status_exam',
      key: 'status_exam',
      width: 150,
      render: (status: string) => renderExamStatus(status),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      width: 120,
      render: (active: boolean) => (
        <Badge 
          status={active ? "success" : "default"} 
          text={active ? "Kích hoạt" : "Vô hiệu"}
          className={active ? "text-green-600" : "text-gray-500"} 
        />
      ),
    },
    {
      title: 'Số câu hỏi',
      dataIndex: 'total_question',
      key: 'total_question',
      width: 100,
      align: 'center' as const,
      render: (count: number) => (
        <div className="font-medium">{count || 0}</div>
      )
    },
  ];

  const rowSelection = {
    type: 'radio' as const,
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  // Thêm chức năng xóa tìm kiếm
  const handleClearSearch = () => {
    setSearchText('');
    setIsSearching(false);
    fetchExams(1, '');
  };

  return (
    <Drawer
      title="Danh sách bộ đề"
      placement="right"
      onClose={onClose}
      open={open}
      width="80%"
      headerStyle={{ borderBottom: '1px solid #f0f0f0', padding: '16px 24px' }}
      bodyStyle={{ padding: '24px', overflow: 'auto' }}
      extra={
        <Space>
          <Button onClick={onClose}>Hủy</Button>
          <Button 
            type="primary" 
            onClick={handleSelectExams}
            disabled={selectedRowKeys.length === 0}
            className="bg-green-500 hover:bg-green-600"
          >
            Xác nhận
          </Button>
        </Space>
      }
    >
      <div className="mb-6">
        <Input
          placeholder="Nhập ID hoặc tên bộ đề cần tìm"
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          className="rounded-lg"
          allowClear
          size="large"
          suffix={
            loading ? <LoadingOutlined spin /> : 
            <Button 
              type="primary" 
              onClick={handleSearch}
              size="small"
              className="bg-green-500 hover:bg-green-600 mr-1"
            >
              Tìm kiếm
            </Button>
          }
        />
      </div>

      {isSearching && searchText && (
        <div className="mb-4 text-sm">
          <Alert
            message={
              <span>
                {exams.length > 0 
                  ? `Kết quả tìm kiếm cho "${searchText}": ${pagination.total} bộ đề` 
                  : `Không tìm thấy bộ đề nào với từ khóa "${searchText}"`}
                <Button type="link" onClick={handleClearSearch} size="small">
                  Xóa tìm kiếm
                </Button>
              </span>
            }
            type={exams.length > 0 ? "info" : "warning"}
            showIcon
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} 
            tip="Đang tải bộ đề..."
          />
        </div>
      ) : exams.length === 0 ? (
        <Empty 
          description="Không tìm thấy bộ đề nào" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          className="my-10"
        />
      ) : (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={exams}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Tổng ${total} bộ đề`,
          }}
          onChange={handleTableChange}
          className="exam-list-table"
        />
      )}

      <style>
        {`
          .exam-list-table .ant-table-thead > tr > th {
            background-color: #f9fafb;
            font-weight: 500;
          }
          
          .exam-list-table .ant-table-row-selected > td {
            background-color: #f0f9ff !important;
          }
        `}
      </style>
    </Drawer>
  );
};

export default ExamsListDrawer; 