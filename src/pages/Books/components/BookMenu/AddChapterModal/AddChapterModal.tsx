import React from 'react';
import { Modal, Form, Input, Switch, Upload, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import RichTextEditor from '../../../../../components/RichTextEditor';
import type { AddChapterFormValues } from './types';

interface AddChapterModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: AddChapterFormValues) => void;
  loading?: boolean;
}

const AddChapterModal: React.FC<AddChapterModalProps> = ({
  open,
  onCancel,
  onSubmit,
  loading
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title="Thêm mới thông tin"
      open={open}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          className="bg-[#45b630]"
        >
          Lưu
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        {/* Cover Image Upload */}
        <Form.Item name="cover" label="Ảnh bìa">
          <Upload
            listType="picture-card"
            maxCount={1}
            accept="image/png,image/jpeg,image/jpg"
            beforeUpload={() => false}
          >
            <div className="text-center">
              <PlusOutlined />
              <div className="mt-2">Tải ảnh lên</div>
            </div>
          </Upload>
        </Form.Item>

        {/* Title */}
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input placeholder="Nhập tiêu đề" />
        </Form.Item>

        {/* Active Status */}
        <Form.Item
          name="active"
          valuePropName="checked"
          initialValue={false}
        >
          <Switch checkedChildren="Kích hoạt" unCheckedChildren="Chưa kích hoạt" />
        </Form.Item>

        {/* Rich Text Content */}
        <Form.Item
          name="content"
          label="Nội dung"
        >
          <RichTextEditor
            placeholder="Nhập nội dung..."
            className="min-h-[300px]"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddChapterModal;