import React from 'react';
import { Modal, Alert, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { MenuBook } from '../../../../api/menu-book/types';

const { Text } = Typography;

// Extended type for MenuBook with optional fields
interface ExtendedMenuBook extends MenuBook {
  description?: string;
  active_code_id?: boolean;
  video?: string;
}

interface DeleteMenuBookModalProps {
  menuBook: ExtendedMenuBook | null;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
}

const DeleteMenuBookModal: React.FC<DeleteMenuBookModalProps> = ({
  menuBook,
  open,
  onCancel,
  onConfirm,
  loading = false,
  error = null,
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center text-red-600">
          <ExclamationCircleOutlined className="mr-2" />
          <span>Xác nhận xóa</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Xóa"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
      onOk={onConfirm}
    >
      <div className="space-y-4">
        {error && (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
          />
        )}
        
        <p>
          Bạn có chắc chắn muốn xóa mục <Text strong>"{menuBook?.title}"</Text> không?
        </p>
        
        <p>
          Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
        </p>
      </div>
    </Modal>
  );
};

export default DeleteMenuBookModal;