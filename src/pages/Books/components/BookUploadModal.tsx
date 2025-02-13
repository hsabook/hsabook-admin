import React, { useState, useEffect } from 'react';
import { Modal, Upload, Button, message, Spin, Space } from 'antd';
import { InboxOutlined, FileWordOutlined, DownloadOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { Book } from '../../../api/books/types';
import CONFIG_APP from '../../../utils/config';
import { useAuthStore } from '../../../store/authStore';

const { Dragger } = Upload;

interface BookUploadModalProps {
  book: Book;
  open: boolean;
  onClose: () => void;
}

interface BookUploadStatus {
  file_code_id_url: string;
  file_code_id_upload_url: string;
  status_add_code_id: 'not_add' | 'processing' | 'success';
}

const BookUploadModal: React.FC<BookUploadModalProps> = ({
  book,
  open,
  onClose,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<BookUploadStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    const checkUploadStatus = async () => {
      if (!open) return;
      
      try {
        setLoading(true);
        const response = await fetch(
          `${CONFIG_APP.API_ENDPOINT}/media/upload-book-add-code-id/${book.id}`,
          {
            headers: {
              'accept': '*/*',
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUploadStatus(data.data);
        } else {
          throw new Error('Failed to fetch upload status');
        }
      } catch (error) {
        console.error('Error checking upload status:', error);
        message.error('Không thể kiểm tra trạng thái tải lên');
      } finally {
        setLoading(false);
      }
    };

    checkUploadStatus();
  }, [book.id, open, accessToken]);

  const handleBeforeUpload = (file: File) => {
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (!isDocx) {
      message.error('Chỉ chấp nhận file DOCX');
      return Upload.LIST_IGNORE;
    }

    const maxSize = 1024 * 1024 * 1024; // 1GB in bytes
    if (file.size > maxSize) {
      message.error('Kích thước file không được vượt quá 1GB');
      return Upload.LIST_IGNORE;
    }

    if (fileList.length >= 1) {
      message.error('Chỉ được tải lên 1 file duy nhất');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    if (newFileList.length > 1) {
      message.error('Chỉ được tải lên 1 file duy nhất');
      return;
    }
    setFileList(newFileList);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="py-12 text-center">
          <Spin size="large" />
        </div>
      );
    }

    if (uploadStatus?.status_add_code_id === 'processing') {
      return (
        <div className="py-12 text-center">
          <Space direction="vertical" align="center" size="large">
            <LoadingOutlined style={{ fontSize: 48, color: '#45b630' }} spin />
            <div className="text-lg font-medium">Đang xử lý file</div>
            <div className="text-gray-500">
              Hệ thống đang xử lý file của bạn. Vui lòng quay lại sau.
            </div>
          </Space>
        </div>
      );
    }

    if (uploadStatus?.status_add_code_id === 'success') {
      return (
        <div className="py-8">
          <div className="text-center mb-8">
            <CheckCircleOutlined style={{ fontSize: 48, color: '#45b630' }} />
            <h3 className="text-lg font-medium mt-4">File đã được xử lý thành công</h3>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-200">
            <div className="flex items-center gap-4">
              <FileWordOutlined className="text-3xl text-[#2B579A]" />
              <div className="flex-1">
                <p className="font-medium">File đã xử lý</p>
                <p className="text-gray-500 text-sm">Nhấn nút tải xuống để lưu file</p>
              </div>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => window.open(uploadStatus.file_code_id_url)}
                className="bg-[#45b630]"
              >
                Tải xuống
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Default upload view (status_add_code_id === 'not_add')
    return (
      <div className="py-4">
        {fileList.length === 0 ? (
          <Dragger
            accept=".docx"
            maxCount={1}
            multiple={false}
            fileList={fileList}
            beforeUpload={handleBeforeUpload}
            onChange={handleChange}
            disabled={uploading}
            customRequest={({ onSuccess }) => {
              setTimeout(() => {
                onSuccess?.('ok');
              }, 0);
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
        ) : (
          <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <FileWordOutlined className="text-4xl text-[#2B579A]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-lg truncate">{fileList[0].name}</p>
                <p className="text-gray-500">
                  {formatFileSize(fileList[0].size || 0)}
                </p>
              </div>
              <Button 
                danger
                onClick={() => setFileList([])}
                disabled={uploading}
              >
                Xóa
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFooter = () => {
    if (loading || uploadStatus?.status_add_code_id === 'processing') {
      return [
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ];
    }

    if (uploadStatus?.status_add_code_id === 'success') {
      return [
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ];
    }

    return [
      <Button key="cancel" onClick={onClose} disabled={uploading}>
        Hủy
      </Button>,
      <Button
        key="upload"
        type="primary"
        onClick={handleUpload}
        loading={uploading}
        disabled={fileList.length === 0}
        className="bg-[#45b630]"
      >
        {uploading ? 'Đang tải lên...' : 'Tải lên'}
      </Button>
    ];
  };

  return (
    <Modal
      title={`Upload sách ID - ${book.name}`}
      open={open}
      onCancel={onClose}
      footer={renderFooter()}
      width={600}
    >
      {renderContent()}
    </Modal>
  );
};

export default BookUploadModal;