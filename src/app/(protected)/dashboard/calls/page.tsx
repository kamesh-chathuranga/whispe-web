"use client";

import VideoCallPlayer from "@/components/chat/video-call-player";
import AudioCallPlayer from "@/components/chat/audio-call-player";
import { useStore } from "@/store";
import React from "react";

const CallsPage = () => {
  const { incomingCall } = useStore();
  const callType = incomingCall?.callType || "video"; // Default to video if not specified

  console.log("Incoming call type:", incomingCall);

  if (!incomingCall) return <p>No call</p>;

  return (
    <div className="w-full h-full flex items-center justify-center">
      {callType === "video" ? <VideoCallPlayer /> : <AudioCallPlayer />}
    </div>
  );
};

export default CallsPage;
