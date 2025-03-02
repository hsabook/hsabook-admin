import React, { useState } from 'react';
import { Modal, Form, Input, Select, Switch, Button, Space, Upload, message } from 'antd';
import { UploadOutlined, CodeOutlined, PlusOutlined } from '@ant-design/icons';
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
  { title: 'Toán', value: 'Toan' },
  { title: 'Ngữ văn', value: 'NguVan' },
  { title: 'Ngoại ngữ', value: 'NgoaiNgu' },

  // Nhóm môn Khoa học Tự nhiên
  { title: 'Vật lý', value: 'VatLy' },
  { title: 'Hóa học', value: 'HoaHoc' },
  { title: 'Sinh học', value: 'SinhHoc' },

  // Nhóm môn Khoa học Xã hội
  { title: 'Lịch sử', value: 'LichSu' },
  { title: 'Địa lý', value: 'DiaLy' },
  { title: 'Giáo dục công dân', value: 'GiaoDucCongDan' },

  // Nhóm môn bổ trợ
  { title: 'Tin học', value: 'TinHoc' },
  { title: 'Công nghệ', value: 'CongNghe' },

  // Môn Giáo dục thể chất và quốc phòng
  { title: 'Thể dục', value: 'TheDuc' },
  { title: 'Giáo dục quốc phòng và an ninh', value: 'GiaoDucQuocPhong' },

  // Môn Nghề phổ thông
  { title: 'Học nghề', value: 'HocNghe' },
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
      
      const formData = {
        ...values,
        videoUrl: videoUrl || undefined,
        active: values.active || false,
      };
      
      await onSubmit(formData);
      form.resetFields();
      setVideoFileList([]);
      setVideoType(null);
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
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={uploading}
          className="bg-[#45b630]"
        >
          Lưu
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues || {
          subject: 'Toan',
          difficulty: 'easy',
          questionType: Object.keys(QUESTION_TYPE)[0],
          active: false,
        }}
        className="mt-4"
      >
        {/* Video Upload Section */}
        <div className="mb-6">
          <h3 className="text-base font-medium mb-3">Nhúng/tải video lên</h3>
          <div className="flex gap-2">
            <Button 
              icon={<UploadOutlined />} 
              onClick={() => handleVideoTypeChange('upload')}
              type={videoType === 'upload' ? 'primary' : 'default'}
              className={videoType === 'upload' ? 'bg-[#45b630]' : ''}
            >
              Upload video
            </Button>
            <Button 
              icon={<CodeOutlined />} 
              onClick={() => handleVideoTypeChange('embed')}
              type={videoType === 'embed' ? 'primary' : 'default'}
              className={videoType === 'embed' ? 'bg-[#45b630]' : ''}
            >
              Nhúng video
            </Button>
          </div>
          
          {videoType === 'upload' && (
            <Upload
              fileList={videoFileList}
              onChange={({ fileList }) => setVideoFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
              className="mt-3"
            >
              <Button icon={<UploadOutlined />}>Chọn video</Button>
            </Upload>
          )}
          
          {videoType === 'embed' && (
            <Form.Item name="embedVideo" className="mt-3">
              <Input.TextArea 
                placeholder="Dán mã nhúng video từ YouTube hoặc các nền tảng khác"
                rows={3}
              />
            </Form.Item>
          )}
        </div>

        {/* Question Set */}
        <Form.Item
          name="questionSet"
          label="Thêm vào bộ câu hỏi"
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
              value: subject.value
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

        {/* Answer Options - Conditional based on question type */}
        {(questionType === 'AN_ANSWER' || questionType === 'MULTIPLE_ANSWERS') && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-base font-medium mb-3">Các đáp án</h3>
            <Form.List name="answers">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Space key={field.key} className="flex items-start mb-2" align="baseline">
                      <Form.Item
                        {...field}
                        name={[field.name, 'isCorrect']}
                        valuePropName="checked"
                        className="mb-0"
                      >
                        <Switch size="small" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'content']}
                        className="mb-0 flex-1"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung đáp án' }]}
                      >
                        <Input placeholder={`Đáp án ${index + 1}`} />
                      </Form.Item>
                      <Button 
                        type="text" 
                        danger 
                        onClick={() => remove(field.name)}
                      >
                        Xóa
                      </Button>
                    </Space>
                  ))}
                  <Form.Item>
                    <Button 
                      type="dashed" 
                      onClick={() => add({ content: '', isCorrect: false })} 
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
            <Input placeholder="Nhập đáp án đúng" />
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
            
            <h3 className="text-base font-medium mb-3">Các câu hỏi con</h3>
            <Form.List name="subQuestions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <div key={field.key} className="border p-4 rounded-lg mb-4">
                      <h4 className="font-medium mb-2">Câu hỏi {index + 1}</h4>
                      <Form.Item
                        {...field}
                        name={[field.name, 'content']}
                        label="Nội dung câu hỏi"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
                      >
                        <Input placeholder="Nhập nội dung câu hỏi" />
                      </Form.Item>
                      
                      <Form.Item
                        {...field}
                        name={[field.name, 'type']}
                        label="Loại câu hỏi"
                      >
                        <Select
                          options={[
                            { label: 'Lựa chọn một đáp án', value: 'AN_ANSWER' },
                            { label: 'Nhập đáp án', value: 'ENTER_ANSWER' },
                          ]}
                        />
                      </Form.Item>
                      
                      <Form.List name={[field.name, 'answers']}>
                        {(answerFields, { add: addAnswer, remove: removeAnswer }) => (
                          <>
                            {answerFields.map((answerField, answerIndex) => (
                              <Space key={answerField.key} className="flex items-start mb-2" align="baseline">
                                <Form.Item
                                  {...answerField}
                                  name={[answerField.name, 'isCorrect']}
                                  valuePropName="checked"
                                  className="mb-0"
                                >
                                  <Switch size="small" />
                                </Form.Item>
                                <Form.Item
                                  {...answerField}
                                  name={[answerField.name, 'content']}
                                  className="mb-0 flex-1"
                                  rules={[{ required: true, message: 'Vui lòng nhập nội dung đáp án' }]}
                                >
                                  <Input placeholder={`Đáp án ${answerIndex + 1}`} />
                                </Form.Item>
                                <Button 
                                  type="text" 
                                  danger 
                                  onClick={() => removeAnswer(answerField.name)}
                                >
                                  Xóa
                                </Button>
                              </Space>
                            ))}
                            <Form.Item>
                              <Button 
                                type="dashed" 
                                onClick={() => addAnswer({ content: '', isCorrect: false })} 
                                block 
                                icon={<PlusOutlined />}
                              >
                                Thêm đáp án
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                      
                      <Button 
                        type="text" 
                        danger 
                        onClick={() => remove(field.name)}
                        className="mt-2"
                      >
                        Xóa câu hỏi này
                      </Button>
                    </div>
                  ))}
                  <Form.Item>
                    <Button 
                      type="dashed" 
                      onClick={() => add({ 
                        content: '', 
                        type: 'AN_ANSWER',
                        answers: [
                          { content: '', isCorrect: false },
                          { content: '', isCorrect: false },
                          { content: '', isCorrect: false },
                          { content: '', isCorrect: false }
                        ]
                      })} 
                      block 
                      icon={<PlusOutlined />}
                    >
                      Thêm câu hỏi con
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default QuestionModal;