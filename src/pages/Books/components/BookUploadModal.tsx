import React, { useState } from 'react';
import { Modal, Upload, Button, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Book } from '../../../api/books/types';
import CONFIG_APP from '../../../utils/config';
import { useAuthStore } from '../../../store/authStore';

const { Dragger } = Upload;

interface BookUploadModalProps {
  book: Book;
  open: boolean;
  onClose: () => void;
}

const BookUploadModal: React.FC<BookUploadModalProps> = ({
  book,
  open,
  onClose,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const { accessToken } = useAuthStore();

  const handleBeforeUpload = (file: File) => {
    // Only accept .docx files
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (!isDocx) {
      message.error('Chỉ chấp nhận file DOCX');
      return Upload.LIST_IGNORE;
    }

    // Check file size (max 1GB)
    const maxSize = 1024 * 1024 * 1024; // 1GB in bytes
    if (file.size > maxSize) {
      message.error('Kích thước file không được vượt quá 1GB');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Vui lòng chọn file để tải lên');
      return;
    }

    const file = fileList[0].originFileObj;
    if (!file) {
      message.error('Không tìm thấy file');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${CONFIG_APP.API_ENDPOINT}/media/upload-book-add-code-id/${book.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'accept': '*/*',
          },
          body: formData,
        }
      );

      if (response.ok) {
        message.success('Tải lên thành công. Hệ thống đang xử lý file của bạn.');
        setFileList([]);
        onClose();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Có lỗi xảy ra khi tải lên file');
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi tải lên file');
    } finally {
      setUploading(false);
    }
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
    <Modal
      title={`Upload sách ID - ${book.name}`}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={uploading}>
          Hủy
        </Button>,
        <Button
          key="upload"
          type="primary"
          onClick={handleUpload}
          loading={uploading}
          className="bg-[#45b630]"
        >
          {uploading ? 'Đang tải lên...' : 'Tải lên'}
        </Button>
      ]}
    >
      <div className="py-4">
        <Dragger
          accept=".docx"
          maxCount={1}
          fileList={fileList}
          beforeUpload={handleBeforeUpload}
          onChange={({ fileList }) => setFileList(fileList)}
          onRemove={() => setFileList([])}
          disabled={uploading}
          customRequest={({ onSuccess }) => {
            setTimeout(() => {
              onSuccess?.('ok');
            }, 0);
          }}
          showUploadList={{
            showDownloadIcon: false,
            showRemoveIcon: true,
            removeIcon: <Button type="text" size="small" danger>Xóa</Button>
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined className="text-4xl text-[#45b630]" />
          </p>
          <p className="ant-upload-text font-medium">
            Kéo thả file vào đây hoặc click để chọn file
          </p>
          <p className="ant-upload-hint text-gray-500">
            Chỉ hỗ trợ file DOCX. Kích thước tối đa 1GB.
          </p>
        </Dragger>

        {fileList.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{fileList[0].name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(fileList[0].size || 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BookUploadModal;