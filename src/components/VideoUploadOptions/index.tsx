import React, { useState, useEffect } from 'react';
import { Card, Typography, Upload, Button, Input, message, Divider, Row, Col } from 'antd';
import { UploadOutlined, DeleteOutlined, PlayCircleOutlined, YoutubeOutlined, EyeOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { uploadFile } from '../../../src/api/upload';

const { Title, Text } = Typography;

interface VideoUploadOptionsProps {
  onSelectOption: (option: 'upload' | 'embed') => void;
  title?: string;
  value?: {
    type: 'upload' | 'embed';
    content: string;
  };
  onChange?: (value: { type: 'upload' | 'embed'; content: string } | null) => void;
}

/**
 * A reusable component for selecting video upload options
 * Displays two cards: one for uploading videos from computer and one for embedding from YouTube/URL
 */
const VideoUploadOptions: React.FC<VideoUploadOptionsProps> = ({ 
  onSelectOption,
  title = "Thêm video minh họa",
  value,
  onChange
}) => {
  const [selectedOption, setSelectedOption] = useState<'upload' | 'embed' | null>(value?.type || null);
  const [videoFileList, setVideoFileList] = useState<UploadFile[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>(value?.type === 'upload' ? value.content : '');
  const [embedCode, setEmbedCode] = useState<string>(value?.type === 'embed' ? value.content : '');
  const [hasVideo, setHasVideo] = useState<boolean>(!!value?.content);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Update state when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedOption(value.type);
      if (value.type === 'upload') {
        setVideoUrl(value.content);
        setEmbedCode('');
      } else if (value.type === 'embed') {
        setEmbedCode(value.content);
        setVideoUrl('');
      }
      setHasVideo(!!value.content);
    } else {
      setSelectedOption(null);
      setVideoUrl('');
      setEmbedCode('');
      setHasVideo(false);
    }
  }, [value]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleOptionSelect = (option: 'upload' | 'embed') => {
    if (hasVideo) {
      // If already has a video, don't allow changing option without removing first
      return;
    }
    
    setSelectedOption(option);
    onSelectOption(option);
    setShowPreview(false);
    
    // Reset the other option's data
    if (option === 'upload') {
      setEmbedCode('');
    } else {
      setVideoFileList([]);
      setVideoUrl('');
      setPreviewFile(null);
      setPreviewUrl('');
    }
  };

  const handleVideoUpload = async (info: any) => {
    const { fileList } = info;
    setVideoFileList(fileList);
    console.log("🎬 VideoUploadOptions handleVideoUpload fileList:", fileList);

    // If file is removed
    if (fileList.length === 0) {
      setVideoUrl('');
      onChange?.({ type: 'upload', content: '' });
      setHasVideo(false);
      setPreviewFile(null);
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl('');
      setShowPreview(false);
      console.log("🎬 VideoUploadOptions: Video removed");
      return;
    }

    const file = fileList[0];
    console.log("🎬 VideoUploadOptions processing file:", file);
    
    // Check file type
    const acceptedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (!acceptedTypes.includes(file.type)) {
      message.error('Chỉ hỗ trợ định dạng MP4, MOV, WebM');
      setVideoFileList([]);
      setPreviewFile(null);
      setPreviewUrl('');
      setShowPreview(false);
      return;
    }
    
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error('Kích thước file không được vượt quá 5MB');
      setVideoFileList([]);
      setPreviewFile(null);
      setPreviewUrl('');
      setShowPreview(false);
      return;
    }

    // Create preview URL for the file
    if (file.originFileObj) {
      setPreviewFile(file.originFileObj);
      // If there's an existing preview URL, revoke it
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file.originFileObj);
      setPreviewUrl(url);
      setShowPreview(true);
    }

    // Upload file if it's a new one
    if (file.status === 'uploading' && !file.url && file.originFileObj) {
      try {
        console.log("📤 VideoUploadOptions uploading video file:", file.name);
        const url = await uploadFile(file.originFileObj);
        console.log("✅ VideoUploadOptions video uploaded successfully:", url);
        setVideoUrl(url);
        onChange?.({ type: 'upload', content: url });
        setHasVideo(true);
        
        // Update file in the list
        const updatedFile = { ...file, status: 'done', url };
        setVideoFileList([updatedFile]);
      } catch (error) {
        console.error('❌ VideoUploadOptions video upload error:', error);
        message.error('Không thể tải lên video');
        setVideoFileList([]);
        setPreviewFile(null);
        setPreviewUrl('');
        setShowPreview(false);
      }
    } else if (file.status === 'done' && file.url) {
      // If file already has URL
      console.log("✅ VideoUploadOptions using existing video URL:", file.url);
      setVideoUrl(file.url);
      onChange?.({ type: 'upload', content: file.url });
      setHasVideo(true);
    }
  };

  const handleEmbedCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const code = e.target.value;
    setEmbedCode(code);
    onChange?.({ type: 'embed', content: code });
    setHasVideo(!!code);
    setShowPreview(!!code && code.includes('<iframe'));
  };

  const handleRemoveVideo = () => {
    setVideoUrl('');
    setEmbedCode('');
    setVideoFileList([]);
    setHasVideo(false);
    setPreviewFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setShowPreview(false);
    onChange?.(null);
    setSelectedOption(null);
  };

  const renderVideoSelector = () => {
    if (hasVideo) return null;
    
    return (
      <div className="grid grid-cols-2 gap-4">
        {/* Upload Video Option */}
        <Card 
          hoverable
          className={`cursor-pointer transition-all ${selectedOption === 'upload' ? 'border-green-500 shadow-sm' : 'hover:border-green-500'}`}
          onClick={() => handleOptionSelect('upload')}
        >
          <div className="flex flex-col items-center justify-center text-center py-4">
            <div className="text-green-500 mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 20H19V18H5V20ZM5 10H9V16H15V10H19L12 3L5 10Z" fill="currentColor"/>
              </svg>
            </div>
            <Title level={5} className="m-0">Upload video</Title>
            <Text type="secondary">Tải lên video từ máy tính</Text>
          </div>
        </Card>

        {/* Embed Video Option */}
        <Card 
          hoverable
          className={`cursor-pointer transition-all ${selectedOption === 'embed' ? 'border-green-500 shadow-sm' : 'hover:border-green-500'}`}
          onClick={() => handleOptionSelect('embed')}
        >
          <div className="flex flex-col items-center justify-center text-center py-4">
            <div className="text-red-500 mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5V7.5L16 12L10 16.5Z" fill="currentColor"/>
              </svg>
            </div>
            <Title level={5} className="m-0">Nhúng video</Title>
            <Text type="secondary">Nhúng video từ YouTube hoặc URL</Text>
          </div>
        </Card>
      </div>
    );
  };

  // Render video preview for both upload and embed
  const renderVideoPreview = (source: string, type: 'upload' | 'embed') => {
    if (!source) return null;

    return (
      <div className="mt-4 border rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-3 border-b flex items-center">
          <span className="text-lg font-medium flex items-center">
            {type === 'upload' ? (
              <><PlayCircleOutlined className="text-green-500 mr-2" /> Xem trước video</>
            ) : (
              <><YoutubeOutlined className="text-red-500 mr-2" /> Xem trước video</>
            )}
          </span>
        </div>
        
        <Row justify="center" className="py-4 px-4 bg-gray-50">
          <Col xs={24} sm={20} md={16} lg={14}>
            <div className="relative pt-[56.25%] bg-black rounded overflow-hidden shadow-md">
              {type === 'upload' ? (
                <video 
                  src={source}
                  controls 
                  className="absolute top-0 left-0 w-full h-full"
                />
              ) : source.includes('<iframe') ? (
                <div
                  className="absolute top-0 left-0 w-full h-full"
                  dangerouslySetInnerHTML={{ 
                    __html: source.replace('<iframe', '<iframe style="width:100%;height:100%;position:absolute;top:0;left:0;border:0;"') 
                  }}
                />
              ) : null}
            </div>
          </Col>
        </Row>
        
        <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
          <div className="text-gray-700">
            {type === 'upload' ? (
              <div className="flex items-center">
                <span className="font-medium mr-2">Tên file:</span>
                {videoFileList[0]?.name || 'Video đã chọn'}
              </div>
            ) : (
              <div className="flex items-center">
                <span className="font-medium mr-2">Nguồn:</span>
                YouTube/URL
              </div>
            )}
          </div>
          {hasVideo ? (
            <Button 
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemoveVideo}
            >
              Xóa video
            </Button>
          ) : (
            <Button 
              type="default"
              onClick={() => setShowPreview(false)}
            >
              Đóng
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {title && (
        <Title level={5} className="flex items-center mb-4">
          <span className="text-green-500 mr-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 8V16H5V8H15ZM16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5V7C17 6.45 16.55 6 16 6Z" fill="currentColor"/>
            </svg>
          </span>
          {title}
        </Title>
      )}

      {renderVideoSelector()}

      {/* Upload Video UI */}
      {selectedOption === 'upload' && !hasVideo && !showPreview && (
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
        </div>
      )}

      {/* Embed Video UI */}
      {selectedOption === 'embed' && !hasVideo && !showPreview && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <Input.TextArea
            placeholder="Dán mã nhúng iframe từ YouTube hoặc các nền tảng khác"
            rows={3}
            value={embedCode}
            onChange={handleEmbedCodeChange}
          />
          <div className="mt-2 text-xs text-gray-500">
            Ví dụ: <code>&lt;iframe src="https://www.youtube.com/embed/..."&gt;&lt;/iframe&gt;</code>
          </div>
          {embedCode && (
            <Button 
              type="primary"
              className="mt-3 bg-blue-500"
              icon={<EyeOutlined />}
              onClick={() => setShowPreview(true)}
            >
              Xem trước
            </Button>
          )}
        </div>
      )}

      {/* Preview for upload video */}
      {selectedOption === 'upload' && !hasVideo && showPreview && previewUrl && (
        renderVideoPreview(previewUrl, 'upload')
      )}

      {/* Preview for embed video */}
      {selectedOption === 'embed' && !hasVideo && showPreview && embedCode && (
        renderVideoPreview(embedCode, 'embed')
      )}

      {/* Video Preview Section - For saved videos */}
      {hasVideo && selectedOption && (
        renderVideoPreview(selectedOption === 'upload' ? videoUrl : embedCode, selectedOption)
      )}

      <style>
        {`
        .video-container {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          height: 0;
          overflow: hidden;
        }

        .video-container iframe,
        .video-container video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        `}
      </style>
    </div>
  );
};

export default VideoUploadOptions; 