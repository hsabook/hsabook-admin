import React from 'react';
import { Form, Upload, Button, List, message } from 'antd';
import { UploadOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import { uploadFile } from '../../../../../api/upload';
import type { UploadFile } from 'antd/es/upload/interface';

interface FileUploadProps {
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  loading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  value = [], 
  onChange,
  loading 
}) => {
  const handleBeforeUpload = (file: File) => {
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      message.error('File không được vượt quá 50MB');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;

    try {
      const url = await uploadFile(file);
      const uploadedFile = {
        ...file,
        status: 'done',
        url,
        name: file.name,
        uid: file.uid,
      };
      onSuccess(uploadedFile);
      
      // Update file list
      const newFileList = [...value, uploadedFile];
      onChange?.(newFileList);
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Không thể tải lên file');
      onError();
    }
  };

  const handleRemove = (file: UploadFile) => {
    const newFileList = value.filter(item => item.uid !== file.uid);
    onChange?.(newFileList);
  };

  return (
    <Form.Item label="Đính kèm">
      <div className="space-y-4">
        <Upload
          multiple
          customRequest={handleUpload}
          fileList={value}
          beforeUpload={handleBeforeUpload}
          showUploadList={false}
          disabled={loading}
        >
          <Button icon={<UploadOutlined />} loading={loading}>
            Chọn file
          </Button>
        </Upload>

        {value.length > 0 && (
          <List
            size="small"
            bordered
            dataSource={value}
            renderItem={(file) => (
              <List.Item
                actions={[
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(file)}
                    disabled={loading}
                  />
                ]}
              >
                <div className="flex items-center gap-2">
                  <FileOutlined className="text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.size || 0)}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </Form.Item>
  );
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default FileUpload;