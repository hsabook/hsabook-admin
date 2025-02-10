import React from 'react';
import { Space, Button, Input, Tag, Dropdown } from 'antd';
import { ReloadOutlined, PlusOutlined, ImportOutlined, FileTextOutlined, BookOutlined } from '@ant-design/icons';

const { Search } = Input;

interface BookMenuHeaderProps {
  totalItems: number;
  onRefresh: () => void;
  onAddChapter: () => void;
  onAddExam: () => void;
  searchValue: string;
  onSearch: (value: string) => void;
}

const BookMenuHeader: React.FC<BookMenuHeaderProps> = ({ 
  totalItems, 
  onRefresh,
  onAddChapter,
  onAddExam,
  searchValue,
  onSearch
}) => {
  const addMenuItems = [
    {
      key: 'chapter',
      label: 'Thêm Chương',
      icon: <BookOutlined />,
      onClick: onAddChapter,
    },
    {
      key: 'exam',
      label: 'Thêm Bộ Đề',
      icon: <FileTextOutlined />,
      onClick: onAddExam,
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">Menu sách</h1>
        <Tag color="gold" className="rounded-full px-3">{totalItems} mục</Tag>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Search 
          placeholder="Tìm kiếm theo tên hoặc ID..." 
          className="w-full sm:w-[300px]"
          allowClear
          size="large"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
        />
        <Space className="self-end">
          <Button 
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            size="large"
          >
            Làm mới
          </Button>
          <Dropdown 
            menu={{ items: addMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size="large"
              className="bg-[#45b630] hover:bg-[#3a9828]"
            >
              Thêm mục
            </Button>
          </Dropdown>
          <Button 
            icon={<ImportOutlined />}
            size="large"
          >
            Import
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default BookMenuHeader;