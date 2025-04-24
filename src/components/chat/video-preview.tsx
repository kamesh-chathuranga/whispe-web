"use client";

import { cn } from "@/lib/utils";
import React, { useEffect } from "react";

interface VideoPreviewProps {
  stream: MediaStream | null;
  isLocalStream: boolean;
  isAccepted: boolean;
}

const VideoPreview = ({ isLocalStream, stream }: VideoPreviewProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      className={cn(
        "w-full h-full object-cover",
        isLocalStream &&
          "rounded-lg border-2 border-blue-500 absolute w-[30%] h-auto top-4 left-4"
      )}
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocalStream}
    />
  );
};

export default VideoPreview;
