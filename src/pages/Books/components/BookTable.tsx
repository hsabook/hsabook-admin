import React, { useState } from 'react';
import { Table, Tag, Space, Button, Dropdown, Tooltip, message, Switch, Image } from 'antd';
import { MoreOutlined, PrinterOutlined, EditOutlined, DeleteOutlined, CopyOutlined, EyeOutlined, MenuOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { Book } from '../../../api/books/types';
import BookUploadModal from './BookUploadModal';
import BookPrintDrawer from './BookPrintDrawer/BookPrintDrawer';

interface BookTableProps {
  data: Book[];
  loading?: boolean;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onViewOverview: (book: Book) => void;
}

const BookTable: React.FC<BookTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
  onViewOverview
}) => {
  const navigate = useNavigate();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPrintDrawerOpen, setIsPrintDrawerOpen] = useState(false);

  const handleCopyId = (id: number) => {
    navigator.clipboard.writeText(id.toString())
      .then(() => {
        message.success('Đã sao chép ID sách');
      })
      .catch(() => {
        message.error('Không thể sao chép ID sách');
      });
  };

  const getActionItems = (record: any) => {
    const items = [
      {
        key: 'overview',
        label: 'Xem tổng quan',
        icon: <EyeOutlined />,
        onClick: () => onViewOverview(record),
      },
      {
        key: 'upload',
        label: 'Upload sách để lấy bản thảo chứa ID',
        icon: <UploadOutlined />,
        onClick: () => {
          setSelectedBook(record);
          setIsUploadModalOpen(true);
        },
      }
    ]

    if(record?.status_add_code_id === 'success') {
      items.push({
        key: 'print',
        label: 'Lấy mã ID sách để in vào bìa',
        icon: <PrinterOutlined />,
        onClick: () => {
          setSelectedBook(record);
          setIsPrintDrawerOpen(true);
        },
      })
    }

    items.push({
      key: 'menu',
      label: 'Menu sách',
      icon: <MenuOutlined />,
      onClick: () => navigate(`/books/${record.id}/menu`),
    })
    items.push({
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: <EditOutlined />,
      onClick: () => onEdit(record),
    })
    
    items.push({
      key: 'delete',
      label: 'Xóa',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete(record),
    } as any)
    return items.sort((a, b) => b.label.length - a.label.length);
  };

  const columns: ColumnsType<Book> = [
    {
      title: 'Ảnh bìa',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 100,
      align: 'center',
      render: (avatar, record) => (
        avatar ? (
          <div className="w-[60px] h-[80px]">
            <Image
              src={avatar}
              alt={record?.name}
              width={60}
              height={80}
              className="w-full h-full object-cover rounded-sm"
              preview={{
                mask: 'View',
                maskClassName: 'rounded-sm',
              }}
            />
          </div>
        ) : (
          <div className="w-[60px] h-[80px] bg-gray-100 rounded-sm flex items-center justify-center text-gray-400">
            <div className="text-sm text-center">No image</div>
          </div>
        )
      ),
    },
    {
      title: 'Tên sách',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'ID sách',
      dataIndex: 'code_id',
      key: 'code_id',
      width: 150,
      align: 'center',
      render: (id) => (
        <div className="flex items-center gap-2">
          <span>{id}</span>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined className="text-gray-400 hover:text-gray-600" />}
            onClick={() => handleCopyId(id)}
          />
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      width: 120,
      align: 'center',
      render: (active) => (
        <Tag color={active ? 'success' : 'error'} className="rounded-full">
          {active ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
        </Tag>
      ),
    },
    {
      title: 'Công khai',
      dataIndex: 'is_public',
      key: 'is_public',
      width: 100,
      align: 'center',
      render: (isPublic) => (
        <Switch
          checked={isPublic}
          disabled
          size="small"
        />
      ),
    },
    {
      title: 'Nhà xuất bản',
      dataIndex: 'publishing_house',
      key: 'publishing_house',
      width: 150,
      align: 'center',
      render: (text) => text || '-',
    },
    {
      title: 'Danh mục',
      key: 'categories',
      width: 200,
      align: 'center',
      render: (_, record) => {
        const tags = record.book_tags;
        if (tags.length === 0) return '-';

        // Show first 2 tags
        const visibleTags = tags.slice(0, 2).map((tag) => (
          <Tag key={tag.id} color="purple" className="rounded-full">
            {tag.tag.name}
          </Tag>
        ));

        // If there are more tags, show count
        if (tags.length > 2) {
          return (
            <Tooltip
              title={
                <div className="space-y-1">
                  {tags.map(tag => (
                    <div key={tag.id}>{tag.tag.name}</div>
                  ))}
                </div>
              }
            >
              <Space wrap>
                {visibleTags}
                <Tag className="rounded-full">+{tags.length - 2}</Tag>
              </Space>
            </Tooltip>
          );
        }

        return <Space wrap>{visibleTags}</Space>;
      },
    },
    {
      title: 'Tác giả',
      key: 'authors',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space wrap>
          {record.authors.map((author) => (
            <Tag key={author.id} className="rounded-full">
              {author.user.full_name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'SL đã xuất',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
      render: (quantity) => quantity || 0,
    },
    {
      title: 'Thời gian cập nhật',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 150,
      align: 'center',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      width: 50,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined className="text-lg" />}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1500 }}
        pagination={{
          total: data.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `${total} items`,
          className: "px-4",
        }}
        className="ant-table-striped"
      />

      {selectedBook && (
        <>
          <BookUploadModal
            book={selectedBook}
            open={isUploadModalOpen}
            onClose={() => {
              setIsUploadModalOpen(false);
              setSelectedBook(null);
            }}
          />

          <BookPrintDrawer
            book={selectedBook}
            open={isPrintDrawerOpen}
            onClose={() => {
              setIsPrintDrawerOpen(false);
              setSelectedBook(null);
            }}
          />
        </>
      )}
    </div>
  );
};

export default BookTable;