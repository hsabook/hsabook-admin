import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Switch, Button, Space, Alert, Upload, message, Card, List, Tag, Typography, Divider, Badge, Modal } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { UploadOutlined, YoutubeOutlined, PlusOutlined, DeleteOutlined, FileOutlined, InboxOutlined, DatabaseOutlined, EyeOutlined, ImportOutlined } from '@ant-design/icons';
import { uploadFile } from '../../../../../api/upload';
import RichTextEditor from '../../../../../components/RichTextEditor';
import type { MenuBook } from '../../../../../api/menu-book/types';
import ExamsListDrawer from '../AddExamDrawer/ExamsListDrawer';
import ExamDetailDrawer from '../../../../../components/ExamDetailDrawer';
import { QUESTION_TYPE, HighSchoolSubjects } from '../../../../../components/QuestionModal/QuestionModal';

const { Dragger } = Upload;
const { Text } = Typography;

interface ExtendedMenuBook extends Partial<MenuBook> {
  description?: string;
  active_code_id?: boolean;
  video?: string;
  attached?: any[];
  exam?: {
    id: string;
    title: string;
    file_upload?: string;
    file_download?: string;
    status_upload?: string;
    code_id?: string;
    active?: boolean;
    total_question?: number;
    status_exam?: string;
    exams_question?: any[];
  };
  exam_id?: string;
}

interface EditDrawerProps {
  menuBook: ExtendedMenuBook | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (id: string, values: any) => Promise<boolean>;
  loading?: boolean;
}

const EditDrawer: React.FC<EditDrawerProps> = ({
  menuBook,
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();
  
  // Cover file state
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  
  // Form control states
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isActiveCodeId, setIsActiveCodeId] = useState<boolean>(true);
  
  // Video states
  const [videoType, setVideoType] = useState<'upload' | 'embed' | null>(null);
  const [videoFileList, setVideoFileList] = useState<UploadFile[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [embedCode, setEmbedCode] = useState<string>('');
  const [hasVideo, setHasVideo] = useState<boolean>(false);

  // Attached files state
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  
  // Exam attachment states
  const [examFileList, setExamFileList] = useState<UploadFile[]>([]);
  const [hasExamFile, setHasExamFile] = useState<boolean>(false);
  const [examInfo, setExamInfo] = useState<any>(null);
  
  // Exam drawer states
  const [isExamListDrawerOpen, setIsExamListDrawerOpen] = useState<boolean>(false);
  const [selectedExams, setSelectedExams] = useState<any[]>([]);
  const [isExamDetailVisible, setIsExamDetailVisible] = useState<boolean>(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [examDocUrl, setExamDocUrl] = useState<string>('');
  const [examDocFileName, setExamDocFileName] = useState<string>('');
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);

  // Reset form and state when menuBook changes
  useEffect(() => {
    if (menuBook && open) {
      console.log('📋 Loading menu book data:', menuBook);
      
      form.setFieldsValue({
        type: menuBook.type || 'DE',
        title: menuBook.title || '',
        description: menuBook.description || '',
        active: menuBook.active !== undefined ? menuBook.active : true,
        active_code_id: typeof menuBook.active_code_id === 'boolean' ? menuBook.active_code_id : true,
        video: menuBook.video || '',
        exam_id: menuBook.exam?.id || menuBook.exam_id || '',
        exam_url_doc: menuBook.exam?.file_upload || '',
      });
      
      setIsActive(menuBook.active !== undefined ? menuBook.active : true);
      setIsActiveCodeId(typeof menuBook.active_code_id === 'boolean' ? menuBook.active_code_id : true);
      
      // Check if there's video content and set appropriate state
      if (menuBook.video) {
        // Determine if it's a direct URL (upload) or embed code
        if (menuBook.video.trim().toLowerCase().startsWith('http')) {
          console.log('🎬 Video is URL type:', menuBook.video);
          setVideoUrl(menuBook.video);
          setVideoFileList([{
            uid: '-1',
            name: 'Current video',
            status: 'done',
            url: menuBook.video
          }]);
          setHasVideo(true);
          setVideoType('upload');
        } else {
          console.log('🎬 Video is embed type:', menuBook.video);
          setEmbedCode(menuBook.video);
          setHasVideo(true);
          setVideoType('embed');
        }
      }
      
      // Set cover preview if exists
      if (menuBook.cover) {
        setFileList([
          {
            uid: '-1',
            name: 'cover',
            status: 'done',
            url: menuBook.cover,
          }
        ]);
      } else {
        setFileList([]);
      }

      // Set attached files if exist
      if (menuBook.attached && Array.isArray(menuBook.attached) && menuBook.attached.length > 0) {
        setAttachedFiles(menuBook.attached);
        console.log('📎 Attached files:', menuBook.attached);
      } else {
        setAttachedFiles([]);
      }
      
      // Set exam information if exists
      if (menuBook.exam) {
        console.log('📝 Exam information from API:', menuBook.exam);
        setExamInfo(menuBook.exam);
        
        // If there's an exam, add it to selectedExams list with complete details from API
        if (menuBook.exam.id) {
          // Convert the raw API data to a format suitable for our component
          const examData = {
            id: menuBook.exam.id,
            title: menuBook.exam.title || 'Bộ đề không có tiêu đề',
            code_id: menuBook.exam.code_id || '',
            active: menuBook.exam.active !== undefined ? menuBook.exam.active : false,
            total_question: Array.isArray(menuBook.exam.exams_question) ? menuBook.exam.exams_question.length : 0,
            status_upload: menuBook.exam.status_upload || 'none',
            status_exam: menuBook.exam.status_exam || 'await',
            file_upload: menuBook.exam.file_upload || null,
            file_download: menuBook.exam.file_download || null
          };
          
          console.log('📝 Setting selected exam with data:', examData);
          setSelectedExams([examData]);
          
          // Set exam ID in form
          form.setFieldsValue({ exam_id: examData.id });
          
          // Log state to verify it was set correctly
          console.log('📝 selectedExams array after setting:', [examData]);
          console.log('📝 Form value for exam_id:', examData.id);
        } else {
          console.log('⚠️ Exam object exists but missing ID');
        }
        
        if (menuBook.exam.file_upload) {
          setHasExamFile(true);
          setExamFileList([{
            uid: '-1',
            name: getFileNameFromUrl(menuBook.exam.file_upload),
            status: 'done',
            url: menuBook.exam.file_upload
          }]);
          setExamDocUrl(menuBook.exam.file_upload);
          setExamDocFileName(getFileNameFromUrl(menuBook.exam.file_upload));
        }
      } else {
        console.log('⚠️ No exam data found in menu book');
        setExamInfo(null);
        setExamFileList([]);
        setHasExamFile(false);
        setSelectedExams([]);
      }
    }
  }, [menuBook, open, form]);

  // Handle cover upload
  const handleCoverChange = async (info: any) => {
    const { file, fileList: newFileList } = info;
    
    // Handle file removal
    if (newFileList.length === 0) {
      setFileList([]);
      form.setFieldsValue({ cover: '' });
      return;
    }

    // Handle new file upload
    if (file.status === 'uploading') {
      setFileList(newFileList);
    }
    
    if (file.status === 'done') {
      // If the file has already been uploaded through the custom request
      if (file.originFileObj) {
        try {
          console.log("📤 Đang tải lên ảnh bìa:", file.name);
          const fileUrl = await uploadFile(file.originFileObj);
          console.log("✅ Tải lên ảnh bìa thành công:", fileUrl);
          
          // Create new file object with URL
          const uploadedFile = {
            uid: file.uid,
            name: file.name,
            status: 'done' as const,
            url: fileUrl,
          };

          // Update file list state
          setFileList([uploadedFile]);
          
          // Update form value
          form.setFieldsValue({ cover: fileUrl });
          message.success('Tải lên ảnh bìa thành công');
        } catch (error) {
          console.error('❌ Lỗi tải lên:', error);
          message.error('Tải lên ảnh bìa thất bại');
          setFileList([]);
          form.setFieldsValue({ cover: '' });
        }
      }
    }
  };

  // Handle video type selection
  const handleVideoTypeChange = (type: 'upload' | 'embed') => {
    if (hasVideo) return; // Không cho phép thay đổi nếu đã có video
    
    setVideoType(type);
    console.log(`Đã chọn loại video: ${type}`);
    
    // Reset the other type's data
    if (type === 'upload') {
      setEmbedCode('');
      form.setFieldsValue({ embedVideo: '' });
    } else {
      setVideoFileList([]);
      setVideoUrl('');
    }
  };

  // Handle video upload
  const handleVideoUpload = async (info: any) => {
    const { fileList } = info;
    setVideoFileList(fileList);
    console.log("🎬 Danh sách file video:", fileList);

    // If file is removed
    if (fileList.length === 0) {
      setVideoUrl('');
      form.setFieldsValue({ video: '' });
      setHasVideo(false);
      return;
    }

    const file = fileList[0];
    console.log("🎬 Đang xử lý file video:", file);
    
    // If the file is already an object with a URL (e.g., from a previous upload)
    if (file.url) {
      setVideoUrl(file.url);
      form.setFieldsValue({ video: file.url });
      setHasVideo(true);
      return;
    }
    
    // Check file type
    const acceptedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (file.type && !acceptedTypes.includes(file.type)) {
      message.error('Chỉ hỗ trợ định dạng MP4, MOV, WebM');
      setVideoFileList([]);
      return;
    }
    
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size && file.size > maxSize) {
      message.error('Kích thước file không được vượt quá 5MB');
      setVideoFileList([]);
      return;
    }

    // Upload file if it's a new one
    if (file.originFileObj) {
      try {
        console.log("📤 Đang tải lên file video:", file.name);
        const url = await uploadFile(file.originFileObj);
        console.log("✅ Tải lên video thành công:", url);
        
        // Set video URL and update form
        setVideoUrl(url);
        form.setFieldsValue({ video: url });
        setHasVideo(true);
        
        // Update file in the list
        const updatedFile = { ...file, status: 'done', url };
        setVideoFileList([updatedFile]);
      } catch (error) {
        console.error('❌ Lỗi tải lên video:', error);
        message.error('Tải lên video thất bại');
        setVideoFileList([]);
      }
    }
  };

  // Function to check if a URL is valid
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Handle embed code change
  const handleEmbedCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const code = e.target.value;
    setEmbedCode(code);
    
    // If the embed code is actually a URL
    if (isValidUrl(code) && code.trim().toLowerCase().startsWith('http')) {
      console.log('🔍 Detected URL in embed field, switching to upload type');
      setVideoType('upload');
      setVideoUrl(code);
      setVideoFileList([{
        uid: '-1',
        name: 'Video URL',
        status: 'done',
        url: code
      }]);
    } else {
      form.setFieldsValue({ video: code });
    }
    
    setHasVideo(!!code);
  };

  // Handle removing video
  const handleRemoveVideo = () => {
    // Hiển thị thông báo xác nhận
    Modal.confirm({
      title: 'Xác nhận xóa video',
      content: 'Bạn có chắc chắn muốn xóa video này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        // Xóa mọi dữ liệu liên quan đến video
        setVideoType(null);
        setVideoFileList([]);
        setVideoUrl('');
        setEmbedCode('');
        form.setFieldsValue({ video: '', embedVideo: '' });
        setHasVideo(false);
        
        // Thông báo xóa thành công
        message.success('Đã xóa video thành công');
      }
    });
  };

  // Hàm xử lý chung để xóa cả file và bộ đề
  const handleRemoveExamAndFile = () => {
    // Hiển thị thông báo xác nhận
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa file đính kèm và bộ đề liên quan không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        // Xóa mọi dữ liệu liên quan đến file
        setExamDocUrl('');
        setExamDocFileName('');
        setExamFileList([]);
        setHasExamFile(false);
        
        // Xóa mọi dữ liệu liên quan đến bộ đề
        setSelectedExams([]);
        
        // Cập nhật form
        form.setFieldsValue({ 
          file_upload: '',
          exam_url_doc: '',
          exam_id: ''
        });
        
        // Thông báo xóa thành công
        message.success('Đã xóa file đính kèm và bộ đề thành công');
      }
    });
  };

  // Handle doc file upload
  const handleDocUpload = async (file: File) => {
    // Validate file type
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isDoc = file.type === 'application/msword';
    const isPdf = file.type === 'application/pdf';
    
    if (!isDocx && !isDoc && !isPdf) {
      message.error('Chỉ chấp nhận file Word (doc, docx) hoặc PDF!');
      return Upload.LIST_IGNORE;
    }
    
    // Validate file size (10MB max)
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File không được vượt quá 10MB!');
      return Upload.LIST_IGNORE;
    }
    
    try {
      setUploadingDoc(true);
      message.loading({ content: 'Đang tải lên file...', key: 'docUpload' });
      const fileUrl = await uploadFile(file);
      
      // QUAN TRỌNG: Cập nhật state và form value
      console.log("📄 File URL sau khi upload:", fileUrl);
      
      // Cập nhật state
      setExamDocUrl(fileUrl);
      setExamDocFileName(file.name);
      
      // Create a new exam object with default values
      const newExam = {
        id: menuBook?.exam?.id || '',
        title: file.name.split('.')[0] || 'Bộ đề mới',
        code_id: menuBook?.exam?.code_id || '',
        active: menuBook?.exam?.active || true,
        total_question: 0,
        status_upload: 'processing',
        status_exam: 'await',
        file_upload: fileUrl,
        file_download: null
      };
      
      // Update selected exams with the new data
      setSelectedExams([newExam]);
      
      // Update form values - ĐẢM BẢO exam_url_doc LUÔN ĐƯỢC CẬP NHẬT
      form.setFieldsValue({ 
        exam_url_doc: fileUrl,
        exam_id: menuBook?.exam?.id || ''
      });
      
      // Log để kiểm tra
      console.log("📋 Form sau khi set exam_url_doc:", form.getFieldsValue());
      console.log("📝 Giá trị exam_url_doc đã được set:", form.getFieldValue('exam_url_doc'));
      console.log("📝 State examDocUrl đã được set:", fileUrl);
      
      message.success({ content: 'Tải lên file thành công', key: 'docUpload' });
    } catch (error) {
      console.error('❌ Lỗi tải lên file đề:', error);
      message.error({ content: 'Tải lên file thất bại', key: 'docUpload' });
    } finally {
      setUploadingDoc(false);
    }
    
    return false;
  };
  
  // Handle selecting exams from repository
  const handleSelectExams = (exams: any[]) => {
    if (exams && exams.length > 0) {
      console.log('📚 Đã chọn bộ đề:', exams[0]);
      setSelectedExams(exams);
      
      // Set exam_id in form
      form.setFieldsValue({ exam_id: exams[0].id });
      
      // Close drawer
      setIsExamListDrawerOpen(false);
    }
  };
  
  // Handle viewing exam details
  const handleViewExamDetails = (examId: string) => {
    setSelectedExamId(examId);
    setIsExamDetailVisible(true);
  };
  
  // Handle closing exam detail drawer
  const handleCloseExamDetail = () => {
    setIsExamDetailVisible(false);
    setSelectedExamId(null);
  };
  
  // Handle exam file upload
  const handleExamFileChange = async (info: any) => {
    const { file, fileList: newFileList } = info;
    
    // Handle file removal
    if (newFileList.length === 0) {
      setExamFileList([]);
      form.setFieldsValue({ file_upload: '' });
      setHasExamFile(false);
      return;
    }

    // Handle file upload
    setExamFileList(newFileList);
    
    if (file.status === 'uploading') {
      console.log("📤 Đang tải lên file bộ đề:", file);
    }
    
    if (file.status === 'done') {
      // If file has originFileObj, it's a new file that needs to be uploaded
      if (file.originFileObj) {
        try {
          console.log("📤 Đang tải lên file bộ đề:", file.name);
          const fileUrl = await uploadFile(file.originFileObj);
          console.log("✅ Tải lên file bộ đề thành công:", fileUrl);
          
          // Update file in the list
          const uploadedFile = {
            uid: file.uid,
            name: file.name,
            status: 'done' as const,
            url: fileUrl,
          };
          
          setExamFileList([uploadedFile]);
          setHasExamFile(true);
          
          // Update form value
          form.setFieldsValue({ file_upload: fileUrl });
          message.success('Tải lên file bộ đề thành công');
        } catch (error) {
          console.error('❌ Lỗi tải lên:', error);
          message.error('Tải lên file bộ đề thất bại');
          setExamFileList([]);
          form.setFieldsValue({ file_upload: '' });
        }
      } else if (file.url) {
        // File already has URL
        setHasExamFile(true);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Debug logs cho tất cả các giá trị liên quan đến exam_url_doc
      console.log("🔎 TRƯỚC KHI GỬI API REQUEST:");
      console.log("📋 Form exam_url_doc:", values.exam_url_doc);
      console.log("📄 State examDocUrl:", examDocUrl);
      console.log("📁 menuBook?.exam?.file_upload:", menuBook?.exam?.file_upload);
      
      // Ưu tiên sử dụng examDocUrl từ state (được set khi upload file qua Import)
      const finalExamUrlDoc = examDocUrl || values.exam_url_doc || menuBook?.exam?.file_upload || '';
      console.log("📄 FINAL exam_url_doc được sử dụng:", finalExamUrlDoc);
      
      // Tạo payload đơn giản với các trường bắt buộc
      const payload: any = {
        title: values.title || '',
        type: values.type || menuBook?.type || 'DE',
        book_id: menuBook?.book_id || '',
        parent_id: menuBook?.parent_id || '',
        active: isActive,
        active_code_id: isActiveCodeId,
        // Luôn gửi 2 trường quan trọng này
        exam_id: values.exam_id || menuBook?.exam?.id || menuBook?.exam_id || '',
        exam_url_doc: finalExamUrlDoc
      };
      
      // Thêm các trường khác nếu có giá trị
      if (values.description) payload.description = values.description;
      if (fileList.length > 0 && fileList[0].url) payload.cover = fileList[0].url;
      if (videoType === 'upload' && videoUrl) payload.video = videoUrl;
      else if (videoType === 'embed' && embedCode) payload.video = embedCode;
      if (attachedFiles && attachedFiles.length > 0) payload.attached = attachedFiles;
      
      // Log FINAL PAYLOAD để debug
      console.log("📦 FINAL PAYLOAD:", JSON.stringify(payload, null, 2));
      
      // Submit the form
      if (menuBook && menuBook.id) {
        const success = await onSubmit(menuBook.id, payload);
        if (success) {
          handleClose();
        }
      }
    } catch (error) {
      console.error('Form validation error:', error);
      message.error('Please fill in all required fields');
    }
  };

  // Reset form and close drawer
  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    setEmbedCode('');
    setVideoType(null);
    setVideoFileList([]);
    setVideoUrl('');
    setHasVideo(false);
    setIsActive(true);
    setIsActiveCodeId(true);
    setAttachedFiles([]);
    setExamFileList([]);
    setHasExamFile(false);
    setExamInfo(null);
    setSelectedExams([]);
    setExamDocUrl('');
    setExamDocFileName('');
    onClose();
  };

  // Get file name from URL
  const getFileNameFromUrl = (url: string) => {
    if (!url) return 'File';
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  // Check if type is DE
  const isExamType = menuBook?.type === 'DE';
  
  // Debug logs - will only show in development
  useEffect(() => {
    if (isExamType) {
      console.log('🔍 Debug - isExamType:', isExamType);
      console.log('🔍 Debug - selectedExams:', selectedExams);
      console.log('🔍 Debug - menuBook?.exam:', menuBook?.exam);
    }
  }, [isExamType, selectedExams, menuBook?.exam]);

  return (
    <>
      <Drawer
        title="Chỉnh sửa mục"
        open={open}
        onClose={handleClose}
        width="80%"
        headerStyle={{ borderBottom: '1px solid #f0f0f0', padding: '16px 24px' }}
        bodyStyle={{ padding: '24px' }}
        destroyOnClose={true}
        extra={
          <Space>
            <Button onClick={handleClose}>
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              className="bg-green-500 hover:bg-green-600"
            >
              Lưu
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
          initialValues={{
            type: 'CHUONG',
            title: '',
            description: '',
            active: true,
            active_code_id: true,
            video: ''
          }}
        >
          {loading && <Alert
            message="Đang tải dữ liệu"
            description="Vui lòng đợi trong khi chúng tôi tải thông tin chi tiết."
            type="info"
            showIcon
            className="mb-6"
          />}

          {!loading && <Alert
            message="Thông tin chỉnh sửa"
            description="Vui lòng điền đầy đủ các thông tin cần chỉnh sửa."
            type="info"
            showIcon
            className="mb-6"
          />}

          {/* Phần ảnh bìa và tiêu đề - Thiết kế lại */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-lg font-medium mb-2">Ảnh bìa</div>
              <Form.Item name="cover" className="mb-1">
                <Upload
                  listType="picture-card"
                  className="cover-upload"
                  fileList={fileList}
                  showUploadList={false}
                  beforeUpload={(file) => {
                    // Kiểm tra loại file
                    const isImage = file.type.startsWith('image/');
                    if (!isImage) {
                      message.error('Chỉ chấp nhận file hình ảnh!');
                      return Upload.LIST_IGNORE;
                    }

                    // Kiểm tra kích thước file (tối đa 5MB)
                    const maxSize = 5 * 1024 * 1024;
                    if (file.size > maxSize) {
                      message.error('Kích thước ảnh không được vượt quá 5MB!');
                      return Upload.LIST_IGNORE;
                    }

                    return true; // Cho phép tải lên
                  }}
                  onChange={handleCoverChange}
                  customRequest={({ file, onSuccess }) => {
                    // Đây là triển khai giả, việc tải lên thực tế xảy ra trong handleCoverChange
                    setTimeout(() => {
                      onSuccess?.('ok');
                    }, 0);
                  }}
                  accept="image/png,image/jpeg,image/jpg"
                >
                  {fileList.length === 0 ? (
                    <div className="upload-placeholder">
                      <PlusOutlined className="text-2xl mb-2" />
                      <div className="font-medium">Tải ảnh lên</div>
                      <div className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG (Tối đa: 5MB)
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img 
                        src={fileList[0].url} 
                        alt="Cover" 
                        className="w-full h-full object-contain" 
                      />
                      <div 
                        className="absolute top-0 right-0 p-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFileList([]);
                          form.setFieldsValue({ cover: '' });
                        }}
                      >
                        <Button 
                          type="text" 
                          size="small" 
                          className="flex items-center justify-center bg-white rounded-full w-6 h-6 shadow"
                          icon={<span className="text-gray-600">×</span>}
                        />
                      </div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              <div className="text-xs text-gray-500 mt-1">
                PNG, JPG, JPEG (Tối đa: 5MB)
              </div>
              <style>{`
                .cover-upload .ant-upload.ant-upload-select {
                  width: 100% !important;
                  height: 225px !important;
                  margin: 0;
                  border: 1px dashed #d9d9d9;
                  border-radius: 8px;
                  background: #fafafa;
                }

                .cover-upload .ant-upload.ant-upload-select:hover {
                  border-color: #45b630;
                }

                .cover-upload .upload-placeholder {
                  width: 100%;
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  color: #666;
                }
              `}</style>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <span className="text-lg font-medium">Tiêu đề</span>
                <span className="text-red-500 ml-1">*</span>
              </div>
              <Form.Item
                name="title"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                className="mb-4"
              >
                <Input placeholder="Nhập tiêu đề" size="large" className="rounded-lg" />
              </Form.Item>
              
              <div className="flex space-x-4">
                <Form.Item className="mb-0 flex-1">
                  <div className="flex items-center justify-between rounded-lg px-4 py-2 border">
                    <span>Kích hoạt</span>
                    <Switch 
                      className="custom-switch-green" 
                      checked={isActive}
                      onChange={(checked) => {
                        console.log("Kích hoạt thay đổi:", checked);
                        setIsActive(checked);
                      }}
                    />
                  </div>
                </Form.Item>
                
                <Form.Item className="mb-0 flex-1">
                  <div className="flex items-center justify-between rounded-lg px-4 py-2 border">
                    <span>Tạo code ID</span>
                    <Switch 
                      className="custom-switch-green" 
                      checked={isActiveCodeId}
                      onChange={(checked) => {
                        console.log("Tạo code ID thay đổi:", checked);
                        setIsActiveCodeId(checked);
                      }}
                    />
                  </div>
                </Form.Item>
              </div>

              <style>{`
                .custom-switch-green.ant-switch-checked {
                  background-color: #4CAF50 !important;
                }
              `}</style>
            </div>
          </div>

          {/* Mô tả */}
          <Form.Item
            label="Mô tả"
            name="description"
            className="mb-6"
          >
            <RichTextEditor 
              placeholder="Nhập mô tả"
            />
          </Form.Item>

          {/* Phần video */}
          <div className="mb-6">
            <div className="text-lg font-medium mb-4">Video minh họa</div>
            
            {!hasVideo && (
              <div className="grid grid-cols-2 gap-4">
                <Card
                  hoverable
                  className={`cursor-pointer transition-all ${videoType === 'upload' ? 'border-[#45b630] bg-[#f6ffed]' : 'hover:border-[#45b630]'}`}
                  onClick={() => handleVideoTypeChange('upload')}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <UploadOutlined className="text-2xl mb-2 text-[#45b630]" />
                    <div className="font-medium">Tải lên video</div>
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
            )}

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
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Xem trước video:</h4>
                      <Button 
                        type="primary" 
                        danger 
                        icon={<DeleteOutlined />} 
                        size="small"
                        onClick={handleRemoveVideo}
                      >
                        Xóa
                      </Button>
                    </div>
                    <div className="relative pt-[40%] bg-black rounded overflow-hidden max-w-2xl mx-auto">
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

            {/* Hiển thị video dạng embed */}
            {videoType === 'embed' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <Form.Item name="embedVideo" className="mb-1">
                  <Input.TextArea
                    placeholder="Dán mã nhúng iframe từ YouTube hoặc các nền tảng khác"
                    rows={3}
                    value={embedCode}
                    onChange={handleEmbedCodeChange}
                  />
                </Form.Item>
                <div className="text-xs text-gray-500">
                  Ví dụ: <code>&lt;iframe src="https://www.youtube.com/embed/..."&gt;&lt;/iframe&gt;</code>
                </div>

                {embedCode && !hasVideo && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Xem trước video:</h4>
                      <Button 
                        type="primary" 
                        danger 
                        icon={<DeleteOutlined />} 
                        size="small"
                        onClick={handleRemoveVideo}
                      >
                        Xóa
                      </Button>
                    </div>
                    <div className="relative pt-[40%] bg-black rounded overflow-hidden max-w-2xl mx-auto">
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

            {/* Hiển thị video hiện tại */}
            {hasVideo && videoType === 'embed' && embedCode && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Video nhúng hiện tại:</h4>
                  <Button 
                    type="primary" 
                    danger 
                    icon={<DeleteOutlined />} 
                    size="small"
                    onClick={handleRemoveVideo}
                  >
                    Xóa
                  </Button>
                </div>
                <div className="relative pt-[40%] bg-black rounded overflow-hidden max-w-2xl mx-auto">
                  {embedCode.includes('<iframe') ? (
                    <div
                      className="absolute top-0 left-0 w-full h-full"
                      dangerouslySetInnerHTML={{ 
                        __html: embedCode.replace('<iframe', '<iframe style="width:100%;height:100%;position:absolute;top:0;left:0;border:0;"') 
                      }}
                    />
                  ) : (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                      Mã video không hợp lệ
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hiển thị video dạng URL hiện tại */}
            {hasVideo && videoType === 'upload' && videoUrl && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Video hiện tại:</h4>
                  <Button 
                    type="primary" 
                    danger 
                    icon={<DeleteOutlined />} 
                    size="small"
                    onClick={handleRemoveVideo}
                  >
                    Xóa
                  </Button>
                </div>
                <div className="relative pt-[40%] bg-black rounded overflow-hidden max-w-2xl mx-auto">
                  <video 
                    src={videoUrl}
                    controls 
                    className="absolute top-0 left-0 w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Phần đính kèm bộ đề */}
          {isExamType && (
            <Form.Item
              label="Đính kèm bộ đề"
              className="mb-6"
            >
              <div className="flex gap-4">
                {selectedExams.length === 0 && (
                  <Button 
                    className="border rounded-md px-4 py-2 flex items-center"
                    onClick={() => setIsExamListDrawerOpen(true)}
                  >
                    <DatabaseOutlined className="mr-2" /> Thêm từ kho câu hỏi
                  </Button>
                )}
                
                <Upload
                  beforeUpload={handleDocUpload}
                  showUploadList={false}
                  maxCount={1}
                  accept=".doc,.docx,.pdf"
                  disabled={uploadingDoc || selectedExams.length > 0}
                >
                  <Button 
                    className="border rounded-md px-4 py-2 flex items-center"
                    loading={uploadingDoc}
                    disabled={selectedExams.length > 0}
                  >
                    <ImportOutlined className="mr-2" /> Import
                  </Button>
                </Upload>
              </div>
              
              {examDocUrl && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FileOutlined className="text-blue-500 text-xl mr-2" />
                      <div>
                        <div className="font-medium">{examDocFileName}</div>
                        <div className="text-xs text-gray-500">
                          {selectedExams.length > 0 && selectedExams[0].status_upload === 'processing' 
                            ? 'File đang được xử lý...' 
                            : 'File đã tải lên thành công'}
                        </div>
                      </div>
                    </div>
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />} 
                      danger
                      onClick={handleRemoveExamAndFile}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              )}
            </Form.Item>
          )}

          {/* Tiêu đề bảng - Chỉ hiển thị cho DE */}
          {isExamType && (
            <div className="grid grid-cols-5 gap-4 p-4 bg-gray-100 rounded-lg mb-4">
              <div className="font-medium">Tên bộ đề</div>
              <div className="font-medium">ID bộ đề</div>
              <div className="font-medium">Trạng thái</div>
              <div className="font-medium">Số câu hỏi</div>
              <div className="font-medium text-right">Thao tác</div>
            </div>
          )}

          {/* Trường ẩn cho exam_id - Chỉ cho DE */}
          {isExamType && (
            <Form.Item name="exam_id" hidden initialValue="">
              <Input />
            </Form.Item>
          )}

          {/* File đính kèm bổ sung - Ẩn - Chỉ cho DE */}
          {isExamType && (
            <Form.Item name="files" hidden>
              <Input />
            </Form.Item>
          )}

          {/* Trường ẩn cho exam_url_doc - Chỉ cho DE */}
          {isExamType && (
            <Form.Item name="exam_url_doc" hidden>
              <Input />
            </Form.Item>
          )}

          {/* Hiển thị thông tin bộ đề đã chọn */}
          {isExamType && selectedExams.length > 0 ? (
            <div className="grid grid-cols-5 gap-4 p-4 bg-white border rounded-lg mb-6">
              <div>{selectedExams[0].title}</div>
              <div>{selectedExams[0].code_id}</div>
              <div>
                <Badge 
                  status={selectedExams[0].active ? "success" : "default"} 
                  text={selectedExams[0].active ? "Kích hoạt" : "Vô hiệu"}
                />
              </div>
              <div>
                {selectedExams[0].total_question || 0} câu
                {selectedExams[0].status_exam && (
                  <Tag 
                    className="ml-2" 
                    color={selectedExams[0].status_exam === 'success' ? 'success' : 'warning'}
                  >
                    {selectedExams[0].status_exam === 'success' ? 'Đã xử lý' : 'Đang xử lý'}
                  </Tag>
                )}
              </div>
              <div className="text-right">
                <div className="inline-flex space-x-2">
                  <Button 
                    type="text" 
                    icon={<EyeOutlined />} 
                    size="small"
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => handleViewExamDetails(selectedExams[0].id)}
                    title="Xem chi tiết"
                  />
                  <Button 
                    type="text" 
                    icon={<DeleteOutlined />} 
                    size="small"
                    className="text-red-500 hover:text-red-700"
                    onClick={handleRemoveExamAndFile}
                    title="Xóa bộ đề đã chọn"
                  />
                </div>
              </div>
            </div>
          ) : isExamType ? (
            <div className="bg-white border rounded-lg p-6 mb-6 text-center text-gray-500">
              <p>Chưa có bộ đề nào được đính kèm. Vui lòng thêm từ kho câu hỏi hoặc import file.</p>
            </div>
          ) : null}

          {/* Danh sách file đính kèm */}
          {attachedFiles.length > 0 && (
            <div className="mb-6">
              <div className="text-lg font-medium mb-4">File đính kèm</div>
              <List
                bordered
                className="bg-gray-50 rounded-lg"
                dataSource={attachedFiles}
                renderItem={(file: any, index) => (
                  <List.Item
                    actions={[
                      <Button
                        key="download"
                        type="link"
                        onClick={() => window.open(file.url)}
                      >
                        Tải xuống
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FileOutlined className="text-blue-500 text-xl" />}
                      title={file.name || getFileNameFromUrl(file.url)}
                      description={
                        <Space>
                          {file.type && <Tag color="blue">{file.type}</Tag>}
                          {file.size && <span>{Math.round(file.size / 1024)} KB</span>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* Hidden fields */}
          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>
          
          <Form.Item name="video" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Drawer>
      
      {/* Drawer chọn bộ đề từ kho */}
      <ExamsListDrawer
        open={isExamListDrawerOpen}
        onClose={() => setIsExamListDrawerOpen(false)}
        onSelectExams={handleSelectExams}
      />
      
      {/* ExamDetailDrawer - đặt ở ngoài Drawer chính */}
      <ExamDetailDrawer
        visible={isExamDetailVisible}
        onClose={handleCloseExamDetail}
        examId={selectedExamId || undefined}
        QUESTION_TYPE={QUESTION_TYPE}
        HighSchoolSubjects={HighSchoolSubjects}
        onExamUpdated={() => {
          // Refresh danh sách bộ đề nếu có thay đổi
          if (isExamListDrawerOpen) {
            setIsExamListDrawerOpen(false);
            setTimeout(() => {
              setIsExamListDrawerOpen(true);
            }, 300);
          }
        }}
      />
    </>
  );
};

export default EditDrawer; 