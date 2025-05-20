"use client";

import React from "react";
import { useStore } from "@/store";
import VideoCallPlayer from "@/components/chat/video-call-player";
import AudioCallPlayer from "@/components/chat/audio-call-player";

const CallsPage = () => {
  const { incomingCall } = useStore();
  const callType = incomingCall?.callType || "video";

  if (!incomingCall) return <p>No call</p>;

  return (
    <div className="w-full h-full flex items-center justify-center">
      {callType === "video" ? <VideoCallPlayer /> : <AudioCallPlayer />}
    </div>
  );
};

export default CallsPage;
