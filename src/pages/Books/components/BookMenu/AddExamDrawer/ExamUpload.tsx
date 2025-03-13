import React, { useState } from 'react';
import { Radio, Space, Button, Upload, message } from 'antd';
import { UploadOutlined, DatabaseOutlined, FileWordOutlined } from '@ant-design/icons';
import { uploadFile } from '../../../../../api/upload';
import type { UploadFile, UploadFileStatus } from 'antd/es/upload/interface';

interface ExamUploadProps {
  value?: UploadFile;
  onChange?: (file: UploadFile | undefined) => void;
}

const ExamUpload: React.FC<ExamUploadProps> = ({ value, onChange }) => {
  const [uploadType, setUploadType] = useState<'repository' | 'file' | null>(null);

  const handleBeforeUpload = (file: File) => {
    // Check for empty files
    if (file.size === 0) {
      message.error('File rỗng không được chấp nhận');
      return Upload.LIST_IGNORE;
    }

    // Only accept .docx files
    if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      message.error('Chỉ chấp nhận file DOCX');
      return Upload.LIST_IGNORE;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error('Kích thước file không được vượt quá 10MB');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleChange = async ({ file, fileList }: any) => {
    // Handle file removal
    if (fileList.length === 0) {
      onChange?.(undefined);
      return;
    }

    // Handle new file upload
    if (file.status === 'uploading' && !file.url) {
      try {
        console.log('🔍 Debug - File being uploaded:', file);
        const url = await uploadFile(file.originFileObj);
        console.log('🔍 Debug - Upload URL:', url);
        
        // Create new file object with URL
        const uploadedFile: UploadFile = {
          uid: file.uid,
          name: file.name,
          status: 'done' as UploadFileStatus,
          url: url,
          size: file.size,
          type: file.type,
        };
        
        console.log('🔍 Debug - Uploaded file object:', uploadedFile);
        onChange?.(uploadedFile);
      } catch (error) {
        console.error('🔍 Debug - Upload error:', error);
        message.error('Không thể tải lên file');
        onChange?.(undefined);
      }
    }
  };

  const handleUploadTypeChange = (type: 'repository' | 'file') => {
    if (value) {
      // Clear existing file when switching types
      onChange?.(undefined);
    }
    setUploadType(type);
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <Radio.Group 
        value={uploadType}
        onChange={(e) => handleUploadTypeChange(e.target.value)}
      >
        <Space direction="vertical" className="w-full">
          {/* Repository Option */}
          <div 
            className={`border rounded-lg p-6 cursor-pointer transition-colors ${
              uploadType === 'repository' ? 'border-[#45b630] bg-[#f6ffed]' : 'hover:border-[#45b630]'
            }`}
          >
            <Radio value="repository" className="w-full">
              <div className="flex items-center justify-between">
                <Space size="middle">
                  <DatabaseOutlined className="text-xl text-[#45b630]" />
                  <div>
                    <div className="font-medium">Thêm bộ đề từ kho</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Chọn từ kho bộ đề có sẵn
                    </div>
                  </div>
                </Space>
                {uploadType === 'repository' && (
                  <Button 
                    type="primary"
                    size="middle"
                    className="bg-[#45b630]"
                  >
                    Chọn từ kho
                  </Button>
                )}
              </div>
            </Radio>
          </div>

          {/* File Upload Option */}
          <div 
            className={`border rounded-lg p-6 cursor-pointer transition-colors ${
              uploadType === 'file' ? 'border-[#45b630] bg-[#f6ffed]' : 'hover:border-[#45b630]'
            }`}
          >
            <Radio value="file" className="w-full">
              <div className="flex items-center justify-between">
                <Space size="middle">
                  <FileWordOutlined className="text-xl text-[#2B579A]" />
                  <div>
                    <div className="font-medium">Thêm bằng file DOCX</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Tải lên file Word (.docx)
                    </div>
                  </div>
                </Space>
                {uploadType === 'file' && !value && (
                  <Upload
                    accept=".docx"
                    maxCount={1}
                    showUploadList={false}
                    beforeUpload={handleBeforeUpload}
                    onChange={handleChange}
                    customRequest={({ onSuccess }) => {
                      setTimeout(() => {
                        onSuccess?.('ok');
                      }, 0);
                    }}
                  >
                    <Button 
                      type="primary"
                      icon={<UploadOutlined />}
                      className="bg-[#45b630]"
                    >
                      Chọn file
                    </Button>
                  </Upload>
                )}
              </div>
            </Radio>
          </div>
        </Space>
      </Radio.Group>

      {/* Display selected file info */}
      {value && uploadType === 'file' && (
        <div className={`mt-4 border rounded-lg p-4 ${value.size === 0 ? 'bg-red-50 border-red-300' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <Space>
              <FileWordOutlined className={`text-lg ${value.size === 0 ? 'text-red-500' : 'text-[#2B579A]'}`} />
              <div>
                <div className="font-medium">{value.name}</div>
                <div className={`text-sm ${value.size === 0 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                  {value.size === 0 ? 'File rỗng - Vui lòng chọn file khác' : formatFileSize(value.size || 0)}
                </div>
              </div>
            </Space>
            <Space>
              <Button 
                type="text" 
                danger
                onClick={() => {
                  onChange?.(undefined);
                }}
              >
                Xóa
              </Button>
              <Upload
                accept=".docx"
                maxCount={1}
                showUploadList={false}
                beforeUpload={handleBeforeUpload}
                onChange={handleChange}
                customRequest={({ onSuccess }) => {
                  setTimeout(() => {
                    onSuccess?.('ok');
                  }, 0);
                }}
              >
                <Button type="link">Thay đổi</Button>
              </Upload>
            </Space>
          </div>
          {value.size === 0 && (
            <div className="mt-2 text-red-500 text-sm">
              File rỗng không thể được sử dụng. Vui lòng chọn một file khác.
            </div>
          )}
        </div>
      )}

      {/* Help text */}
      {uploadType === 'file' && !value && (
        <div className="text-gray-500 text-sm">
          Định dạng: DOCX (Tối đa: 10MB)
        </div>
      )}
    </div>
  );
};

export default ExamUpload;