import React, { useState } from 'react';
import { Drawer, Form, Input, Switch, Button, Space, Alert, message, Upload, Card, Badge } from 'antd';
import type { MenuBook } from '../../../../../api/menu-book/types';
import type { UploadFile } from 'antd/es/upload/interface';
import { UploadOutlined, ImportOutlined, DatabaseOutlined, PlusOutlined, YoutubeOutlined, DeleteOutlined, EyeOutlined, FileOutlined } from '@ant-design/icons';
import { uploadFile } from '../../../../../api/upload';
import RichTextEditor from '../../../../../components/RichTextEditor';
import ExamsListDrawer from './ExamsListDrawer';

interface AddDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  loading?: boolean;
  parentChapter?: MenuBook | null;
  bookId: string;
  type: 'CHUONG' | 'DE'; // Thay đổi từ 'chapter' | 'exam' thành 'CHUONG' | 'DE'
}

const AddDrawer: React.FC<AddDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
  parentChapter,
  bookId,
  type // 'CHUONG' hoặc 'DE'
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [examFile, setExamFile] = useState<any>(null);
  
  // Trạng thái cho các switch
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isActiveCodeId, setIsActiveCodeId] = useState<boolean>(true);
  
  // Trạng thái video
  const [videoType, setVideoType] = useState<'upload' | 'embed' | null>(null);
  const [videoFileList, setVideoFileList] = useState<UploadFile[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [embedCode, setEmbedCode] = useState<string>('');
  const [hasVideo, setHasVideo] = useState<boolean>(false);

  // Thêm trạng thái cho drawer chọn bộ đề
  const [isExamListDrawerOpen, setIsExamListDrawerOpen] = useState<boolean>(false);
  // Thêm trạng thái lưu bộ đề đã chọn
  const [selectedExams, setSelectedExams] = useState<any[]>([]);

  // Thêm state để lưu URL file doc sau khi upload
  const [examDocUrl, setExamDocUrl] = useState<string>('');
  const [examDocFileName, setExamDocFileName] = useState<string>('');
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);

  // Kiểm tra xem có phải là loại DE hay không
  const isExamType = type === 'DE';

  // Xử lý đóng drawer và reset tất cả dữ liệu
  const handleClose = () => {
    // Reset form fields
    form.resetFields();
    
    // Reset states
    setFileList([]);
    setExamFile(null);
    setVideoType(null);
    setVideoFileList([]);
    setVideoUrl('');
    setEmbedCode('');
    setHasVideo(false);
    setIsActive(true);
    setIsActiveCodeId(true);
    setSelectedExams([]); // Reset bộ đề đã chọn
    setExamDocUrl(''); // Reset URL file doc
    setExamDocFileName(''); // Reset tên file doc
    
    // Call the original onClose
    onClose();
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

  // Handle embed code change
  const handleEmbedCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const code = e.target.value;
    setEmbedCode(code);
    form.setFieldsValue({ video: code });
    setHasVideo(!!code);
  };

  // Handle removing video
  const handleRemoveVideo = () => {
    setVideoType(null);
    setVideoFileList([]);
    setVideoUrl('');
    setEmbedCode('');
    form.setFieldsValue({ video: '', embedVideo: '' });
    setHasVideo(false);
  };

  // Handle cover image upload
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
      // Nếu file được tải lên qua customRequest
      if (file.originFileObj) {
        try {
          console.log("📤 Đang tải lên ảnh bìa:", file.name);
          const url = await uploadFile(file.originFileObj);
          console.log("✅ Tải lên ảnh bìa thành công:", url);
          
          // Tạo đối tượng file mới với URL
          const uploadedFile = {
            uid: file.uid,
            name: file.name,
            status: 'done' as const,
            url: url,
          };

          // Cập nhật trạng thái danh sách file
          setFileList([uploadedFile]);
          
          // Cập nhật giá trị form
          form.setFieldsValue({ cover: url });
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

  // Thêm hàm xử lý upload file doc
  const handleDocUpload = async (file: any) => {
    console.log("📄 Bắt đầu tải lên file doc:", file.name);
    
    // Kiểm tra định dạng file
    const isDocOrDocx = /\.(doc|docx)$/i.test(file.name);
    if (!isDocOrDocx) {
      message.error('Chỉ hỗ trợ định dạng DOC, DOCX');
      return false;
    }
    
    // Kiểm tra kích thước file (tối đa 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error('Kích thước file không được vượt quá 500MB');
      return false;
    }
    
    try {
      setUploadingDoc(true);
      message.loading({ content: 'Đang tải lên file...', key: 'docUpload' });
      
      // Upload file lên server và lấy URL
      const url = await uploadFile(file);
      
      // Lưu URL vào state và form
      setExamDocUrl(url);
      setExamDocFileName(file.name);
      form.setFieldsValue({ exam_url_doc: url });
      
      // Log giá trị form sau khi đặt để kiểm tra
      const formValues = form.getFieldsValue();
      console.log("📋 Giá trị form sau khi tải file doc:", formValues);
      console.log("📋 Trường exam_url_doc trong form:", formValues.exam_url_doc);
      
      message.success({ content: 'Tải lên file thành công', key: 'docUpload' });
      console.log("✅ Tải lên file doc thành công:", url);
      console.log("👉 URL file doc sẽ được gửi đến API trong trường exam_url_doc");
      return false; // Ngăn không cho Upload component tự động upload
    } catch (error) {
      console.error("❌ Lỗi khi tải lên file doc:", error);
      message.error({ content: 'Tải lên file thất bại', key: 'docUpload' });
      return false;
    } finally {
      setUploadingDoc(false);
    }
  };

  // Thêm hàm xử lý xóa file doc đã upload
  const handleRemoveDocFile = () => {
    setExamDocUrl('');
    setExamDocFileName('');
    form.setFieldsValue({ exam_url_doc: '' });
    message.success('Đã xóa file đã chọn');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Ghi log giá trị form trước khi xử lý
      console.log("📋 Giá trị form trước khi xử lý:", values);
      console.log("🔘 Giá trị active từ state:", isActive);
      console.log("🔘 Giá trị active_code_id từ state:", isActiveCodeId);
      console.log("📄 URL file doc:", examDocUrl);
      
      // Tạo payload với các trường cơ bản
      const payload: any = {
        ...values,
        book_id: bookId,
        type: type, // Sử dụng giá trị type trực tiếp ('CHUONG' hoặc 'DE')
        parent_id: parentChapter?.id,
        // Sử dụng giá trị từ state thay vì từ form
        active: isActive,
        active_code_id: isActiveCodeId,
        // Khởi tạo mảng rỗng để tránh giá trị null
        attached: [],
        // LUÔN thêm exam_url_doc vào payload, bất kể loại nào
        exam_url_doc: examDocUrl || '',
      };
      
      console.log("📝 URL file doc trong payload:", payload.exam_url_doc);
      
      // Thêm các trường chỉ dành cho DE
      if (isExamType) {
        payload.files = values.files || [];
        
        // Xử lý video dựa trên loại đã chọn
        if (videoType === 'upload' && videoUrl) {
          payload.video = videoUrl;
          console.log("🎬 Sử dụng URL video đã tải lên:", videoUrl);
        } else if (videoType === 'embed' && embedCode) {
          payload.video = embedCode;
          console.log("🎬 Sử dụng mã nhúng video:", embedCode);
        } else {
          payload.video = '';
        }
        
        // Xử lý file đề thi
        if (examFile) {
          payload.exam = examFile;
          console.log("📄 File đề thi:", examFile);
        }
        
        // Xử lý bộ đề đã chọn
        if (selectedExams.length > 0) {
          payload.exam_id = selectedExams[0].id;
          console.log("📚 Thêm bộ đề đã chọn vào payload:", selectedExams[0].id);
        }
        
        // Đảm bảo mảng files được khởi tạo đúng cách
        if (!payload.files) {
          payload.files = [];
        }
      }
      
      // Ghi log payload cuối cùng để debug
      console.log("🔍 Dữ liệu cuối cùng:", JSON.stringify(payload, null, 2));
      
      await onSubmit(payload);
      console.log("✅ Đã gửi dữ liệu lên API thành công");
      
      // Reset form và các trạng thái
      form.resetFields();
      setFileList([]);
      setExamFile(null);
      setVideoType(null);
      setVideoFileList([]);
      setVideoUrl('');
      setEmbedCode('');
      setHasVideo(false);
      setExamDocUrl('');
      setExamDocFileName('');
      setSelectedExams([]); // Reset bộ đề đã chọn
    } catch (error) {
      console.error('Lỗi xác thực:', error);
      message.error('Vui lòng điền đầy đủ các trường bắt buộc');
    }
  };

  // Xác định tiêu đề drawer dựa trên loại
  const getDrawerTitle = () => {
    if (isExamType) {
      return parentChapter ? `Thêm bộ đề cho "${parentChapter.title}"` : "Thêm mới bộ đề";
    } else {
      return parentChapter ? `Thêm chương cho "${parentChapter.title}"` : "Thêm mới chương";
    }
  };

  // Xác định thông báo dựa trên loại
  const getAlertMessage = () => {
    if (isExamType) {
      return `Bạn đang thêm bộ đề cho chương "${parentChapter?.title}"`;
    } else {
      return `Bạn đang thêm chương cho chương "${parentChapter?.title}"`;
    }
  };

  // Xác định placeholder cho mô tả dựa trên loại
  const getDescriptionPlaceholder = () => {
    if (isExamType) {
      return "Nhập mô tả cho bộ đề (không bắt buộc)";
    } else {
      return "Nhập mô tả cho chương (không bắt buộc)";
    }
  };

  // Xử lý khi chọn bộ đề từ drawer
  const handleSelectExams = (exams: any[]) => {
    setSelectedExams(exams);
    console.log("📚 Đã chọn bộ đề:", exams);
    
    // Cập nhật exam_id và thông tin khác nếu cần
    if (exams.length > 0) {
      const selectedExam = exams[0]; // Lấy bộ đề đầu tiên được chọn
      form.setFieldsValue({ 
        title: selectedExam.title,
        exam_id: selectedExam.id 
      });
      message.success(`Đã chọn bộ đề: ${selectedExam.title} (${selectedExam.code_id})`);
    }
  };

  // Thêm hàm xử lý xóa bộ đề đã chọn
  const handleRemoveSelectedExam = () => {
    setSelectedExams([]);
    form.setFieldsValue({ exam_id: '' });
    message.success('Đã xóa bộ đề đã chọn. Bạn có thể thêm bộ đề mới.');
  };

  // Thêm hàm xử lý xem chi tiết bộ đề
  const handleViewExamDetails = (examId: string) => {
    console.log("🔍 Xem chi tiết bộ đề:", examId);
    message.info(`Xem chi tiết bộ đề: ${examId}`);
    // Tại đây có thể mở modal hoặc drawer hiển thị chi tiết bộ đề
  };

  return (
    <Drawer
      title={getDrawerTitle()}
      open={open}
      onClose={handleClose}
      width="80%"
      headerStyle={{ borderBottom: '1px solid #f0f0f0', padding: '16px 24px' }}
      bodyStyle={{ padding: '24px' }}
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
      {parentChapter && (
        <Alert
          message={getAlertMessage()}
          type="info"
          showIcon
          className="mb-6"
        />
      )}

      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={{
          difficulty: 'medium',
          description: '',
          book_id: bookId,
          type: type, // Sử dụng giá trị type trực tiếp
          video: '',
          attached: [],
          exam_id: '',
          exam_url_doc: '', // Thêm giá trị khởi tạo cho exam_url_doc
        }}
      >
        {/* Các trường ẩn cho yêu cầu API */}
        <Form.Item name="book_id" hidden initialValue={bookId}>
          <Input />
        </Form.Item>
        
        <Form.Item name="type" hidden initialValue={type}>
          <Input />
        </Form.Item>
        
        <Form.Item name="attached" hidden initialValue={[]}>
          <Input />
        </Form.Item>
        
        <Form.Item name="video" hidden>
          <Input />
        </Form.Item>

        <Form.Item name="exam_url_doc" hidden>
          <Input />
        </Form.Item>

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
            placeholder={getDescriptionPlaceholder()}
          />
        </Form.Item>

        {/* Phần video - Chỉ hiển thị cho DE */}
        {isExamType && (
          <div className="mb-6">
            <div className="text-lg font-medium mb-4">Thêm video minh họa</div>
            
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
          </div>
        )}

        {/* Phần đính kèm bộ đề - Chỉ hiển thị cho DE */}
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
                accept=".doc,.docx"
                disabled={uploadingDoc || !!examDocUrl}
              >
                <Button 
                  className="border rounded-md px-4 py-2 flex items-center"
                  loading={uploadingDoc}
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
                      <div className="text-xs text-gray-500">File đã tải lên thành công</div>
                    </div>
                  </div>
                  <Button 
                    type="text" 
                    icon={<DeleteOutlined />} 
                    danger
                    onClick={handleRemoveDocFile}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            )}
          </Form.Item>
        )}

        {/* Trường ẩn cho exam_id - Chỉ cho DE */}
        {isExamType && (
          <Form.Item name="exam_id" hidden initialValue="">
            <Input />
          </Form.Item>
        )}

        {/* Tiêu đề bảng - Chỉ hiển thị cho DE và khi có bộ đề được chọn hoặc không */}
        {isExamType && (
          <div className="grid grid-cols-5 gap-4 p-4 bg-gray-100 rounded-lg mb-6">
            <div className="font-medium">Tên bộ đề</div>
            <div className="font-medium">ID bộ đề</div>
            <div className="font-medium">Trạng thái</div>
            <div className="font-medium">Số câu hỏi</div>
            <div className="font-medium text-right">Thao tác</div>
          </div>
        )}

        {/* File đính kèm bổ sung - Ẩn - Chỉ cho DE */}
        {isExamType && (
          <Form.Item name="files" hidden>
            <Input />
          </Form.Item>
        )}

        {/* Hiển thị thông tin bộ đề đã chọn */}
        {isExamType && selectedExams.length > 0 && (
          <div className="grid grid-cols-5 gap-4 p-4 bg-white border rounded-lg mb-6">
            <div>{selectedExams[0].title}</div>
            <div>{selectedExams[0].code_id}</div>
            <div>
              <Badge 
                status={selectedExams[0].active ? "success" : "default"} 
                text={selectedExams[0].active ? "Kích hoạt" : "Vô hiệu"}
              />
            </div>
            <div>{selectedExams[0].total_question || 0} câu</div>
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
                  onClick={handleRemoveSelectedExam}
                  title="Xóa bộ đề đã chọn"
                />
              </div>
            </div>
          </div>
        )}
      </Form>

      {/* Drawer chọn bộ đề từ kho */}
      <ExamsListDrawer
        open={isExamListDrawerOpen}
        onClose={() => setIsExamListDrawerOpen(false)}
        onSelectExams={handleSelectExams}
      />
    </Drawer>
  );
};

export default AddDrawer;