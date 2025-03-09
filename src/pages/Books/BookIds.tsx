import React, { useEffect, useState, useRef } from 'react';
import { Card, Table, Input, Button, Select, Space, message, Tooltip, Modal, Tag, Drawer, List, Avatar, Spin, Image } from 'antd';
import { SearchOutlined, ReloadOutlined, BookOutlined, CopyOutlined, CloseCircleFilled } from '@ant-design/icons';
import { getCodes, Code, CodeParams, deleteCode } from '../../api/codes';
import { getBooks } from '../../api/books';
import CodeFormModal from './components/CodeFormModal';
import './styles.css';

const { Option } = Select;
const { confirm } = Modal;

const BookIds: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Code[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [bookIdSearch, setBookIdSearch] = useState<string>('');
  const [books, setBooks] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedCodeId, setSelectedCodeId] = useState<string | undefined>(undefined);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [bookSearchResults, setBookSearchResults] = useState<any[]>([]);
  const [searchingBooks, setSearchingBooks] = useState<boolean>(false);
  const bookSearchInputRef = useRef<any>(null);

  const fetchCodes = async (params: CodeParams = {}) => {
    try {
      setLoading(true);
      const response = await getCodes({
        page: pagination.current,
        take: pagination.pageSize,
        search: searchText,
        status: statusFilter,
        ...params,
      });
      
      setData(response.data);
      setPagination({
        ...pagination,
        current: response.pagination.current_page,
        pageSize: response.pagination.take,
        total: response.pagination.total,
      });
      
      console.log(`🔍 BookIds fetchCodes response:`, response);
    } catch (error) {
      console.error(`❌ BookIds fetchCodes error:`, error);
      message.error('Failed to fetch codes');
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await getBooks({ 
        page: 1, 
        take: 100,
        sort_field: 'created_at',
        sort_type: 'DESC'
      });
      setBooks(response.data?.data || []);
    } catch (error) {
      console.error(`❌ BookIds fetchBooks error:`, error);
      message.error('Failed to fetch books');
    }
  };

  const searchBooks = async (search: string) => {
    try {
      setSearchingBooks(true);
      const params: any = { 
        page: 1, 
        take: 5,
        sort_field: 'created_at',
        sort_type: 'DESC'
      };
      
      if (search && search.trim()) {
        params.search = search;
      }
      
      const response = await getBooks(params);
      setBookSearchResults(response?.data?.data || []);
      console.log(`🔍 BookIds searchBooks response:`, response);
    } catch (error) {
      console.error(`❌ BookIds searchBooks error:`, error);
      message.error('Failed to search books');
      setBookSearchResults([]);
    } finally {
      setSearchingBooks(false);
    }
  };

  useEffect(() => {
    fetchCodes();
    fetchBooks();
  }, []);

  useEffect(() => {
    if (drawerVisible) {
      try {
        searchBooks(bookIdSearch);
        setTimeout(() => {
          const drawerInput = document.querySelector('.drawer-search-input input') as HTMLInputElement;
          if (drawerInput) {
            drawerInput.focus();
          }
        }, 300);
      } catch (error) {
        console.error('Error in drawer effect:', error);
      }
    }
  }, [drawerVisible]);

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
    fetchCodes({
      page: pagination.current,
      take: pagination.pageSize,
    });
  };

  // Hàm để chuyển đổi giá trị trạng thái thành tham số active
  const getActiveParam = (status: string) => {
    if (status === 'active') return true;
    if (status === 'inactive') return false;
    return undefined;
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    
    // Nếu có nhập mã kích hoạt, tìm kiếm theo mã kích hoạt
    if (searchText) {
      fetchCodes({ 
        page: 1, 
        code_id: searchText,
        book_id: bookIdSearch || undefined,
        active: getActiveParam(statusFilter)
      });
    } else {
      // Nếu không có mã kích hoạt, tìm kiếm theo các tham số khác
      fetchCodes({ 
        page: 1,
        book_id: bookIdSearch || undefined,
        active: getActiveParam(statusFilter)
      });
    }
  };

  const handleReset = () => {
    setSearchText('');
    setStatusFilter('');
    setBookIdSearch('');
    setPagination({ ...pagination, current: 1 });
    fetchCodes({ page: 1, search: '', status: '' });
  };

  const clearSearchText = () => {
    setSearchText('');
    setPagination({ ...pagination, current: 1 });
    
    // Khi xóa mã kích hoạt, tìm kiếm lại theo các tham số khác
    fetchCodes({ 
      page: 1,
      book_id: bookIdSearch || undefined,
      active: getActiveParam(statusFilter)
    });
  };

  const clearBookIdSearch = () => {
    setBookIdSearch('');
    // Khi xóa ID sách, cũng cần reset tìm kiếm
    setPagination({ ...pagination, current: 1 });
    
    // Tìm kiếm lại theo mã kích hoạt và trạng thái
    fetchCodes({ 
      page: 1,
      code_id: searchText || undefined,
      active: getActiveParam(statusFilter)
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard');
  };

  const showAddModal = () => {
    setSelectedCodeId(undefined);
    setModalVisible(true);
  };

  const showEditModal = (id: string) => {
    setSelectedCodeId(id);
    setModalVisible(true);
  };

  const handleDeleteCode = (id: string) => {
    confirm({
      title: 'Are you sure you want to delete this code?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteCode(id);
          message.success('Code deleted successfully');
          fetchCodes();
        } catch (error) {
          console.error(`❌ BookIds handleDeleteCode error:`, error);
          message.error('Failed to delete code');
        }
      },
    });
  };

  const handleBookSearch = () => {
    searchBooks(bookIdSearch);
  };

  const selectBook = (book: any) => {
    if (book && book.code_id) {
      setBookIdSearch(book.code_id.toString());
      setDrawerVisible(false);
      
      // Khi chọn sách, tìm kiếm mã kích hoạt theo ID sách
      setPagination({ ...pagination, current: 1 });
      fetchCodes({ 
        page: 1, 
        book_id: book.code_id,
        code_id: searchText || undefined,
        active: getActiveParam(statusFilter)
      });
    }
  };

  const handleBookIdSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBookIdSearch(value);
    
    // Nếu xóa hết giá trị, reset tìm kiếm
    if (!value) {
      setPagination({ ...pagination, current: 1 });
      fetchCodes({ 
        page: 1,
        code_id: searchText || undefined,
        active: getActiveParam(statusFilter)
      });
    }
  };

  const handleBookIdSearchPressEnter = () => {
    if (bookIdSearch) {
      setPagination({ ...pagination, current: 1 });
      fetchCodes({ 
        page: 1, 
        book_id: bookIdSearch,
        code_id: searchText || undefined,
        active: getActiveParam(statusFilter)
      });
    }
  };

  const showBookSearchDrawer = () => {
    if (!Array.isArray(bookSearchResults)) {
      setBookSearchResults([]);
    }
    setDrawerVisible(true);
  };

  const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    // Nếu xóa hết giá trị, reset tìm kiếm
    if (!value) {
      setPagination({ ...pagination, current: 1 });
      fetchCodes({ 
        page: 1,
        book_id: bookIdSearch || undefined,
        active: getActiveParam(statusFilter)
      });
    }
  };

  const handleSearchTextPressEnter = () => {
    handleSearch();
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Mã kích hoạt',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => (
        <Space>
          {text}
          <span className="copy-icon" onClick={() => copyToClipboard(text)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 12.9V17.1C16 20.6 14.6 22 11.1 22H6.9C3.4 22 2 20.6 2 17.1V12.9C2 9.4 3.4 8 6.9 8H11.1C14.6 8 16 9.4 16 12.9Z" stroke="#1890ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 6.9V11.1C22 14.6 20.6 16 17.1 16H16V12.9C16 9.4 14.6 8 11.1 8H8V6.9C8 3.4 9.4 2 12.9 2H17.1C20.6 2 22 3.4 22 6.9Z" stroke="#1890ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </Space>
      ),
    },
    {
      title: 'ID sách',
      dataIndex: 'book',
      key: 'bookId',
      render: (book: any) => (
        <Space>
          {book?.code_id}
          <span className="copy-icon" onClick={() => copyToClipboard(book?.code_id?.toString() || '')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 12.9V17.1C16 20.6 14.6 22 11.1 22H6.9C3.4 22 2 20.6 2 17.1V12.9C2 9.4 3.4 8 6.9 8H11.1C14.6 8 16 9.4 16 12.9Z" stroke="#1890ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 6.9V11.1C22 14.6 20.6 16 17.1 16H16V12.9C16 9.4 14.6 8 11.1 8H8V6.9C8 3.4 9.4 2 12.9 2H17.1C20.6 2 22 3.4 22 6.9Z" stroke="#1890ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </Space>
      ),
    },
    {
      title: 'Tên sách',
      dataIndex: 'book',
      key: 'bookName',
      render: (book: any) => book?.name || '',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'status',
      render: (active: any) => {
        const isActive = active !== null && typeof active === 'object';
        return (
          <div className="status-tag">
            <span className="status-dot" style={{ backgroundColor: isActive ? '#52c41a' : '#faad14' }}></span>
            <span>{isActive ? 'Đã kích hoạt' : 'Chưa kích hoạt'}</span>
          </div>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'createdAt',
      render: (date: string) => {
        if (!date) return '';
        try {
          const formattedDate = new Date(date).toLocaleDateString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          return formattedDate.replace(',', '');
        } catch (error) {
          console.error('Error formatting date:', error);
          return date;
        }
      },
    },
    {
      title: 'Tài khoản kích hoạt',
      dataIndex: 'active',
      key: 'activatedBy',
      render: (active: any) => {
        if (!active || !active.email) return '-';
        return active.email;
      },
    },
  ];

  const renderBookItem = (book: any) => {
    const bookCover = book?.avatar ? (
      <div className="book-cover">
        <img src={book.avatar} alt={book.name} />
      </div>
    ) : (
      <div className="book-cover book-cover-placeholder">
        <BookOutlined />
      </div>
    );

    const statusColor = book?.active ? '#52c41a' : '#faad14';
    const statusText = book?.active ? 'Đang hoạt động' : 'Không hoạt động';

    return (
      <div className="book-item" onClick={() => selectBook(book)}>
        {bookCover}
        <div className="book-info">
          <h3 className="book-title">{book?.name || ''}</h3>
          <div className="book-details">
            <div className="book-detail-item">
              <span className="book-detail-label">ID sách:</span>
              <span className="book-detail-value">
                {book?.code_id || ''}
                <CopyOutlined 
                  className="copy-icon-small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(book?.code_id?.toString() || '');
                  }} 
                />
              </span>
            </div>
            <div className="book-detail-item">
              <span className="book-detail-label">Môn học:</span>
              <span className="book-detail-value">{book?.subject || ''}</span>
            </div>
            {book?.publishing_house && (
              <div className="book-detail-item">
                <span className="book-detail-label">NXB:</span>
                <span className="book-detail-value">{book.publishing_house}</span>
              </div>
            )}
            <div className="book-detail-item">
              <span className="book-detail-label">Trạng thái:</span>
              <span className="book-detail-value" style={{ color: statusColor }}>
                <span className="status-dot-small" style={{ backgroundColor: statusColor }}></span>
                {statusText}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card title="Quản lý mã kích hoạt sách">
        <Space style={{ marginBottom: 16 }}>
          <div className="search-input-container">
            <Input
              placeholder="Nhập mã kích hoạt..."
              value={searchText}
              onChange={handleSearchTextChange}
              style={{ width: 200 }}
              onPressEnter={handleSearchTextPressEnter}
              prefix={<SearchOutlined />}
              suffix={
                searchText ? (
                  <CloseCircleFilled
                    className="clear-icon"
                    onClick={clearSearchText}
                  />
                ) : null
              }
            />
          </div>
          
          <div className="search-input-container">
            <Input
              ref={bookSearchInputRef}
              placeholder="Tìm kiếm theo ID sách..."
              value={bookIdSearch}
              onChange={handleBookIdSearchChange}
              style={{ width: 200 }}
              onFocus={showBookSearchDrawer}
              onClick={showBookSearchDrawer}
              onPressEnter={handleBookIdSearchPressEnter}
              prefix={<SearchOutlined />}
              suffix={
                bookIdSearch ? (
                  <CloseCircleFilled
                    className="clear-icon"
                    onClick={clearBookIdSearch}
                  />
                ) : null
              }
            />
          </div>
          
          <Select
            placeholder="Trạng thái"
            style={{ width: 150 }}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              // Khi thay đổi trạng thái, cập nhật tìm kiếm
              setPagination({ ...pagination, current: 1 });
              fetchCodes({ 
                page: 1, 
                book_id: bookIdSearch || undefined,
                code_id: searchText || undefined,
                active: getActiveParam(value)
              });
            }}
            allowClear
          >
            <Option value="">Tất cả</Option>
            <Option value="active">Đã kích hoạt</Option>
            <Option value="inactive">Chưa kích hoạt</Option>
          </Select>
          
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Làm mới
          </Button>
        </Space>
        
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng cộng ${total} mục`,
            position: ['bottomRight'],
          }}
          loading={loading}
          onChange={handleTableChange}
          className="book-ids-table"
        />
      </Card>

      <CodeFormModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={() => fetchCodes()}
        codeId={selectedCodeId}
      />

      {drawerVisible && (
        <Drawer
          title="Danh sách sách"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={500}
          className="book-drawer"
          closeIcon={<span className="drawer-close-icon">×</span>}
        >
          <div className="drawer-search-container">
            <Input
              className="drawer-search-input"
              placeholder="Tìm kiếm sách..."
              value={bookIdSearch}
              onChange={(e) => setBookIdSearch(e.target.value)}
              onPressEnter={handleBookSearch}
              prefix={<SearchOutlined />}
              suffix={
                bookIdSearch ? (
                  <CloseCircleFilled
                    className="clear-icon"
                    onClick={clearBookIdSearch}
                  />
                ) : null
              }
            />
          </div>

          {searchingBooks ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <div className="book-list">
              {bookSearchResults.length === 0 ? (
                <div className="empty-result">Không tìm thấy sách nào</div>
              ) : (
                bookSearchResults.map((book) => (
                  <div key={book?.id || Math.random().toString()}>
                    {renderBookItem(book)}
                  </div>
                ))
              )}
            </div>
          )}
        </Drawer>
      )}
    </>
  );
};

export default BookIds;