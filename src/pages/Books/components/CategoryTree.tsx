import React from 'react';
import { Tree } from 'antd';
import type { TreeProps } from 'antd/es/tree';
import { Tag, Space } from 'antd';
import type { Category } from '../types';

interface CategoryTreeProps {
  data: Category[];
  onSelect: (category: Category) => void;
  onDrop: TreeProps['onDrop'];
}

const CategoryTree: React.FC<CategoryTreeProps> = ({ data, onSelect, onDrop }) => {
  const renderTreeTitle = (item: Category) => (
    <div className="flex items-center justify-between py-1">
      <span>{item.name}</span>
      <Space>
        <Tag color="blue">{item.totalBooks}</Tag>
        <Tag color={item.status === 'active' ? 'success' : 'error'} className="rounded-full">
          {item.status === 'active' ? 'Hiển thị' : 'Ẩn'}
        </Tag>
      </Space>
    </div>
  );

  const convertToTreeData = (categories: Category[]) => {
    return categories.map(item => ({
      title: renderTreeTitle(item),
      key: item.key,
      children: item.children ? convertToTreeData(item.children) : undefined,
      data: item // Store the original category data
    }));
  };

  const handleSelect = (_: React.Key[], info: any) => {
    if (info.node && info.node.data) {
      onSelect(info.node.data);
    }
  };

  return (
    <Tree
      className="draggable-tree"
      draggable
      blockNode
      onDrop={onDrop}
      onSelect={handleSelect}
      treeData={convertToTreeData(data)}
    />
  );
};

export default CategoryTree;