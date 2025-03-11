import { useState } from 'react';
import { message } from 'antd';
import { createMenuBook } from '../../../../../api/menu-book';
import { uploadFile } from '../../../../../api/upload';
import type { AddExamFormValues } from './types';

interface UseExamSubmitProps {
  bookId: string;
  parentId?: string;
  onSuccess?: () => void;
}

export const useExamSubmit = ({ bookId, parentId, onSuccess }: UseExamSubmitProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: AddExamFormValues) => {
    setLoading(true);
    
    try {
      // Debug logs
      console.log("🔍 useExamSubmit input values:", values);
      console.log("🔍 useExamSubmit exam file:", values.exam);
      console.log("🔍 useExamSubmit files:", values.files);
      console.log("🔍 useExamSubmit video data:", values.video, values.videos);
      
      // Prepare attached files array
      const attached: string[] = [];
      
      // Handle main exam file upload if exists
      if (values.exam) {
        try {
          console.log("📤 Uploading exam file:", values.exam);
          const fileUrl = await uploadFile(values.exam);
          console.log("✅ Exam file uploaded successfully:", fileUrl);
          attached.push(fileUrl);
        } catch (error) {
          console.error('❌ Failed to upload exam file:', error);
          message.error('Failed to upload exam file');
        }
      }
      
      // Handle additional files upload if exists
      if (values.files && values.files.length > 0) {
        console.log("📤 Uploading additional files:", values.files.length);
        for (const file of values.files) {
          try {
            if (file.originFileObj) {
              console.log("📤 Uploading file:", file.name);
              const fileUrl = await uploadFile(file.originFileObj);
              console.log("✅ File uploaded successfully:", fileUrl);
              attached.push(fileUrl);
            } else if (file.url) {
              // If file already has URL (previously uploaded)
              console.log("✅ Using existing file URL:", file.url);
              attached.push(file.url);
            }
          } catch (error) {
            console.error('❌ Failed to upload additional file:', error);
            message.error('Failed to upload one or more additional files');
          }
        }
      }
      
      // Get video URL from various possible sources
      let videoUrl = '';
      
      // First check direct video field (highest priority)
      if (values.video && typeof values.video === 'string' && values.video.trim() !== '') {
        videoUrl = values.video;
        console.log("🎬 Using video from direct field:", videoUrl);
      } 
      // Then check videos array
      else if (values.videos && values.videos.length > 0 && values.videos[0].content) {
        videoUrl = values.videos[0].content;
        console.log("🎬 Using video from videos array:", videoUrl);
      }
      
      console.log("🎬 Final video URL:", videoUrl || '(empty)');
      
      // Ensure attached is never null
      const safeAttached = attached.length > 0 ? attached : [];
      
      // Prepare payload according to API requirements
      const payload = {
        type: 'DE' as const,
        book_id: bookId,
        title: values.title,
        description: values.description || values.content || '',
        cover: values.cover || '',
        active: values.active,
        active_code_id: values.active_code_id,
        attached: safeAttached,
        video: videoUrl || '',
        exam_id: values.exam_id || '',
        parent_id: values.parent_id || parentId || null,
      };
      
      // Log final payload
      console.log("📦 useExamSubmit final payload:", JSON.stringify(payload, null, 2));
      
      // Send API request
      const response = await createMenuBook(payload);
      console.log("✅ API response:", response);
      
      message.success('Exam set added successfully');
      onSuccess?.();
      
      return response;
    } catch (error) {
      console.error('Failed to submit exam:', error);
      message.error('Failed to add exam set');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSubmit,
  };
};