import React from 'react';
import { Drawer, Form, Input, Switch, Button, Space, Alert } from 'antd';
import RichTextEditor from '../../../../../components/RichTextEditor';
import CoverUpload from './CoverUpload';
import VideoUpload from './VideoUpload';
import FileUpload from './FileUpload';
import type { AddChapterFormValues } from './types';
import type { MenuBook } from '../../../../../api/menu-book/types';

interface AddChapterDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddChapterFormValues) => void;
  loading?: boolean;
  parentChapter?: MenuBook | null;
}

const AddChapterDrawer: React.FC<AddChapterDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
  parentChapter
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Drawer
      title={parentChapter ? `Thêm mục cho "${parentChapter.title}"` : "Thêm mới thông tin"}
      open={open}
      onClose={onClose}
      width={800}
      extra={
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          className="bg-[#45b630]"
        >
          Lưu
        </Button>
      }
    >
      {parentChapter && (
        <Alert
          message={`Bạn đang thêm mục con cho chương "${parentChapter.title}"`}
          type="info"
          showIcon
          className="mb-6"
        />
      )}

      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={{
          active: false,
          active_code_id: true,
        }}
      >
        <div className="flex gap-8">
          {/* Left side - Cover Upload */}
          <Form.Item
            name="cover"
            label={<span className="text-base">Ảnh bìa</span>}
            className="flex-shrink-0 mb-0"
          >
            <CoverUpload />
          </Form.Item>

          {/* Right side - Other Fields */}
          <div className="flex-1">
            <Form.Item
              name="title"
              label={<span className="text-base">Tiêu đề <span className="text-red-500">*</span></span>}
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
              <Input placeholder="Nhập tiêu đề" />
            </Form.Item>

            <Space size="large" className="w-full">
              <Form.Item
                name="active"
                valuePropName="checked"
                className="mb-0"
              >
                <Switch checkedChildren="Kích hoạt" unCheckedChildren="Chưa kích hoạt" />
              </Form.Item>

              <Form.Item
                name="active_code_id"
                valuePropName="checked"
                className="mb-0"
              >
                <Switch checkedChildren="Tạo code ID" unCheckedChildren="Không tạo code ID" />
              </Form.Item>
            </Space>

            {/* Additional Fields - Hidden as requested */}
            {/* 
            <div className="flex gap-4 mt-4">
              <Form.Item
                name="duration"
                label={<span className="text-base">Thời gian làm bài (phút)</span>}
                className="flex-1"
              >
                <Input type="number" min={0} placeholder="Nhập thời gian" />
              </Form.Item>

              <Form.Item
                name="question_count"
                label={<span className="text-base">Số lượng câu hỏi</span>}
                className="flex-1"
              >
                <Input type="number" min={0} placeholder="Nhập số lượng câu" />
              </Form.Item>
            </div>
            */}
          </div>
        </div>

        {/* Rich Text Content */}
        <Form.Item
          name="content"
          label={<span className="text-base">Nội dung</span>}
        >
          <RichTextEditor
            placeholder="Nhập nội dung..."
            className="min-h-[300px]"
          />
        </Form.Item>

        {/* Video Upload Section */}
        <Form.Item name="videos">
          <VideoUpload />
        </Form.Item>

        {/* File Upload Section */}
        <Form.Item name="files">
          <FileUpload />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddChapterDrawer;