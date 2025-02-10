import React from 'react';
import { Drawer } from 'antd';
import type { BookFormDrawerProps } from './types';
import BookForm from './BookForm';

const BookFormDrawer: React.FC<BookFormDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  title = 'Thêm sách mới'
}) => {
  // Create form ref to control form outside of BookForm component
  const formRef = React.useRef<any>(null);

  const handleClose = () => {
    // Reset form before closing
    formRef.current?.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={title}
      open={open}
      onClose={handleClose}
      width={720}
      destroyOnClose // Add this to ensure form state is destroyed when drawer closes
      styles={{
        body: {
          paddingBottom: 80,
        }
      }}
    >
      <BookForm
        ref={formRef}
        onSubmit={(values) => {
          onSubmit(values);
          handleClose();
        }}
        initialValues={initialValues}
      />
    </Drawer>
  );
};

export default BookFormDrawer;