import React, { useState } from 'react';
import { Drawer, Form, Input, Select, Switch, Button, Space, Upload, message, Radio, Checkbox, Card } from 'antd';
import { UploadOutlined, CodeOutlined, PlusOutlined, VideoCameraOutlined, YoutubeOutlined } from '@ant-design/icons';
import RichTextEditor from '../../components/RichTextEditor';
import type { UploadFile } from 'antd/es/upload/interface';
import { uploadFile } from '../../api/upload';

// Constants for question types and subjects
export const QUESTION_TYPE = {
  AN_ANSWER: 'Lựa chọn một đáp án',
  MULTIPLE_ANSWERS: 'Lựa chọn nhiều đáp án',
  TRUE_FALSE: 'Đúng/Sai',
  ENTER_ANSWER: 'Nhập đáp án',
  READ_UNDERSTAND: 'Đọc hiểu',
};

export const HighSchoolSubjects = [
  // Nhóm môn bắt buộc
  { title: 'Toán', value: 'Toán' },
  { title: 'Ngữ văn', value: 'Ngữ văn' },
  { title: 'Ngoại ngữ', value: 'Ngoại ngữ' },

  // Nhóm môn Khoa học Tự nhiên
  { title: 'Vật lý', value: 'Vật lý' },
  { title: 'Hóa học', value: 'Hóa học' },
  { title: 'Sinh học', value: 'Sinh học' },

  // Nhóm môn Khoa học Xã hội
  { title: 'Lịch sử', value: 'Lịch sử' },
  { title: 'Địa lý', value: 'Địa lý' },
  { title: 'Giáo dục công dân', value: 'Giáo dục công dân' },

  // Nhóm môn bổ trợ
  { title: 'Tin học', value: 'Tin học' },
  { title: 'Công nghệ', value: 'Công nghệ' },

  // Môn Giáo dục thể chất và quốc phòng
  { title: 'Thể dục', value: 'Thể dục' },
  { title: 'Giáo dục quốc phòng và an ninh', value: 'Giáo dục quốc phòng và an ninh' },

  // Môn Nghề phổ thông
  { title: 'Học nghề', value: 'Học nghề' },
];

// Difficulty levels
const DIFFICULTY_LEVELS = [
  { label: 'Dễ', value: 'easy' },
  { label: 'Trung bình', value: 'medium' },
  { label: 'Khó', value: 'hard' },
];

// Question sets
const QUESTION_SETS = [
  { label: 'Bộ câu hỏi 1', value: 'set1' },
  { label: 'Bộ câu hỏi 2', value: 'set2' },
  { label: 'Bộ câu hỏi 3', value: 'set3' },
];

interface QuestionModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
  title?: string;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  title = 'Thêm mới câu hỏi'
}) => {
  const [form] = Form.useForm();
  const [videoType, setVideoType] = useState<'upload' | 'embed' | null>(null);
  const [videoFileList, setVideoFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [questionType, setQuestionType] = useState(initialValues?.questionType || Object.keys(QUESTION_TYPE)[0]);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [multipleCorrectAnswers, setMultipleCorrectAnswers] = useState<string[]>([]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setUploading(true);
      
      // Handle video upload if needed
      let videoUrl = '';
      if (videoType === 'upload' && videoFileList.length > 0 && videoFileList[0].originFileObj) {
        videoUrl = await uploadFile(videoFileList[0].originFileObj);
      } else if (videoType === 'embed' && values.embedVideo) {
        videoUrl = values.embedVideo;
      }
      
      // Process answers for single choice questions
      if (questionType === 'AN_ANSWER' && values.answers) {
        values.answers = values.answers.map((answer: any, index: number) => ({
          ...answer,
          isCorrect: index === parseInt(correctAnswer || '0')
        }));
      }
      
      // Process answers for multiple choice questions
      if (questionType === 'MULTIPLE_ANSWERS' && values.answers) {
        values.answers = values.answers.map((answer: any, index: number) => ({
          ...answer,
          isCorrect: multipleCorrectAnswers.includes(index.toString())
        }));
      }
      
      const formData = {
        ...values,
        videoUrl: videoUrl || undefined,
        active: values.active || false,
        solution: values.solution || '',
      };
      
      await onSubmit(formData);
      form.resetFields();
      setVideoFileList([]);
      setVideoType(null);
      setCorrectAnswer(null);
      setMultipleCorrectAnswers([]);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleVideoTypeChange = (type: 'upload' | 'embed') => {
    setVideoType(type);
  };

  const handleQuestionTypeChange = (value: string) => {
    setQuestionType(value);
    setCorrectAnswer(null);
    setMultipleCorrectAnswers([]);
  };

  // Get letter for answer option (A, B, C, etc.)
  const getAnswerLetter = (index: number) => {
    return String.fromCharCode(65 + index); // 65 is ASCII for 'A'
  };

  const handleMultipleAnswerChange = (checkedValues: any[]) => {
    setMultipleCorrectAnswers(checkedValues);
  };

  // Custom footer for the drawer
  const drawerFooter = (
    <div className="flex justify-end gap-2">
      <Button onClick={onCancel}>
        Hủy
      </Button>
      <Button
        type="primary"
        onClick={handleSubmit}
        loading={uploading}
        className="bg-[#45b630]"
      >
        Lưu
      </Button>
    </div>
  );

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onCancel}
      width={800}
      closable={true}
      footer={drawerFooter}
      footerStyle={{ 
        borderTop: '1px solid #f0f0f0',
        padding: '10px 24px'
      }}
      extra={null} // Remove the extra buttons from header
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues || {
          subject: 'Toán',
          difficulty: 'medium',
          questionType: Object.keys(QUESTION_TYPE)[0],
          active: true,
        }}
        className="mt-4"
      >
        {/* Video Upload Section */}
        <div className="mb-6">
          <h3 className="text-base font-medium mb-3 flex items-center">
            <VideoCameraOutlined className="mr-2 text-[#45b630]" />
            Thêm video minh họa
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Card 
              hoverable 
              className={`cursor-pointer transition-all ${videoType === 'upload' ? 'border-[#45b630] bg-[#f6ffed]' : 'hover:border-[#45b630]'}`}
              onClick={() => handleVideoTypeChange('upload')}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <UploadOutlined className="text-2xl mb-2 text-[#45b630]" />
                <div className="font-medium">Upload video</div>
                <div className="text-xs text-gray-500 mt-1">Tải lên video từ máy tính</div>
              </div>
            </Card>
            
            <Card 
              hoverable 
              className={`cursor-pointer transition-all ${videoType === 'embed' ? 'border-[#45b630] bg-[#f6ffed]' : 'hover:border-[#45b630]'}`}
              onClick={() => handleVideoTypeChange('embed')}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <YoutubeOutlined className="text-2xl mb-2 text-red-500" />
                <div className="font-medium">Nhúng video</div>
                <div className="text-xs text-gray-500 mt-1">Nhúng video từ YouTube</div>
              </div>
            </Card>
          </div>
          
          {videoType === 'upload' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Upload
                fileList={videoFileList}
                onChange={({ fileList }) => setVideoFileList(fileList)}
                beforeUpload={() => false}
                maxCount={1}
                className="w-full"
              >
                <Button icon={<UploadOutlined />} className="w-full h-12">
                  Chọn video từ máy tính
                </Button>
              </Upload>
              <div className="mt-2 text-xs text-gray-500">
                Hỗ trợ: MP4, WebM (Tối đa 100MB)
              </div>
            </div>
          )}
          
          {videoType === 'embed' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Form.Item name="embedVideo" className="mb-1">
                <Input.TextArea 
                  placeholder="Dán mã nhúng video từ YouTube hoặc các nền tảng khác"
                  rows={3}
                />
              </Form.Item>
              <div className="text-xs text-gray-500">
                Ví dụ: <code>&lt;iframe src="https://www.youtube.com/embed/..."&gt;&lt;/iframe&gt;</code>
              </div>
            </div>
          )}
        </div>

        {/* Question Set - Hidden temporarily */}
        <Form.Item
          name="questionSet"
          label={<span style={{ display: 'none' }}>Thêm vào bộ câu hỏi</span>}
          style={{ display: 'none' }}
        >
          <Select
            placeholder="Chọn"
            options={QUESTION_SETS}
          />
        </Form.Item>

        {/* Subject */}
        <Form.Item
          name="subject"
          label="Môn học"
          rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
        >
          <Select
            placeholder="Chọn môn học"
            options={HighSchoolSubjects.map(subject => ({
              label: subject.title,
              value: subject.title
            }))}
          />
        </Form.Item>

        {/* Difficulty */}
        <Form.Item
          name="difficulty"
          label="Mức độ"
          rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
        >
          <Select
            placeholder="Chọn mức độ"
            options={DIFFICULTY_LEVELS}
          />
        </Form.Item>

        {/* Active Status */}
        <Form.Item
          name="active"
          valuePropName="checked"
          className="mb-4"
        >
          <Switch checkedChildren="Kích hoạt" unCheckedChildren="Chưa kích hoạt" />
        </Form.Item>

        {/* Question Type */}
        <Form.Item
          name="questionType"
          label="Loại câu hỏi"
          rules={[{ required: true, message: 'Vui lòng chọn loại câu hỏi!' }]}
        >
          <Select
            placeholder="Chọn loại câu hỏi"
            options={Object.entries(QUESTION_TYPE).map(([key, value]) => ({
              label: value,
              value: key
            }))}
            onChange={handleQuestionTypeChange}
          />
        </Form.Item>

        {/* Question Content */}
        <Form.Item
          name="content"
          label={<span>Nội dung câu hỏi <span className="text-red-500">*</span></span>}
          rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi!' }]}
        >
          <RichTextEditor
            placeholder="Nhập nội dung câu hỏi"
            className="min-h-[200px]"
          />
        </Form.Item>

        {/* Solution/Explanation */}
        <Form.Item
          name="solution"
          label="Giải thích đáp án"
        >
          <RichTextEditor
            placeholder="Nhập giải thích đáp án (không bắt buộc)"
            className="min-h-[150px]"
          />
        </Form.Item>

        {/* Answer Options - Conditional based on question type */}
        {questionType === 'AN_ANSWER' && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-base font-medium mb-3">Các đáp án</h3>
            <Form.List name="answers">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <div key={field.key} className="flex items-start mb-4">
                      <div className="flex-shrink-0 mr-3 mt-2">
                        <div className="w-8 h-8 rounded-full bg-[#45b630] text-white flex items-center justify-center font-bold">
                          {getAnswerLetter(index)}
                        </div>
                      </div>
                      <Form.Item
                        {...field}
                        name={[field.name, 'content']}
                        className="mb-0 flex-1"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung đáp án' }]}
                      >
                        <RichTextEditor
                          placeholder={`Nhập nội dung đáp án ${getAnswerLetter(index)}`}
                          className="min-h-[100px]"
                        />
                      </Form.Item>
                      <Button 
                        type="text" 
                        danger 
                        onClick={() => remove(field.name)}
                        className="ml-2"
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}
                  
                  {/* Correct answer selection for single choice */}
                  {fields.length > 0 && (
                    <div className="mb-4 mt-6 bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium mb-2">Chọn đáp án đúng:</div>
                      <Radio.Group 
                        onChange={(e) => setCorrectAnswer(e.target.value)} 
                        value={correctAnswer}
                      >
                        <Space direction="vertical">
                          {fields.map((field, index) => (
                            <Radio key={field.key} value={index.toString()}>
                              Đáp án {getAnswerLetter(index)}
                            </Radio>
                          ))}
                        </Space>
                      </Radio.Group>
                    </div>
                  )}
                  
                  <Form.Item>
                    <Button 
                      type="dashed" 
                      onClick={() => add({ content: '' })} 
                      block 
                      icon={<PlusOutlined />}
                    >
                      Thêm đáp án
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>
        )}

        {/* Multiple Answers */}
        {questionType === 'MULTIPLE_ANSWERS' && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-base font-medium mb-3">Các đáp án</h3>
            <Form.List name="answers">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <div key={field.key} className="flex items-start mb-4">
                      <div className="flex-shrink-0 mr-3 mt-2">
                        <div className="w-8 h-8 rounded-full bg-[#45b630] text-white flex items-center justify-center font-bold">
                          {getAnswerLetter(index)}
                        </div>
                      </div>
                      <Form.Item
                        {...field}
                        name={[field.name, 'content']}
                        className="mb-0 flex-1"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung đáp án' }]}
                      >
                        <RichTextEditor
                          placeholder={`Nhập nội dung đáp án ${getAnswerLetter(index)}`}
                          className="min-h-[100px]"
                        />
                      </Form.Item>
                      <Button 
                        type="text" 
                        danger 
                        onClick={() => remove(field.name)}
                        className="ml-2"
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}
                  
                  {/* Multiple correct answers selection */}
                  {fields.length > 0 && (
                    <div className="mb-4 mt-6 bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium mb-2">Chọn các đáp án đúng:</div>
                      <Checkbox.Group 
                        onChange={handleMultipleAnswerChange} 
                        value={multipleCorrectAnswers}
                      >
                        <Space direction="vertical" className="w-full">
                          {fields.map((field, index) => (
                            <Checkbox key={field.key} value={index.toString()}>
                              Đáp án {getAnswerLetter(index)}
                            </Checkbox>
                          ))}
                        </Space>
                      </Checkbox.Group>
                    </div>
                  )}
                  
                  <Form.Item>
                    <Button 
                      type="dashed" 
                      onClick={() => add({ content: '' })} 
                      block 
                      icon={<PlusOutlined />}
                    >
                      Thêm đáp án
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>
        )}

        {/* True/False Answer */}
        {questionType === 'TRUE_FALSE' && (
          <Form.Item
            name="correctAnswer"
            label="Đáp án đúng"
            rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng!' }]}
          >
            <Select
              options={[
                { label: 'Đúng', value: 'true' },
                { label: 'Sai', value: 'false' },
              ]}
            />
          </Form.Item>
        )}

        {/* Text Answer */}
        {questionType === 'ENTER_ANSWER' && (
          <Form.Item
            name="correctAnswer"
            label="Đáp án đúng"
            rules={[{ required: true, message: 'Vui lòng nhập đáp án đúng!' }]}
          >
            <RichTextEditor
              placeholder="Nhập đáp án đúng"
              className="min-h-[100px]"
            />
          </Form.Item>
        )}

        {/* Reading Comprehension */}
        {questionType === 'READ_UNDERSTAND' && (
          <div className="border-t pt-4 mt-4">
            <Form.Item
              name="readingText"
              label="Đoạn văn đọc hiểu"
              rules={[{ required: true, message: 'Vui lòng nhập đoạn văn đọc hiểu!' }]}
            >
              <RichTextEditor
                placeholder="Nhập đoạn văn đọc hiểu"
                className="min-h-[200px]"
              />
            </Form.Item>
          </div>
        )}
      </Form>
    </Drawer>
  );
};

export default QuestionModal;