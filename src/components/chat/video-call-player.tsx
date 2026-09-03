"use client";

import { useStore } from "@/store";
import React, { useCallback, useEffect, useRef, useState } from "react";
import VideoPreview from "./video-preview";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Shrink,
  Fullscreen,
  LoaderCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import useVideoCall from "@/hooks/use-media-call";

const VideoCallPlayer = () => {
  const { localStream, peer, incomingCall } = useStore();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { handleHangUp } = useVideoCall();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      const videoTrack = localStream.getVideoTracks()[0];

      setIsMicOn(audioTrack.enabled);
      setIsCameraOn(videoTrack.enabled);
    }
  }, [localStream]);

  const toggleMic = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);
    }
  }, [localStream]);

  const toggleFullScreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullScreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen((prev) => !prev);
  }, [isFullScreen]);

  if (!localStream && !peer) {
    return <div className="w-full h-full">No stream available</div>;
  }

  const isAccepted = localStream && peer && incomingCall ? true : false;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
    >
      <VideoPreview
        stream={localStream}
        isLocalStream={true}
        isAccepted={isAccepted}
      />
      {peer && peer.stream ? (
        <VideoPreview
          stream={peer.stream}
          isLocalStream={false}
          isAccepted={isAccepted}
        />
      ) : (
        <div className="w-full h-full bg-black">
          <div className="flex flex-col gap-8 w-full h-full items-center justify-center">
            <LoaderCircle size={100} className="animate-spin text-blue-600" />
            <p className="text-lg text-gray-400 text-center">
              Please wait for the other person to join the call.
            </p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 p-2 px-4 rounded-full bg-white/15">
        <Button
          onClick={toggleFullScreen}
          className="p-2 rounded-full hover:bg-white/20"
          size="icon"
        >
          {isFullScreen ? <Shrink size={24} /> : <Fullscreen size={24} />}
        </Button>

        <Button
          onClick={toggleMic}
          className="p-2 rounded-full hover:bg-white/20"
          size="icon"
        >
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </Button>

        <Button
          onClick={toggleCamera}
          className="p-2 rounded-full hover:bg-white/20"
          size="icon"
        >
          {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
        </Button>

        <Button
          onClick={() => {
            handleHangUp({
              incomingCall: incomingCall ? incomingCall : undefined,
              isEmitiHangUp: true,
            });
          }}
          className="p-2 rounded-full hover:bg-red-600"
          size="icon"
        >
          <PhoneOff size={24} />
        </Button>
      </div>
    </div>
  );
};

export default VideoCallPlayer;
