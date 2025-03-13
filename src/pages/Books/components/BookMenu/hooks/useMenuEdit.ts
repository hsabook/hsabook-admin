import { useState } from 'react';
import { message } from 'antd';
import { updateMenuBook } from '../../../../../api/menu-book/menuBookService';
import type { MenuBook } from '../../../../../api/menu-book/types';

interface UseMenuEditOptions {
  onSuccess?: () => void;
}

export const useMenuEdit = (options: UseMenuEditOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (id: string, values: any) => {
    try {
      setLoading(true);
      setError(null);

      // Format the data for the API
      const payload = {
        type: values.type,
        title: values.title,
        description: values.description || '',
        cover: values.cover || null,
        active: values.active,
        active_code_id: values.active_code_id,
        exam_url_doc: values.exam_url_doc || null,
        exam_id: values.exam_id || null,
        video: values.video || ''
      };

      console.log('🔍 useMenuEdit - Submitting values:', JSON.stringify(payload, null, 2));

      // Call the API to update the menu book
      await updateMenuBook(id, payload);
      
      message.success('Cập nhật thành công');
      
      // Call the success callback if provided
      if (options.onSuccess) {
        options.onSuccess();
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ useMenuEdit - Submit error:', error);
      setError(error.message || 'Có lỗi xảy ra khi cập nhật');
      message.error(`Lỗi: ${error.message || 'Có lỗi xảy ra khi cập nhật'}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleSubmit
  };
}; 