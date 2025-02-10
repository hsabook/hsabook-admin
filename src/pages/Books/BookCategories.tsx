import React, { useState } from 'react';
import { Card, Button, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { Category } from './types';
import CategoryTree from './components/CategoryTree';
import CategoryDetails from './components/CategoryDetails';
import { useCategoryTree } from './hooks/useCategoryTree';
import { mockCategories } from './data/mockData';

const BookCategories: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { categories, handleDrop } = useCategoryTree(mockCategories);

  const handleEdit = (category: Category) => {
    console.log('Edit category:', category);
  };

  const handleDelete = (key: string) => {
    console.log('Delete category:', key);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Danh mục sách</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          className="bg-[#45b630]"
        >
          Thêm danh mục
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <div className="mb-4">
            <Input
              placeholder="Tìm kiếm danh mục"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          <CategoryTree
            data={categories}
            onSelect={setSelectedCategory}
            onDrop={handleDrop}
          />
        </Card>

        <CategoryDetails
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <style>{`
        .draggable-tree .ant-tree-node-content-wrapper {
          flex: 1;
        }
        .draggable-tree .ant-tree-treenode {
          padding: 2px 0;
        }
      `}</style>
    </div>
  );
};

export default BookCategories;