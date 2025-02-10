import React from 'react';
import { Modal, Form, Input, Select, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { Subjects } from '../types';

const { TextArea } = Input;

interface BookFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
  title?: string;
}

const BookFormModal: React.FC<BookFormModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  title = 'Thêm sách mới'
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

  const mockCategories = [
    { label: 'Sách giáo khoa', value: 'textbook' },
    { label: 'Sách tham khảo', value: 'reference' },
    { label: 'Sách bài tập', value: 'workbook' },
  ];

  const mockAuthors = [
    { label: 'Nguyễn Văn A', value: 'author1' },
    { label: 'Trần Thị B', value: 'author2' },
    { label: 'Lê Văn C', value: 'author3' },
  ];

  const subjectOptions = Object.entries(Subjects).map(([key, value]) => ({
    label: value,
    value: key,
  }));

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({ ...values, cover: fileList[0]?.url });
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ có thể tải lên file ảnh!');
      return false;
    }
    return true;
  };

  const handleChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={1000}
      okText="Lưu"
      cancelText="Hủy"
      okButtonProps={{ className: 'bg-[#45b630]' }}
    >
      <div className="flex gap-8 mt-6">
        {/* Left side - Cover image */}
        <div className="w-1/3">
          <Form.Item
            name="cover"
            label="Ảnh bìa sách"
            valuePropName="fileList"
            className="w-full"
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              maxCount={1}
              className="w-full aspect-[3/4] !h-auto"
            >
              {fileList.length === 0 && (
                <div className="text-center">
                  <PlusOutlined />
                  <div className="mt-2">Tải ảnh lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </div>

        {/* Right side - Book details */}
        <div className="flex-1">
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
          >
            <Form.Item
              name="title"
              label="Tên sách"
              rules={[{ required: true, message: 'Vui lòng nhập tên sách!' }]}
            >
              <Input placeholder="Nhập tên sách" />
            </Form.Item>

            <Form.Item
              name="categories"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn danh mục"
                options={mockCategories}
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              name="subjects"
              label="Môn học"
              rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn môn học"
                options={subjectOptions}
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              name="authors"
              label="Tác giả"
              rules={[{ required: true, message: 'Vui lòng chọn tác giả!' }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn tác giả"
                options={mockAuthors}
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              name="summary"
              label="Tóm tắt nội dung"
            >
              <TextArea
                rows={4}
                placeholder="Nhập tóm tắt nội dung sách"
              />
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default BookFormModal;