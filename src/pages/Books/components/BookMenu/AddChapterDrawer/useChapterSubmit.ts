import { useState } from 'react';
import { message } from 'antd';
import { createMenuBook } from '../../../../../api/menu-book';
import type { AddChapterFormValues } from './types';

export const useChapterSubmit = (bookId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: AddChapterFormValues, parentId?: string) => {
    if (!values.title?.trim()) {
      message.error('Vui lòng nhập tiêu đề');
      return false;
    }

    try {
      setIsSubmitting(true);

      // Handle video upload/embed
      let videoUrl = '';
      if (values.videos?.[0]) {
        if (values.videos[0].type === 'upload') {
          videoUrl = values.videos[0].content;
        } else if (values.videos[0].type === 'embed') {
          videoUrl = values.videos[0].content;
        }
      }

      // Handle file attachments
      const attachedFiles = values.files || [];

      const payload = {
        type: 'CHUONG',
        book_id: bookId,
        title: values.title.trim(),
        description: values.content || '',
        cover: values.cover || '',
        active: values.active,
        video: videoUrl,
        attached: attachedFiles,
        active_code_id: values.active_code_id,
        parent_id: parentId || null,
      };

      await createMenuBook(payload);
      message.success('Thêm chương mới thành công');
      return true;
    } catch (error: any) {
      console.error('Error submitting chapter:', error);
      message.error(error.message || 'Có lỗi xảy ra khi thêm chương');
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