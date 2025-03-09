import React from 'react';
import { Tag, Badge, Tabs } from 'antd';
import VideoDisplay from '../VideoDisplay';
import { HighSchoolSubjects } from '../QuestionModal/QuestionModal';
import { QuestionEntity } from './index';

interface QuestionContentProps {
  question: QuestionEntity;
}

/**
 * Component to display question content without modal wrapper
 * Can be used in different containers like Modal or Drawer
 */
const QuestionContent: React.FC<QuestionContentProps> = ({
  question
}) => {
  if (!question) return null;

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-2 mb-4">
        <Tag className="rounded-full px-3 py-1">
          Mã: <span className="font-medium">{question.code_id}</span>
        </Tag>
        <Tag color="blue" className="rounded-full px-3 py-1">
          {HighSchoolSubjects.find(s => s.value === question.subject)?.title || question.subject}
        </Tag>
        <Tag color="purple" className="rounded-full px-3 py-1">
          {question.type}
        </Tag>
        <Tag 
          color={
            question.level === 'easy' ? 'success' : 
            question.level === 'hard' ? 'error' : 'warning'
          } 
          className="rounded-full px-3 py-1"
        >
          {question.level === 'easy' ? 'Dễ' : question.level === 'hard' ? 'Khó' : 'Trung bình'}
        </Tag>
        <Tag 
          color={question.active ? 'success' : 'default'} 
          className="rounded-full px-3 py-1"
        >
          {question.active ? 'Đang kích hoạt' : 'Vô hiệu hóa'}
        </Tag>
      </div>
      
      <Tabs
        defaultActiveKey="question"
        items={[
          {
            key: 'question',
            label: 'Câu hỏi & Đáp án',
            children: (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Nội dung câu hỏi:</h3>
                  <div className="p-3 bg-gray-50 rounded-md" dangerouslySetInnerHTML={{ __html: question.question }} />
                </div>
                
                {question.options && question.options.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Các đáp án:</h3>
                    <div className="space-y-2">
                      {question.options.map((option, index) => (
                        <div 
                          key={index} 
                          className={`p-2 rounded-md flex items-start ${
                            question.answers.includes(option.type) 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="mr-2">
                            {question.answers.includes(option.type) ? (
                              <Badge status="success" />
                            ) : (
                              <Badge status="default" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium mr-2">{option.type}.</span>
                            <span dangerouslySetInnerHTML={{ __html: option.answer }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'solution',
            label: 'Giải thích',
            children: (
              <div className="space-y-4">
                {question.solution ? (
                  <div className="p-3 bg-blue-50 rounded-md" dangerouslySetInnerHTML={{ __html: question.solution }} />
                ) : (
                  <div className="text-gray-500 italic p-4 text-center">
                    Không có giải thích cho câu hỏi này
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'video',
            label: 'Video giải thích',
            children: (
              <div className="space-y-4">
                {question.video ? (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <VideoDisplay videoSource={question.video} />
                  </div>
                ) : (
                  <div className="text-gray-500 italic p-4 text-center">
                    Không có video giải thích cho câu hỏi này
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'info',
            label: 'Thông tin khác',
            children: (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold">Ngày tạo:</span> 
                    <div className="mt-1 text-gray-600">
                      {new Date(question.created_at).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">Cập nhật lần cuối:</span> 
                    <div className="mt-1 text-gray-600">
                      {new Date(question.updated_at).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">ID:</span> 
                    <div className="mt-1 text-gray-600">
                      {question.id}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">Mã câu hỏi:</span> 
                    <div className="mt-1 text-gray-600">
                      {question.code_id}
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default QuestionContent; 