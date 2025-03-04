import React, { useState, useEffect } from 'react';
import './VideoDisplay.css';

interface VideoDisplayProps {
  videoSource: string;
  className?: string;
}

/**
 * Component hiển thị video từ đường dẫn hoặc mã nhúng iframe
 * @param videoSource - Đường dẫn video hoặc mã nhúng iframe
 * @param className - Class CSS tùy chỉnh (tùy chọn)
 */
const VideoDisplay: React.FC<VideoDisplayProps> = ({ videoSource, className = '' }) => {
  // Kiểm tra xem nguồn video có phải là mã nhúng iframe không
  const isIframeEmbed = videoSource.trim().toLowerCase().startsWith('<iframe');

  if (isIframeEmbed) {
    // Nếu là mã nhúng iframe, hiển thị trực tiếp với style để đảm bảo hiển thị đầy đủ
    const enhancedIframe = videoSource.replace(
      '<iframe', 
      '<iframe style="width:100%;height:100%;position:absolute;top:0;left:0;border:0;"'
    );
    
    return (
      <div className={`video-embed-container ${className}`}>
        <div dangerouslySetInnerHTML={{ __html: enhancedIframe }} />
      </div>
    );
  } else if (videoSource.startsWith('blob:') || videoSource.startsWith('http')) {
    // Nếu là URL video trực tiếp (blob hoặc http/https), hiển thị bằng thẻ video
    return (
      <div className={`video-container ${className}`}>
        <video 
          src={videoSource}
          controls 
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    );
  }
  
  // Trường hợp không xác định được loại video, hiển thị iframe chung
  return (
    <div className={`video-container ${className}`}>
      <iframe
        width="100%"
        height="100%"
        src={videoSource}
        title="Video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoDisplay; 