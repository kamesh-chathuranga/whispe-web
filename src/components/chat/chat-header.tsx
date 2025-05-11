"use client";

import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { FriendStatus, SingleChat } from "@/types/types";
import { Phone, Search, UserIcon, Video } from "lucide-react";
import useVideoCall from "@/hooks/use-media-call";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import { formatLastSeen } from "@/lib/calculateTime";
import { Separator } from "../ui/separator";

interface ChatHeaderProps {
  chat: SingleChat;
}

const ChatHeader = ({ chat }: ChatHeaderProps) => {
  const partnerId = chat.partner._id;
  const friendStatuses = useStore((state) =>
    state.friendStatuses.find(
      (status: FriendStatus) => status.userId === partnerId
    )
  );

  const { startVideoCall, startAudioCall } = useVideoCall();

  return (
    <div className="flex items-center justify-between px-3 h-[11%] border-b border-gray-200">
      <div className="flex items-center gap-x-4">
        <Avatar>
          <AvatarImage src={chat.partner.avatarUrl} />
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium ">{chat.partner.name}</span>
          <span
            className={cn(
              "text-xs",
              friendStatuses?.isOnline ? "text-emerald-500" : "text-gray-500"
            )}
          >
            {friendStatuses?.isOnline
              ? "Online"
              : friendStatuses?.lastSeen
              ? formatLastSeen(friendStatuses.lastSeen)
              : "Offline"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-x-1">
        <div className="bg-muted/30 border rounded-sm flex items-center justify-center ">
          <Button
            variant="ghost"
            className="rounded-none"
            onClick={startVideoCall}
          >
            <Video />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="ghost"
            className="rounded-none"
            onClick={startAudioCall}
          >
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
