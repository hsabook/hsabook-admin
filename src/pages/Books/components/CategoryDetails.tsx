import React from 'react';
import { Card, Descriptions, Button, Space, Empty } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { CategoryDetailsProps } from '../types';

const CategoryDetails: React.FC<CategoryDetailsProps> = ({
  category,
  onEdit,
  onDelete,
}) => {
  if (!category) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Empty description="Chọn một danh mục để xem chi tiết" />
      </Card>
    );
  }

  return (
    <Card 
      title="Chi tiết danh mục"
      extra={
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => onEdit(category)}
            className="text-blue-500 hover:text-blue-600"
          >
            Sửa
          </Button>
          <Button 
            type="text" 
            icon={<DeleteOutlined />}
            onClick={() => onDelete(category.key)}
            className="text-red-500 hover:text-red-600"
          >
            Xóa
          </Button>
        </Space>
      }
    >
      <Descriptions column={1}>
        <Descriptions.Item label="Tên danh mục">
          {category.name}
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả">
          {category.description}
        </Descriptions.Item>
        <Descriptions.Item label="Số lượng sách">
          {category.totalBooks}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          {category.status === 'active' ? 'Hiển thị' : 'Ẩn'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default CategoryDetails;