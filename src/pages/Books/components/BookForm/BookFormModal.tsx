import React from 'react';
import { Modal } from 'antd';
import type { BookFormModalProps } from './types';
import BookForm from './BookForm';

const BookFormModal: React.FC<BookFormModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  title = 'Thêm sách mới'
}) => {
  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      onOk={() => {}}
      width={1000}
      okText="Lưu"
      cancelText="Hủy"
      okButtonProps={{ className: 'bg-[#45b630]' }}
    >
      <BookForm
        onSubmit={onSubmit}
        initialValues={initialValues}
      />
    </Modal>
  );
};

export default BookFormModal;