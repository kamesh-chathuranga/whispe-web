import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { SingleChat } from "@/types/types";
import { Phone, Search, UserIcon, Video } from "lucide-react";

interface ChatHeaderProps {
  chat: SingleChat;
}

const ChatHeader = ({ chat }: ChatHeaderProps) => {
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
          <Button variant="ghost">
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
