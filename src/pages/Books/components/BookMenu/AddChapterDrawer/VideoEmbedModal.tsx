import React, { useState } from 'react';
import { Modal, Input, Alert, Button } from 'antd';
import { YoutubeOutlined } from '@ant-design/icons';

interface VideoEmbedModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (embedCode: string) => void;
}

const VideoEmbedModal: React.FC<VideoEmbedModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [embedCode, setEmbedCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    // Basic validation for iframe code
    if (!embedCode.includes('<iframe') || !embedCode.includes('youtube.com/embed/')) {
      setError('Vui lòng nhập mã nhúng YouTube hợp lệ');
      return;
    }

    onSubmit(embedCode);
    setEmbedCode('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <YoutubeOutlined className="text-red-500 text-xl" />
          <span>Nhúng video YouTube</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          className="bg-[#45b630]"
        >
          Thêm
        </Button>
      ]}
    >
      <div className="space-y-4">
        <p className="text-gray-500">
          Sao chép và dán mã nhúng từ YouTube vào đây:
        </p>

        <Input.TextArea
          value={embedCode}
          onChange={(e) => {
            setEmbedCode(e.target.value);
            setError(null);
          }}
          placeholder='<iframe width="560" height="315" src="https://www.youtube.com/embed/..." ...'
          rows={4}
        />

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
          />
        )}

        <div className="text-gray-500 text-sm">
          <p>Hướng dẫn:</p>
          <ol className="list-decimal ml-4 space-y-1">
            <li>Mở video YouTube bạn muốn nhúng</li>
            <li>Nhấp vào "Chia sẻ" {'>'} "Nhúng"</li>
            <li>Sao chép toàn bộ mã iframe</li>
            <li>Dán vào ô trên</li>
          </ol>
        </div>
      </div>
    </Modal>
  );
};

export default VideoEmbedModal;