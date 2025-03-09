import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { createCode, updateCode, getCode } from '../../../api/codes';
import { getBooks } from '../../../api/books';

const { Option } = Select;

interface CodeFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  codeId?: string;
}

const CodeFormModal: React.FC<CodeFormModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  codeId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!codeId;
  const title = isEditMode ? 'Edit Activation Code' : 'Create New Activation Code';

  useEffect(() => {
    if (visible) {
      fetchBooks();
      form.resetFields();
      
      if (isEditMode) {
        fetchCodeDetails();
      }
    }
  }, [visible, codeId]);

  const fetchBooks = async () => {
    try {
      const response = await getBooks({ page: 1, take: 100 });
      setBooks(response.data);
      console.log(`📚 CodeFormModal fetchBooks response:`, response);
    } catch (error) {
      console.error(`❌ CodeFormModal fetchBooks error:`, error);
      message.error('Failed to fetch books');
    }
  };

  const fetchCodeDetails = async () => {
    try {
      setLoading(true);
      const response = await getCode(codeId as string);
      form.setFieldsValue({
        code: response.code,
        book_id: response.book_id,
        status: response.active ? 'active' : 'inactive',
      });
      console.log(`🔍 CodeFormModal fetchCodeDetails response:`, response);
    } catch (error) {
      console.error(`❌ CodeFormModal fetchCodeDetails error:`, error);
      message.error('Failed to fetch code details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      // Convert status to active field
      const payload = {
        ...values,
        active: values.status === 'active',
      };
      
      // Remove status field as it's not in the API
      delete payload.status;
      
      if (isEditMode) {
        await updateCode(codeId as string, payload);
        message.success('Code updated successfully');
      } else {
        await createCode(payload);
        message.success('Code created successfully');
      }
      
      onSuccess();
      onCancel();
    } catch (error) {
      console.error(`❌ CodeFormModal handleSubmit error:`, error);
      message.error('Failed to save code');
    } finally {
      setSubmitting(false);
    }
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const length = 6;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    form.setFieldsValue({ code: result });
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
        >
          {isEditMode ? 'Update' : 'Create'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: 'inactive' }}
      >
        <Form.Item
          name="code"
          label="Activation Code"
          rules={[{ required: true, message: 'Please enter activation code' }]}
          extra={
            !isEditMode && (
              <Button type="link" onClick={generateRandomCode} style={{ padding: 0 }}>
                Generate random code
              </Button>
            )
          }
        >
          <Input placeholder="Enter activation code" />
        </Form.Item>

        <Form.Item
          name="book_id"
          label="Book"
          rules={[{ required: true, message: 'Please select a book' }]}
        >
          <Select
            placeholder="Select a book"
            loading={loading}
            showSearch
            optionFilterProp="children"
          >
            {books.map((book) => (
              <Option key={book.id} value={book.id}>
                {book.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
        >
          <Select>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CodeFormModal; 