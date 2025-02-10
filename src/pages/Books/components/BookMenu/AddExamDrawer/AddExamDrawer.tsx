import React from 'react';
import { Drawer, Form, Input, Switch, Button, Space, Alert } from 'antd';
import RichTextEditor from '../../../../../components/RichTextEditor';
import CoverUpload from '../AddChapterDrawer/CoverUpload';
import ExamUpload from './ExamUpload';
import type { AddExamFormValues } from './types';
import type { MenuBook } from '../../../../../api/menu-book/types';

interface AddExamDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddExamFormValues) => void;
  loading?: boolean;
  parentChapter?: MenuBook | null;
}

const AddExamDrawer: React.FC<AddExamDrawerProps> = ({
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
      title={parentChapter ? `Thêm bộ đề cho "${parentChapter.title}"` : "Thêm bộ đề"}
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
          message={`Bạn đang thêm bộ đề cho chương "${parentChapter.title}"`}
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

        {/* Exam Upload Section */}
        <Form.Item 
          name="exam"
          label={<span className="text-base">Đính kèm bộ đề</span>}
        >
          <ExamUpload />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddExamDrawer;