import { useState } from 'react';
import { message } from 'antd';
import { uploadFile, createBook, updateBook } from '../../../../api';
import type { BookFormValues } from './types';
import type { Book } from '../../../../api/books/types';

export const useBookSubmit = (
  onSuccess: (values: BookFormValues) => void,
  editingBook?: Book | null
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: BookFormValues) => {
    try {
      setIsSubmitting(true);

      // Handle avatar URL:
      // 1. If there's a new file, upload it
      // 2. If the cover was removed (no file and editing), set empty string
      // 3. If editing and cover wasn't changed, keep existing URL
      let avatarUrl = '';
      if (values.cover?.[0]?.originFileObj) {
        avatarUrl = await uploadFile(values.cover[0].originFileObj);
      } else if (editingBook && values.cover?.[0]?.url) {
        avatarUrl = values.cover[0].url;
      }

      // Join multiple selections with commas
      const authorIds = Array.isArray(values.authors) ? values.authors.join(',') : values.authors;
      const categoryIds = Array.isArray(values.categories) ? values.categories.join(',') : values.categories;

      const bookData = {
        avatar: avatarUrl,
        name: values.title,
        description: values.summary || '',
        publishing_house: values.publisher || '',
        subject: values.subjects || '',
        authors: authorIds || '',
        tags: categoryIds || '',
        expiration_date: values.expiration_date || 12,
        is_public: values.is_public || false,
      };

      if (editingBook) {
        await updateBook(editingBook.id, bookData);
        message.success('Cập nhật sách thành công');
      } else {
        await createBook(bookData);
        message.success('Tạo sách mới thành công');
      }

      onSuccess(values);
    } catch (error: any) {
      console.error('Error submitting book:', error);
      message.error(error.message || 'Có lỗi xảy ra khi lưu sách');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
};