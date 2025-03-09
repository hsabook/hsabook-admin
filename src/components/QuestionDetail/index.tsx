import React from 'react';
import { Modal, Button } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import QuestionContent from './QuestionContent';

// Define interfaces for question detail
export interface QuestionOption {
  type: string;
  value: string;
  answer: string;
  checked: boolean;
}

export interface QuestionEntity {
  id: string;
  code_id: string;
  question: string;
  type: string;
  solution: string;
  options: QuestionOption[];
  answers: string[];
  subject: string;
  level: string;
  active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  video?: string;
}

interface QuestionDetailProps {
  question: QuestionEntity;
  isModalVisible: boolean;
  onClose: () => void;
}

/**
 * Component to display question details in a modal
 */
const QuestionDetail: React.FC<QuestionDetailProps> = ({
  question,
  isModalVisible,
  onClose
}) => {
  if (!question) return null;

  return (
    <Modal
      title={
        <div className="flex items-center">
          <InfoCircleOutlined className="text-blue-500 mr-2" />
          <span>Chi tiết câu hỏi</span>
        </div>
      }
      open={isModalVisible}
      onCancel={onClose}
      footer={[
        <Button 
          key="close" 
          onClick={onClose}
        >
          Đóng
        </Button>
      ]}
      width={800}
      maskClosable={true}
      destroyOnClose={false}
      className="question-detail-modal"
      bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
    >
      <QuestionContent question={question} />
    </Modal>
  );
};

export default QuestionDetail; 