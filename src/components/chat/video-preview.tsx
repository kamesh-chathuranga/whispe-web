"use client";

import React, { useEffect } from "react";

interface VideoPreviewProps {
  stream: MediaStream | null;
  isLocalStream: boolean;
  isAccepted: boolean;
}

const VideoPreview = ({
  isAccepted,
  isLocalStream,
  stream,
}: VideoPreviewProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      className="border border-white/50 rounded-lg w-full h-full object-cover"
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocalStream}
    />
  );
};

export default VideoPreview;
