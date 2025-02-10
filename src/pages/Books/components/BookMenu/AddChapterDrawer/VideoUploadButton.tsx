import React from 'react';
import { Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadVideo, validateVideoFile } from '../../../../../api/upload/videoService';

interface VideoUploadButtonProps {
  onSuccess: (url: string) => void;
  onError?: (error: string) => void;
  loading?: boolean;
}

const VideoUploadButton: React.FC<VideoUploadButtonProps> = ({ 
  onSuccess, 
  onError,
  loading 
}) => {
  const handleBeforeUpload = (file: File) => {
    const error = validateVideoFile(file);
    if (error) {
      message.error(error);
      onError?.(error);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleUpload = async (file: File) => {
    try {
      const url = await uploadVideo(file);
      onSuccess(url);
      message.success('Upload video thành công');
    } catch (error) {
      const errorMessage = 'Không thể upload video';
      message.error(errorMessage);
      onError?.(errorMessage);
      console.error('Upload error:', error);
    }
  };

  return (
    <Upload
      accept="video/mp4,video/webm,video/ogg"
      showUploadList={false}
      beforeUpload={handleBeforeUpload}
      customRequest={({ file }) => handleUpload(file as File)}
      disabled={loading}
    >
      <Button size="small" loading={loading}>
        <UploadOutlined /> Chọn file
      </Button>
    </Upload>
  );
};

export default VideoUploadButton;