import React, { forwardRef, useImperativeHandle } from 'react';
import { Form, Button, message } from 'antd';
import type { BookFormValues } from './types';
import type { Book } from '../../../../api/books/types';
import { BookCover } from './BookCover';
import { BookDetails } from './BookDetails';
import { BookSummary } from './BookSummary';
import { useBookSubmit } from './useBookSubmit';

interface BookFormProps {
  onSubmit: (values: BookFormValues) => void;
  initialValues?: Book | null;
}

const BookForm = forwardRef<{ resetFields: () => void }, BookFormProps>(({
  onSubmit,
  initialValues
}, ref) => {
  const [form] = Form.useForm();
  const { isSubmitting, handleSubmit } = useBookSubmit(onSubmit, initialValues);

  const transformedValues = initialValues ? {
    title: initialValues.name,
    summary: initialValues.description,
    publisher: initialValues.publishing_house,
    subjects: initialValues.subject,
    expiration_date: initialValues.expiration_date,
    is_public: initialValues.is_public,
    categories: initialValues.book_tags.map((tag: any) => tag.tag.id),
    authors: initialValues.authors.map((author: any) => author.user.id),
  } : undefined;

  useImperativeHandle(ref, () => ({
    resetFields: () => form.resetFields()
  }));

  const onFinish = async (values: BookFormValues) => {
    try {
      await handleSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const onFinishFailed = () => {
    message.error('Vui lòng điền đầy đủ các trường bắt buộc');
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={transformedValues}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      className="py-6"
    >
      <div className="space-y-8">
        <div className="flex gap-12">
          <BookCover initialImage={initialValues?.avatar} />
          <BookDetails />
        </div>

        <div className="border-t pt-8">
          <BookSummary />
        </div>

        <div className="border-t pt-8">
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            className="w-full h-12 text-base bg-[#45b630]"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}
          </Button>
        </div>
      </div>
    </Form>
  );
});

BookForm.displayName = 'BookForm';

export default BookForm;