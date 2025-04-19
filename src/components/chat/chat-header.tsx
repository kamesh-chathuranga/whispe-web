/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { SingleChat, User } from "@/types/types";
import { Phone, Search, UserIcon, Video } from "lucide-react";
import socket from "@/lib/socket";
import { useStore } from "@/store";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  chat: SingleChat;
  currentUser: User;
}

const ChatHeader = ({ chat, currentUser }: ChatHeaderProps) => {
  const { localStream, setLocalStream } = useStore();
  const router = useRouter();

  const getMediaStream = useCallback(
    async (facingMode?: string) => {
      if (localStream) {
        return localStream;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 360, ideal: 720, max: 1080 },
            frameRate: { min: 15, ideal: 30, max: 60 },
            facingMode: videoDevices.length > 0 ? facingMode : undefined,
          },
        });
        setLocalStream(stream);
        return stream;
      } catch (error) {
        console.error("Error accessing media devices.", error);
        setLocalStream(null);
        return null;
      }
    },
    [localStream, setLocalStream]
  );

  const handleVideoCall = useCallback(async () => {
    if (!chat) return;

    const stream = await getMediaStream();

    if (!stream) {
      console.error("Unable to access media devices.");
      return;
    }

    socket.emit(
      "call",
      {
        callerId: chat._id,
        callerName: currentUser.name,
        callerAvatarUrl: currentUser.avatarUrl,
        receiverId: chat.partner._id,
      },
      (response: any) => {
        if (response.status === 200) {
          console.log("Call initiated successfully", response.data);
        } else {
          console.error("Error initiating call", response.error);
        }
      }
    );

    router.push(`/dashboard/calls`);
  }, [chat, currentUser.avatarUrl, currentUser.name, getMediaStream, router]);

  return (
    <div className="flex items-center justify-between p-3 h-[10%] border-b border-gray-200">
      <div className="flex items-center gap-x-4">
        <Avatar>
          <AvatarImage src={chat.partner.avatarUrl} />
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium ">{chat.partner.name}</span>
          <span className="text-xs text-emerald-500">online</span>
        </div>
      </div>

      <div className="flex items-center gap-x-1">
        <div className="bg-muted/30">
          <Button variant="ghost" onClick={handleVideoCall}>
            <Video />
          </Button>
          <Button variant="ghost">
            <Phone />
          </Button>
        </div>
        <Button variant="ghost">
          <Search />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
