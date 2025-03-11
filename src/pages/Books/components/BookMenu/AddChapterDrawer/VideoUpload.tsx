import React, { useState } from 'react';
import { Form, Radio, Space, Alert, Button } from 'antd';
import { UploadOutlined, CodeOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import VideoEmbedModal from './VideoEmbedModal';
import VideoUploadButton from './VideoUploadButton';

interface VideoItem {
  id: string;
  type: 'embed' | 'upload';
  content: string;
  title?: string;
}

interface VideoUploadProps {
  value?: VideoItem[];
  onChange?: (videos: VideoItem[]) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ value = [], onChange }) => {
  const [videoType, setVideoType] = useState<'upload' | 'embed' | null>(null);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleVideoTypeChange = (type: 'upload' | 'embed') => {
    if (value.length > 0) {
      // Clear existing video when switching types
      onChange?.([]);
    }
    setVideoType(type);
    if (type === 'embed') {
      setIsEmbedModalOpen(true);
    }
  };

  const handleEmbedVideo = (embedCode: string) => {
    const newVideo: VideoItem = {
      id: Date.now().toString(),
      type: 'embed',
      content: embedCode,
      title: 'YouTube Video'
    };
    onChange?.([newVideo]);
    setIsEmbedModalOpen(false);
    setIsEditing(false);
  };

  const handleUploadSuccess = (url: string) => {
    const newVideo: VideoItem = {
      id: Date.now().toString(),
      type: 'upload',
      content: url,
      title: 'Uploaded Video'
    };
    onChange?.([newVideo]);
  };

  const handleEditVideo = () => {
    setIsEditing(true);
    setIsEmbedModalOpen(true);
  };

  const handleRemoveVideo = () => {
    onChange?.([]);
    setVideoType(null);
  };

  // Extract YouTube video ID from embed code for thumbnail
  const getYouTubeVideoId = (embedCode: string): string | null => {
    const match = embedCode.match(/youtube\.com\/embed\/([^"&?\/\s]+)/);
    return match && match[1] ? match[1] : null;
  };

  return (
    <Form.Item label="Video">
      <div className="space-y-6">
        {value.length === 0 && (
          <Radio.Group 
            value={videoType}
            onChange={(e) => handleVideoTypeChange(e.target.value)}
          >
            <Space direction="vertical" className="w-full">
              <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${videoType === 'upload' ? 'border-[#45b630] bg-[#f6ffed]' : 'hover:border-[#45b630]'}`}>
                <Radio value="upload" className="w-full">
                  <div className="flex items-center justify-between">
                    <Space>
                      <UploadOutlined className="text-lg" />
                      <span>Upload video</span>
                    </Space>
                    {videoType === 'upload' && (
                      <VideoUploadButton onSuccess={handleUploadSuccess} />
                    )}
                  </div>
                </Radio>
              </div>

              <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${videoType === 'embed' ? 'border-[#45b630] bg-[#f6ffed]' : 'hover:border-[#45b630]'}`}>
                <Radio value="embed" className="w-full">
                  <div className="flex items-center justify-between">
                    <Space>
                      <CodeOutlined className="text-lg" />
                      <span>Nhúng video từ YouTube</span>
                    </Space>
                  </div>
                </Radio>
              </div>
            </Space>
          </Radio.Group>
        )}

        {/* Display Video */}
        {value.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="relative">
              {value[0].type === 'embed' ? (
                <div 
                  className="video-container"
                  dangerouslySetInnerHTML={{ __html: value[0].content }}
                />
              ) : (
                <div className="video-container">
                  <video 
                    src={value[0].content}
                    controls
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>
            
            <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
              <div className="text-gray-700 font-medium">
                {value[0].type === 'embed' ? 'YouTube Video' : 'Uploaded Video'}
              </div>
              <Space>
                {value[0].type === 'embed' && (
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={handleEditVideo}
                  >
                    Sửa
                  </Button>
                )}
                <Button 
                  type="text" 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleRemoveVideo}
                >
                  Xóa
                </Button>
              </Space>
            </div>
          </div>
        )}

        <VideoEmbedModal
          open={isEmbedModalOpen}
          onClose={() => {
            setIsEmbedModalOpen(false);
            if (!value.length && !isEditing) {
              setVideoType(null);
            }
            setIsEditing(false);
          }}
          onSubmit={handleEmbedVideo}
          initialValue={isEditing && value.length > 0 && value[0].type === 'embed' ? value[0].content : ''}
        />
      </div>

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
    </Form.Item>
  );
};

export default VideoUpload;