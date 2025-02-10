import { useState } from 'react';
import { message } from 'antd';
import { createMenuBook } from '../../../../../api/menu-book';
import type { AddExamFormValues } from './types';

export const useExamSubmit = (bookId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: AddExamFormValues, parentId?: string) => {
    if (!values.title?.trim()) {
      message.error('Vui lòng nhập tiêu đề');
      return false;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        type: 'DE',
        book_id: bookId,
        title: values.title.trim(),
        description: values.content || '',
        cover: values.cover || '',
        active: values.active,
        active_code_id: values.active_code_id,
        attached: values.exam ? [values.exam] : undefined,
        parent_id: parentId || null, // Add parent_id to create exam as child
      };

      await createMenuBook(payload);
      message.success('Thêm bộ đề mới thành công');
      return true;
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      message.error(error.message || 'Có lỗi xảy ra khi thêm bộ đề');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
};