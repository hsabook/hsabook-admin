import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Image, message, Dropdown } from 'antd';
import { CopyOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, PlusOutlined, BookOutlined, FileWordOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuBook } from '../../../../api/menu-book/types';

interface BookMenuTableProps {
  data: MenuBook[];
  loading?: boolean;
  onDelete: (menuBook: MenuBook) => void;
  onEdit: (menuBook: MenuBook) => void;
  onAddChapter?: (parentChapter: MenuBook) => void;
  onAddExam?: (parentChapter: MenuBook) => void;
}

const BookMenuTable: React.FC<BookMenuTableProps> = ({ 
  data, 
  loading,
  onDelete,
  onEdit,
  onAddChapter,
  onAddExam
}) => {
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
      .then(() => message.success('Đã sao chép ID'))
      .catch(() => message.error('Không thể sao chép ID'));
  };

  const processData = (items: MenuBook[]): MenuBook[] => {
    return items.map(item => {
      const processedItem: any = { ...item };
      if (!item.children?.length) {
        processedItem.children = undefined;
      } else {
        processedItem.children = processData(item.children);
      }
      return processedItem;
    });
  };

  const getAddMenuItems = (record: MenuBook) => [
    {
      key: 'chapter',
      label: 'Thêm Chương',
      icon: <BookOutlined />,
      onClick: () => onAddChapter?.(record),
    },
    {
      key: 'exam',
      label: 'Thêm Bộ Đề',
      icon: <FileWordOutlined />,
      onClick: () => onAddExam?.(record),
    },
  ];

  const columns: ColumnsType<MenuBook> = [
    {
      title: 'STT',
      width: 70,
      align: 'center',
      render: (_: any, _record: any, index: number) => index + 1,
    },
    {
      title: 'Ảnh bìa',
      dataIndex: 'cover',
      width: 150,
      align: 'center',
      render: (cover: string) => (
        <div className="flex items-center justify-center w-[130px] h-[75px] overflow-hidden mx-auto">
          {cover ? (
            <Image
              src={cover}
              alt="Cover"
              className="w-full h-full object-contain rounded-lg"
              style={{ 
                maxHeight: '75px', 
                maxWidth: '130px',
                width: 'auto',
                height: 'auto'
              }}
              preview={{
                mask: 'Xem',
                maskClassName: 'rounded-lg',
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-50 rounded-lg border flex items-center justify-center text-gray-400">
              <span className="text-xs">No image</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 100,
      align: 'center',
      render: (type: string) => {
        const types = {
          'DE': { text: 'Đề', color: 'purple' },
          'BAI': { text: 'Bài', color: 'blue' },
          'CHUONG': { text: 'Chương', color: 'cyan' },
        };
        const typeInfo = types[type as keyof typeof types] || { text: type, color: 'default' };
        return (
          <Tag color={typeInfo.color} className="rounded-full px-4 py-1 text-center min-w-[80px] flex items-center justify-center">
            {typeInfo.text}
          </Tag>
        );
      },
    },
    {
      title: 'Tên',
      dataIndex: 'title',
      render: (title: string) => (
        <span className="font-medium">{title}</span>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'code_id',
      width: 120,
      align: 'center',
      render: (id: string) => (
        <Space>
          <span className="font-mono text-gray-600">{id}</span>
          <Button
            type="text"
            icon={<CopyOutlined className="text-gray-400 hover:text-gray-600" />}
            size="small"
            onClick={() => handleCopyId(id)}
          />
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      width: 130,
      align: 'center',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'error'} className="rounded-full px-3 py-1 text-center min-w-[100px] flex items-center justify-center">
          {active ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
        </Tag>
      ),
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updated_at',
      width: 180,
      align: 'center',
      render: (date: string) => (
        <span className="text-gray-600">
          {new Date(date).toLocaleString()}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 150,
      fixed: 'right',
      align: 'center',
      render: (_: any, record: MenuBook) => (
        <Space size="middle" className="flex justify-center">
          {record.type === 'CHUONG' && (onAddChapter || onAddExam) && (
            <Dropdown
              menu={{ items: getAddMenuItems(record) }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button 
                type="text" 
                icon={<PlusOutlined className="text-blue-500" />}
              />
            </Dropdown>
          )}
          {record.exam?.file_download && (
            <Tooltip title="Tải xuống">
              <Button 
                type="text" 
                icon={<FileTextOutlined className="text-green-500" />}
                onClick={() => window.open(record.exam.file_download)}
              />
            </Tooltip>
          )}
          <Tooltip title="Sửa">
            <Button 
              type="text" 
              icon={<EditOutlined className="text-blue-500" />} 
              onClick={() => onEdit(record)} 
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => onDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const processedData = processData(data);

  return (
    <Table
      columns={columns}
      dataSource={processedData}
      loading={loading}
      rowKey="id"
      pagination={{
        total: data.length,
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `${total} mục`,
        className: "px-4",
      }}
      className="ant-table-striped"
      scroll={{ x: 1300 }}
      rowClassName={(record, index) => 
        `${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-200`
      }
    />
  );
};

export default BookMenuTable;