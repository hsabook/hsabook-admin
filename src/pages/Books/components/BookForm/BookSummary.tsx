import React from 'react';
import { Form } from 'antd';
import RichTextEditor from '../../../../components/RichTextEditor';

export const BookSummary: React.FC = () => {
  return (
    <Form.Item
      name="summary"
      label={<span className="text-base">Tóm tắt nội dung</span>}
      className="mb-0"
    >
      <RichTextEditor
        placeholder="Nhập tóm tắt nội dung sách"
        className="min-h-[400px]"
      />
    </Form.Item>
  );
};