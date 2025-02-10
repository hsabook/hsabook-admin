import React from 'react';
import { Form, Input, Select, Spin, InputNumber, Switch } from 'antd';
import { useBookFormData } from './useBookFormData';

export const BookDetails: React.FC = () => {
  const { categories, authors, subjectOptions, loading } = useBookFormData();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spin tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="space-y-6">
        <Form.Item
          name="title"
          label={<span className="text-base">Tên sách <span className="text-red-500">*</span></span>}
          rules={[{ required: true, message: 'Vui lòng nhập tên sách!' }]}
        >
          <Input 
            placeholder="Nhập tên sách"
            size="large"
            className="py-2"
          />
        </Form.Item>

        <Form.Item
          name="subjects"
          label={<span className="text-base">Môn học <span className="text-red-500">*</span></span>}
          rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
        >
          <Select
            placeholder="Chọn môn học"
            options={subjectOptions}
            className="w-full"
            size="large"
            allowClear
          />
        </Form.Item>

        <Form.Item
          name="authors"
          label={<span className="text-base">Tác giả</span>}
        >
          <Select
            mode="multiple"
            placeholder="Chọn tác giả"
            options={authors}
            className="w-full"
            size="large"
            allowClear
          />
        </Form.Item>

        <Form.Item
          name="categories"
          label={<span className="text-base">Danh mục</span>}
        >
          <Select
            mode="multiple"
            placeholder="Chọn danh mục"
            options={categories}
            className="w-full"
            size="large"
            allowClear
          />
        </Form.Item>

        <Form.Item
          name="expiration_date"
          label={<span className="text-base">Thời hạn sử dụng (tháng) <span className="text-red-500">*</span></span>}
          initialValue={12}
          rules={[{ required: true, message: 'Vui lòng nhập thời hạn sử dụng!' }]}
        >
          <InputNumber
            min={1}
            max={120}
            placeholder="Nhập số tháng"
            size="large"
            className="w-full"
          />
        </Form.Item>

        <Form.Item
          name="publisher"
          label={<span className="text-base">Nhà xuất bản</span>}
        >
          <Input 
            placeholder="Nhập tên nhà xuất bản"
            size="large"
            className="py-2"
          />
        </Form.Item>

        <Form.Item
          name="is_public"
          label={<span className="text-base">Công khai</span>}
          valuePropName="checked"
          initialValue={false}
        >
          <Switch />
        </Form.Item>
      </div>
    </div>
  );
};