import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Select, Switch, Button, Space, Upload, message, Radio, Checkbox, Card, Tabs, Tooltip } from 'antd';
import { UploadOutlined, CodeOutlined, PlusOutlined, VideoCameraOutlined, YoutubeOutlined, MinusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import RichTextEditor from '../../components/RichTextEditor';
import type { UploadFile } from 'antd/es/upload/interface';
import { uploadFile } from '../../api/upload';
import { createQuestion, updateQuestion } from '../../api/questions';
import { api } from '../../utils/api';

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
  onSubmit?: (values: any) => void;
  questionId?: string;
  title?: string;
  zIndex?: number;
  onSuccess?: () => void;
  refreshData?: () => void;
  onQuestionCreated?: (question: any) => void;
  initialValues?: any;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  open,
  onCancel,
  onSubmit,
  questionId,
  title = 'Thêm mới câu hỏi',
  zIndex,
  initialValues,
  onSuccess,
  refreshData,
  onQuestionCreated
}) => {
  const [form] = Form.useForm();
  const [videoType, setVideoType] = useState<'upload' | 'embed' | null>(null);
  const [videoFileList, setVideoFileList] = useState<UploadFile[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [embedCode, setEmbedCode] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [questionType, setQuestionType] = useState(initialValues?.questionType || QUESTION_TYPE.AN_ANSWER);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [multipleCorrectAnswers, setMultipleCorrectAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [questionData, setQuestionData] = useState<any>(initialValues);

  // Fetch question data when questionId changes
  useEffect(() => {
    if (open && questionId) {
      fetchQuestionData(questionId);
    } else if (open && !questionId) {
      // Reset form and states when opening modal for new question
      resetForm();
    }
  }, [questionId, open]);

  // Reset form and states
  const resetForm = () => {
    form.resetFields();
    setQuestionData(null);
    setQuestionType(QUESTION_TYPE.AN_ANSWER);
    setVideoType(null);
    setVideoUrl('');
    setEmbedCode('');
    setCorrectAnswer(null);
    setMultipleCorrectAnswers([]);
    setVideoFileList([]);
  };

  // Fetch question data from API
  const fetchQuestionData = async (id: string) => {
    setLoading(true);
    // Show loading message
    const loadingMessage = message.loading('Đang tải thông tin câu hỏi...', 0);
    
    try {
      // Call API to get question details
      const response = await api(`/questions/${id}`);
      loadingMessage();
      const data = response.data;
      
      // Map difficulty levels
      const difficultyMap: Record<string, string> = {
        'easy': 'easy',
        'normal': 'medium',
        'hard': 'hard'
      };
      
      // Format question data for form
      const formattedQuestion = {
        id: data.id,
        content: data.question,
        questionType: data.type,
        difficulty: difficultyMap[data.level] || 'medium',
        subject: data.subject,
        active: data.active,
        solution: data.solution || '',
        embedVideo: data.video || '',
        answers: Array.isArray(data.options) 
          ? data.options.map((option: any, index: number) => ({
              content: option.answer,
              isCorrect: data.answers.includes(option.type)
            }))
          : []
      };
      
      console.log('Formatted question for editing:', formattedQuestion);
      
      // Set question data
      setQuestionData(formattedQuestion);
    } catch (error) {
      loadingMessage();
      console.error('Error fetching question details:', error);
      message.error('Không thể tải thông tin chi tiết của câu hỏi');
      onCancel(); // Close modal on error
    } finally {
      setLoading(false);
    }
  };

  // Update form and state when questionData changes
  useEffect(() => {
    if (open && questionData) {
      console.log('Initializing form with values:', questionData);
      
      // Cập nhật form
      form.setFieldsValue({
        ...questionData,
        content: questionData.content || questionData.question,
        subject: questionData.subject,
        difficulty: questionData.difficulty,
        questionType: questionData.questionType,
        active: questionData.active,
        solution: questionData.solution,
        answers: questionData.answers || []
      });
      
      console.log('questionData.questionType:', questionData.questionType);
      // Cập nhật state cho loại câu hỏi
      setQuestionType(questionData.questionType);
      
      // Cập nhật state cho video
      if (questionData.embedVideo) {
        // Kiểm tra nếu là mã nhúng iframe
        if (questionData.embedVideo.includes('<iframe')) {
          setVideoType('embed');
          setEmbedCode(questionData.embedVideo);
          form.setFieldsValue({ embedVideo: questionData.embedVideo });
        } else if (questionData.embedVideo.startsWith('https') && /\.(mp4|mov|webm|ogg)$/i.test(questionData.embedVideo)) {
          // Nếu là URL trực tiếp đến file video, chuyển sang tab Upload
          setVideoType('upload');
          setVideoUrl(questionData.embedVideo);
          // Lưu trữ URL video để sử dụng khi chuyển đổi loại video
          form.setFieldsValue({ videoUrl: questionData.embedVideo });
        }
      } else if (questionData.videoUrl) {
        setVideoType('upload');
        setVideoUrl(questionData.videoUrl);
        // Lưu trữ URL video để sử dụng khi chuyển đổi loại video
        form.setFieldsValue({ videoUrl: questionData.videoUrl });
      }
      
      // Cập nhật state cho đáp án đúng
      if (questionData.questionType === QUESTION_TYPE.AN_ANSWER && questionData.answers) {
        const correctIndex = questionData.answers.findIndex((answer: any) => answer.isCorrect);
        if (correctIndex >= 0) {
          setCorrectAnswer(correctIndex.toString());
        }
      } else if (questionData.questionType === QUESTION_TYPE.MULTIPLE_ANSWERS && questionData.answers) {
        const correctIndices = questionData.answers
          .map((answer: any, index: number) => answer.isCorrect ? index.toString() : null)
          .filter(Boolean);
        setMultipleCorrectAnswers(correctIndices);
      }
    }
  }, [questionData, form, open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values:', values);
      setUploading(true);

      // Handle video upload if needed
      let finalVideoUrl = '';
      if (videoType === 'upload') {
        if (videoFileList.length > 0 && videoFileList[0].originFileObj) {
          // If there's an uploaded file
          finalVideoUrl = await uploadFile(videoFileList[0].originFileObj);
        } else if (videoUrl && videoUrl.startsWith('https')) {
          // If it's a direct URL that has been entered
          finalVideoUrl = videoUrl;
        }
      } else if (videoType === 'embed') {
        // If it's an iframe embed code
        if (values.embedVideo && values.embedVideo.includes('<iframe')) {
          finalVideoUrl = values.embedVideo;
        }
      } else if (questionData && questionData.videoUrl) {
        // Keep old video URL if no changes
        finalVideoUrl = questionData.videoUrl;
      } else if (questionData && questionData.embedVideo) {
        // Keep old embed code if no changes
        finalVideoUrl = questionData.embedVideo;
      }

      // Ensure answers array exists and initialize with empty array if not
      if (!values.answers) {
        values.answers = [];
      }
      
      // Process answers for single choice questions
      if (questionType === QUESTION_TYPE.AN_ANSWER) {
        // If no answers, don't proceed
        if (values.answers.length === 0) {
          message.warning('Vui lòng thêm ít nhất một đáp án');
          setUploading(false);
          return;
        }
        
        console.log('correctAnswer:', correctAnswer);
        // Make sure correctAnswer is set, default to first answer if not specified
        if (correctAnswer === null) {
          setCorrectAnswer('0');
          // Use the first answer as correct if none selected
          values.answers = values.answers.map((answer: any, index: number) => ({
            ...answer,
            isCorrect: index === 0
          }));
        } else {
          values.answers = values.answers.map((answer: any, index: number) => ({
            ...answer,
            isCorrect: index === parseInt(correctAnswer)
          }));
        }
      }

      // Process answers for multiple choice questions
      if (questionType === QUESTION_TYPE.MULTIPLE_ANSWERS) {
        // If no answers, don't proceed
        if (values.answers.length === 0) {
          message.warning('Vui lòng thêm ít nhất một đáp án');
          setUploading(false);
          return;
        }
        
        // If no correct answers selected, warn user
        if (multipleCorrectAnswers.length === 0) {
          message.warning('Vui lòng chọn ít nhất một đáp án đúng');
          setUploading(false);
          return;
        }
        
        values.answers = values.answers.map((answer: any, index: number) => ({
          ...answer,
          isCorrect: multipleCorrectAnswers.includes(index.toString())
        }));
      }

      // Process answers for true/false questions
      if (questionType === QUESTION_TYPE.TRUE_FALSE) {
        if (!values.correctAnswer) {
          message.warning('Vui lòng chọn đáp án đúng hoặc sai');
          setUploading(false);
          return;
        }
        
        values.answers = [
          { content: 'Đúng', isCorrect: values.correctAnswer === 'true' },
          { content: 'Sai', isCorrect: values.correctAnswer === 'false' }
        ];
      }

      // Process answers for text input questions
      if (questionType === QUESTION_TYPE.ENTER_ANSWER) {
        if (!values.correctAnswer) {
          message.warning('Vui lòng nhập đáp án đúng');
          setUploading(false);
          return;
        }
        
        values.answers = [
          { content: values.correctAnswer, isCorrect: true }
        ];
      }

      // Format data for API submission
      const getAnswerLetter = (index: number) => String.fromCharCode(65 + index);
      let options: any[] = [];
      let answers: string[] = [];
      
      // Ensure answers array exists
      const answersArray = Array.isArray(values.answers) ? values.answers : [];
      
      console.log('Processing answers:', answersArray);

      if (values.questionType === QUESTION_TYPE.AN_ANSWER) {
        // Map answers to options format
        options = answersArray.map((answer: any, index: number) => ({
          checked: answer.isCorrect,
          answer: answer.content,
          value: answer.content,
          type: getAnswerLetter(index)
        }));

        // Find the correct answer index
        const correctIndex = answersArray.findIndex((a: any) => a.isCorrect);
        if (correctIndex >= 0) {
          answers = [getAnswerLetter(correctIndex)];
        } else if (answersArray.length > 0) {
          // Default to first answer if none marked as correct
          answers = [getAnswerLetter(0)];
          options[0].checked = true;
        }
      } else if (values.questionType === QUESTION_TYPE.MULTIPLE_ANSWERS) {
        // Map answers to options format
        options = answersArray.map((answer: any, index: number) => ({
          checked: answer.isCorrect,
          answer: answer.content,
          value: answer.content,
          type: getAnswerLetter(index)
        }));

        // Get all correct answers
        answers = answersArray
          .map((answer: any, index: number) => answer.isCorrect ? getAnswerLetter(index) : null)
          .filter(Boolean);
        
        // If no correct answers, default to first
        if (answers.length === 0 && answersArray.length > 0) {
          answers = [getAnswerLetter(0)];
          options[0].checked = true;
        }
      }

      const difficultyMap: Record<string, string> = {
        'easy': 'easy',
        'medium': 'normal',
        'hard': 'hard'
      };

      // Create final payload for API
      const payload = {
        active: values.active !== undefined ? values.active : true,
        subject: values.subject,
        level: difficultyMap[values.difficulty] || 'normal',
        video: finalVideoUrl || '',
        question: values.content || values.question || '',
        type: values.questionType,
        solution: values.solution || '',
        options: options.length > 0 ? options : [],
        answers: answers.length > 0 ? answers : []
      };

      console.log('Payload for submission:', payload);

      // Handle API calls
      if (questionData?.id) {
        // Show loading message
        const loadingMessage = message.loading('Đang cập nhật câu hỏi...', 0);
        
        try {
          // Update existing question
          await updateQuestion(questionData.id, payload);
          loadingMessage();
          message.success('Cập nhật câu hỏi thành công');
          
          // Call success callback if provided
          if (onSuccess) {
            onSuccess();
          }
          
          // Refresh data if needed
          if (refreshData) {
            refreshData();
          }
          
          // Close modal
          onCancel();
        } catch (error) {
          loadingMessage();
          console.error('Error updating question:', error);
          message.error(`Không thể cập nhật câu hỏi: ${(error as any)?.message || 'Lỗi không xác định'}`);
        }
      } else {
        // Show loading message
        const loadingMessage = message.loading('Đang tạo câu hỏi mới...', 0);
        
        try {
          // Create new question
          const newQuestion = await createQuestion(payload);
          loadingMessage();
          message.success('Thêm câu hỏi mới thành công');
          
          // Call success callback if provided
          if (onSuccess) {
            onSuccess();
          }
          
          // Refresh data if needed
          if (refreshData) {
            refreshData();
          }
          
          // Call onQuestionCreated callback if provided
          if (onQuestionCreated && newQuestion) {
            onQuestionCreated(newQuestion);
          }
          
          // Close modal
          onCancel();
          
          // Reset form
          resetForm();
        } catch (error) {
          loadingMessage();
          console.error('Error creating question:', error);
          message.error(`Không thể tạo câu hỏi: ${(error as any)?.message || 'Lỗi không xác định'}`);
        }
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleVideoTypeChange = (type: 'upload' | 'embed') => {
    setVideoType(type);
    
    // Chỉ xóa dữ liệu khi không phải đang chỉnh sửa câu hỏi
    if (!questionData) {
      if (type !== 'upload') {
        setVideoUrl('');
        setVideoFileList([]);
      }
      if (type !== 'embed') {
        setEmbedCode('');
      }
    } else {
      // Nếu đang chỉnh sửa câu hỏi, giữ lại dữ liệu video
      // Chỉ cập nhật loại video mà không xóa dữ liệu
      if (type === 'upload' && !videoUrl && questionData.videoUrl) {
        setVideoUrl(questionData.videoUrl);
      } else if (type === 'embed' && !embedCode && questionData.embedVideo) {
        setEmbedCode(questionData.embedVideo);
        form.setFieldsValue({ embedVideo: questionData.embedVideo });
      }
    }
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

  const handleVideoUpload = async (info: any) => {
    const { file, fileList } = info;
    setVideoFileList(fileList);

    if (file.status === 'done') {
      message.success(`${file.name} tải lên thành công`);
    } else if (file.status === 'error') {
      message.error(`${file.name} tải lên thất bại`);
    }

    // Create a preview URL for the video
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const url = URL.createObjectURL(fileList[0].originFileObj);
      setVideoUrl(url);
    } else {
      setVideoUrl('');
    }
  };

  const handleEmbedCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const code = e.target.value;
    setEmbedCode(code);

    // Chỉ chấp nhận mã iframe, không chấp nhận URL trực tiếp
    if (code.includes('<iframe') && code.includes('</iframe>')) {
      // Extract src from iframe
      const srcMatch = code.match(/src=["'](.*?)["']/);
      if (srcMatch && srcMatch[1]) {
        form.setFieldsValue({ embedVideo: code });
      } else {
        form.setFieldsValue({ embedVideo: code });
      }
    } else if (!code) {
      // Nếu xóa hết nội dung
      form.setFieldsValue({ embedVideo: '' });
    } else if (!code.includes('<iframe')) {
      // Nếu không phải iframe, hiển thị thông báo
      message.warning('Vui lòng nhập mã nhúng iframe hợp lệ');
    }
  };

  // Custom footer for the drawer
  const drawerFooter = (
    <div className="flex justify-end gap-2">
      <Button onClick={() => {
        form.resetFields();
        setVideoFileList([]);
        setVideoUrl('');
        setEmbedCode('');
        setVideoType(null);
        setCorrectAnswer(null);
        setMultipleCorrectAnswers([]);
        onCancel();
      }}>
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
      onClose={() => {
        form.resetFields();
        setVideoFileList([]);
        setVideoUrl('');
        setEmbedCode('');
        setVideoType(null);
        setCorrectAnswer(null);
        setMultipleCorrectAnswers([]);
        onCancel();
      }}
      width={800}
      closable={true}
      footer={drawerFooter}
      footerStyle={{
        borderTop: '1px solid #f0f0f0',
        padding: '10px 24px'
      }}
      extra={null} // Remove the extra buttons from header
      zIndex={zIndex}
    >
      <Form
        form={form}
        layout="vertical"
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
                <div className="text-xs text-gray-500 mt-1">Nhúng video từ YouTube hoặc URL</div>
              </div>
            </Card>
          </div>

          {videoType === 'upload' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Upload
                fileList={videoFileList}
                onChange={handleVideoUpload}
                beforeUpload={() => false}
                maxCount={1}
                className="w-full"
              >
                <Button icon={<UploadOutlined />} className="w-full h-12">
                  Chọn video từ máy tính
                </Button>
              </Upload>
              <div className="mt-2 text-xs text-gray-500">
                Hỗ trợ: MP4, MOV, WebM (Tối đa 5MB)
              </div>

              {videoUrl && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Xem trước video:</h4>
                  <div className="relative pt-[56.25%] bg-black rounded overflow-hidden">
                    <video 
                      src={videoUrl}
                      controls 
                      className="absolute top-0 left-0 w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {videoType === 'embed' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Form.Item name="embedVideo" className="mb-1">
                <Input.TextArea
                  placeholder="Dán mã nhúng iframe từ YouTube hoặc các nền tảng khác"
                  rows={3}
                  onChange={handleEmbedCodeChange}
                />
              </Form.Item>
              <div className="text-xs text-gray-500">
                Ví dụ: <code>&lt;iframe src="https://www.youtube.com/embed/..."&gt;&lt;/iframe&gt;</code>
              </div>

              {embedCode && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Xem trước video:</h4>
                  <div className="relative pt-[56.25%] bg-black rounded overflow-hidden">
                    {embedCode.includes('<iframe') ? (
                      <div
                        className="absolute top-0 left-0 w-full h-full"
                        dangerouslySetInnerHTML={{ 
                          __html: embedCode.replace('<iframe', '<iframe style="width:100%;height:100%;position:absolute;top:0;left:0;border:0;"') 
                        }}
                      />
                    ) : (
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                        Vui lòng nhập mã nhúng iframe hợp lệ
                      </div>
                    )}
                  </div>
                </div>
              )}
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
              value: value
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
          rules={[
            { 
              required: questionType === QUESTION_TYPE.ENTER_ANSWER || questionType === QUESTION_TYPE.READ_UNDERSTAND, 
              message: 'Vui lòng nhập giải thích đáp án!' 
            }
          ]}
        >
          <RichTextEditor
            placeholder={
              questionType === QUESTION_TYPE.ENTER_ANSWER || questionType === QUESTION_TYPE.READ_UNDERSTAND
                ? "Nhập giải thích đáp án"
                : "Nhập giải thích đáp án (không bắt buộc)"
            }
            className="min-h-[150px]"
          />
        </Form.Item>

        {/* Answer Options - Conditional based on question type */}
        {questionType === QUESTION_TYPE.AN_ANSWER && (
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
        {questionType === QUESTION_TYPE.MULTIPLE_ANSWERS && (
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
        {questionType === QUESTION_TYPE.TRUE_FALSE && (
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
        {/* {questionType === QUESTION_TYPE.ENTER_ANSWER && (
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
        )} */}

        {/* Reading Comprehension */}
        {/* {questionType === QUESTION_TYPE.READ_UNDERSTAND && (
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
        )} */}
      </Form>
    </Drawer>
  );
};

export default QuestionModal;
