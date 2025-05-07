import React, { useCallback, useState } from "react";
import {
  formatMessageTimestamp,
  formatDateSeparator,
  isSameDay,
} from "@/lib/calculateTime";
import { cn } from "@/lib/utils";
import { Message } from "@/types/types";
import MessageStatus from "./message-status";
import MessageContextMenu from "./message-context-menu";

interface MessageBubbleProps {
  idx: number;
  message: Message;
  currentUserId: string;
  prevMessage: Message | null;
  ref: React.RefObject<HTMLDivElement | null>;
}

const MessageBubble = ({
  idx,
  message,
  currentUserId,
  prevMessage,
  ref,
}: MessageBubbleProps) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const messageDate = new Date(message.createdAt);
  const prevDate = prevMessage ? new Date(prevMessage.createdAt) : null;
  const showSeparator =
    idx === 0 || (prevDate && !isSameDay(messageDate, prevDate));
  const hasPrevMessageFromSameUser =
    prevMessage?.sender._id === message.sender._id;
  const isOwn = message.sender._id === currentUserId;

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log("Context menu opened at:", e.clientX, e.clientY);

    setPosition({ x: e.clientX, y: e.clientY });
    setOpen(true);
  };

  return (
    <React.Fragment key={message._id}>
      {showSeparator && (
        <div className="flex justify-center my-2">
          <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-accent rounded-sm">
            {formatDateSeparator(messageDate)}
          </span>
        </div>
      )}

      <MessageContextMenu
        ref={ref}
        open={open}
        onOpenChange={setOpen}
        position={position}
        message={message}
        isOwn={isOwn}
      />

      <div
        className={cn("flex mb-0.5", isOwn ? "justify-end" : "justify-start")}
      >
        <div
          data-message-bubble="true"
          onContextMenu={handleContextMenu}
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
          <div className="flex gap-1 self-end items-center -mb-[6px] -mr-[2px] min-w-fit">
            <span className="pt-1 min-w-fit text-[9.5px] text-message-time">
              {formatMessageTimestamp(messageDate)}
            </span>
            {message.sender._id === currentUserId && (
              <MessageStatus status={message.status} />
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default MessageBubble;
