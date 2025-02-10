import React from 'react';
import { Button, Tag, Space } from 'antd';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { BookListHeaderProps } from '../types';

const BookListHeader: React.FC<BookListHeaderProps> = ({ totalBooks, onRefresh, onAddNew }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">Sách</h1>
        <Tag color="gold" className="rounded-full">{totalBooks} sách</Tag>
      </div>
      <Space>
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          Làm mới
        </Button>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={onAddNew}
          className="bg-[#45b630]"
        >
          Thêm mới sách
        </Button>
      </Space>
    </div>
  );
};

export default BookListHeader;