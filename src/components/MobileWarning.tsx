import React from 'react';
import { Result } from 'antd';
import { MobileOutlined } from '@ant-design/icons';

const MobileWarning: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Result
        icon={<MobileOutlined style={{ fontSize: 72, color: '#ff4d4f' }} />}
        status="error"
        title="Thiết bị không được hỗ trợ"
        subTitle="Vui lòng truy cập trang quản trị bằng máy tính để có trải nghiệm tốt nhất."
        style={{ maxWidth: 500 }}
      />
    </div>
  );
};

export default MobileWarning;