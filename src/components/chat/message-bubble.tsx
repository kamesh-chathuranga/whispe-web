import React from "react";
import {
  calculateTime,
  formatDateSeparator,
  isSameDay,
} from "@/lib/calculateTime";
import { cn } from "@/lib/utils";
import { Message } from "@/types/types";

interface MessageBubbleProps {
  idx: number;
  message: Message;
  currentUserId: string;
  prevMessage: Message | null;
}

const MessageBubble = ({
  idx,
  message,
  currentUserId,
  prevMessage,
}: MessageBubbleProps) => {
  const messageDate = new Date(message.createdAt);
  const prevDate = prevMessage ? new Date(prevMessage.createdAt) : null;
  const showSeparator =
    idx === 0 || (prevDate && !isSameDay(messageDate, prevDate));
  const hasPrevMessageFromSameUser =
    prevMessage?.sender._id === message.sender._id;
  const isOwn = message.sender._id === currentUserId;

  return (
    <React.Fragment key={message._id}>
      {showSeparator && (
        <div className="flex justify-center my-2">
          <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-accent rounded-sm">
            {formatDateSeparator(messageDate)}
          </span>
        </div>
      )}

      <div
        className={cn("flex mb-[1px]", isOwn ? "justify-end" : "justify-start")}
      >
        <div
          className={cn(
            "px-2 py-[5px] text-sm flex gap-4 items-center max-w-[45%] rounded-md text-black shadow-md",
            isOwn ? "bg-[#d8fad0]" : "bg-white",
            {
              "rounded-tr-none": !hasPrevMessageFromSameUser && isOwn,
              "rounded-tl-none": !hasPrevMessageFromSameUser && !isOwn,
            }
          )}
        >
          <span className="break-all">{message.content}</span>
          <div className="flex gap-1 self-end items-end -mb-[6px] -mr-[2px] min-w-fit">
            <span className="pt-1 min-w-fit text-[9.5px] text-message-time">
              {calculateTime(messageDate)}
            </span>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default MessageBubble;
