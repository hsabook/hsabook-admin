import React, { useState, useEffect } from 'react';
import { Drawer, Input, Button, Space, message, Spin } from 'antd';
import { DownloadOutlined, LoadingOutlined, HistoryOutlined } from '@ant-design/icons';
import CONFIG_APP from '../../../../utils/config';
import { useAuthStore } from '../../../../store/authStore';
import type { Book } from '../../../../api/books/types';

interface PublishHistory {
  name: string;
  url: string;
  time: string;
  amount?: number;
  timestamp: number;
}

interface BookPrintDrawerProps {
  book: Book;
  open: boolean;
  onClose: () => void;
}

const BookPrintDrawer: React.FC<BookPrintDrawerProps> = ({
  book,
  open,
  onClose,
}) => {
  const [quantity, setQuantity] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [history, setHistory] = useState<PublishHistory[]>([]);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (open) {
      fetchPublishHistory();
    }
  }, [open]);

  const fetchPublishHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${CONFIG_APP.API_ENDPOINT}/books/${book.id}/history-publish`,
        {
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHistory(data.data);
      } else {
        throw new Error('Failed to fetch publish history');
      }
    } catch (error) {
      console.error('Error fetching publish history:', error);
      message.error('Không thể tải lịch sử xuất bản');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!quantity) {
      message.warning('Vui lòng nhập số lượng');
      return;
    }

    const amount = parseInt(quantity, 10);
    if (isNaN(amount) || amount <= 0) {
      message.error('Số lượng không hợp lệ');
      return;
    }

    try {
      setPublishing(true);
      const response = await fetch(
        `${CONFIG_APP.API_ENDPOINT}/books/${book.id}/publish`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantity: amount,
            version: history.length,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        message.success('Xuất bản thành công');
        setHistory([data.data, ...history]);
        setQuantity('');
      } else {
        throw new Error('Failed to publish');
      }
    } catch (error) {
      console.error('Error publishing:', error);
      message.error('Không thể xuất bản');
    } finally {
      setPublishing(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Drawer
      title="Xác nhận thêm tài khoản ID sách?"
      open={open}
      onClose={onClose}
      width={800}
      extra={[
        <Button key="cancel" onClick={onClose}>
          Hủy bỏ
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handlePublish}
          loading={publishing}
          className="bg-[#45b630] ml-4"
          disabled={!quantity || loading}
        >
          Đồng ý
        </Button>,
      ]}
    >
      <div className="flex flex-col h-full">
        <p className="text-gray-600 mb-6">
          Khi bạn đồng ý thì ngay lập tức sẽ tạo ra một phiên bản mới của sách "{book.name}".
          Bạn có chắc chắn muốn thêm ID sách không?
        </p>

        <div className="bg-gray-50 p-6 rounded-lg flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <HistoryOutlined />
              <span>Lịch sử xuất bản ({history.length} lần xuất bản)</span>
            </h3>
          </div>

          <div className="space-y-3 mb-6">
            <label className="block">
              <span className="text-red-500">*</span> Số lượng xuất bản thêm
            </label>
            <Input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))}
              placeholder="Nhập số lượng"
              size="large"
              disabled={loading || publishing}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Space direction="vertical" align="center">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                <div className="text-gray-500 mt-2">Đang tải lịch sử...</div>
              </Space>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {history.map((item, index) => (
                <div
                  key={item.timestamp}
                  className="bg-white p-4 rounded-lg flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="font-medium">
                      Sách - {book.name} - Xuất lần {history.length - index - 1}
                    </div>
                    <div className="text-gray-500 text-sm">
                      Xuất {item.amount} bản • {formatDate(item.timestamp)}
                    </div>
                  </div>
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() => window.open(item.url)}
                    className="text-[#45b630] hover:text-[#3a9828]"
                  >
                    Tải xuống
                  </Button>
                </div>
              ))}

              {history.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Chưa có lịch sử xuất bản
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default BookPrintDrawer;