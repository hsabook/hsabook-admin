import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { BookSearchProps } from '../types';

const BookSearch: React.FC<BookSearchProps> = ({ value, onChange }) => {
  return (
    <div className="p-4 border-b">
      <Input
        placeholder="Tìm kiếm"
        prefix={<SearchOutlined className="text-gray-400" />}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-md"
      />
    </div>
  );
};

export default BookSearch;