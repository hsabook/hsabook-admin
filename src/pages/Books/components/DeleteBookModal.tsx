import React from 'react';
import { Modal, Alert, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { Book } from '../../../api/books/types';

const { Text } = Typography;

interface DeleteBookModalProps {
  book: Book | null;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
}

const DeleteBookModal: React.FC<DeleteBookModalProps> = ({
  book,
  open,
  onCancel,
  onConfirm,
  loading,
  error
}) => {
  if (!book) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-red-500">
          <ExclamationCircleOutlined />
          <span>Xác nhận xóa sách</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="Xóa"
      cancelText="Hủy"
      confirmLoading={loading}
      okButtonProps={{ 
        danger: true,
      }}
    >
      <div className="space-y-4">
        <div className="py-2">
          <p>
            Bạn có chắc chắn muốn xóa sách{' '}
            <Text strong>"{book.name}"</Text> không?
          </p>
          <Text type="secondary" className="block mt-1">
            Hành động này không thể hoàn tác.
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mt-4"
          />
        )}
      </div>
    </Modal>
  );
};

export default DeleteBookModal;