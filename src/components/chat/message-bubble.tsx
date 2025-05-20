import React, { useCallback } from "react";
import {
  formatMessageTimestamp,
  formatDateSeparator,
  isSameDay,
} from "@/lib/calculateTime";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { Message } from "@/types/types";
import MessageStatus from "./message-status";
import {
  Copy,
  Forward,
  Info,
  Pin,
  Reply,
  Share,
  SquareCheck,
  Star,
  Trash2,
} from "lucide-react";
import socket from "@/lib/socket";
import AttachmentDisplay from "./attachment-display";

interface MessageBubbleProps {
  idx: number;
  message: Message;
  userId: string;
  prevMessage: Message | null;
}

const MessageBubble = ({
  idx,
  message,
  userId,
  prevMessage,
}: MessageBubbleProps) => {
  const messageDate = new Date(message.createdAt);
  const prevDate = prevMessage ? new Date(prevMessage.createdAt) : null;
  const showSeparator =
    idx === 0 || (prevDate && !isSameDay(messageDate, prevDate));
  const hasPrevMessageFromSameUser =
    prevMessage?.sender._id === message.sender._id;
  const isOwn = message.sender._id === userId;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
  }, [message.content]);

  const handleDeleteForMe = useCallback(() => {
    if (message._id) {
      socket.emit("message:deleteForMe", { messageId: message._id });
    }
  }, [message._id]);

  return (
    <ContextMenu key={message._id}>
      {showSeparator && (
        <div className="flex justify-center my-2">
          <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-accent rounded-sm">
            {formatDateSeparator(messageDate)}
          </span>
        </div>
      )}
      <div
        className={cn("flex mb-0.5", isOwn ? "justify-end" : "justify-start")}
      >
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              "text-sm flex flex-col gap-1 max-w-[45%] rounded-md text-black shadow-md relative",
              isOwn ? "bg-[#d8fad0]" : "bg-white",
              message.attachment
                ? "px-[6px] pt-1.5 pb-[1px]"
                : "px-2 py-[0.4rem] ",
              {
                "rounded-tr-none": !hasPrevMessageFromSameUser && isOwn,
                "rounded-tl-none": !hasPrevMessageFromSameUser && !isOwn,
              }
            )}
          >
            {/* Attachments Display */}
            {message.attachment && <AttachmentDisplay message={message} />}

            <div
              className={cn(
                "flex gap-4 items-center",
                message.attachment && "justify-between"
              )}
            >
              <span className="break-all">{message.content}</span>
              <div
                className={cn(
                  "flex gap-1 self-end items-center -mb-[6px] -mr-[2px] min-w-fit text-message-time",
                  message.attachment &&
                    (message.attachment.type === "image" ||
                      message.attachment.type === "video") &&
                    !message.content &&
                    "absolute right-6 bottom-5 text-white z-50"
                )}
              >
                <span className="pt-1 min-w-fit text-[9.5px] ">
                  {formatMessageTimestamp(messageDate)}
                </span>
                {message.sender._id === userId && (
                  <MessageStatus status={message.status} />
                )}
              </div>
            </div>
          </div>
        </ContextMenuTrigger>
      </div>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>
          <Reply className="mr-3 h-4 w-4" />
          Reply
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopy}>
          <Copy className="mr-3 h-4 w-4" />
          Copy
        </ContextMenuItem>
        <ContextMenuSeparator />

        <ContextMenuItem>
          <Forward className="mr-3 h-4 w-4" />
          Forward
        </ContextMenuItem>
        <ContextMenuItem>
          <Star className="mr-3 h-4 w-4" />
          Star
        </ContextMenuItem>
        <ContextMenuItem>
          <Pin className="mr-3 h-4 w-4" />
          Pin
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDeleteForMe}>
          <Trash2 className="mr-3 h-4 w-4" />
          Delete
        </ContextMenuItem>
        <ContextMenuSeparator />

        <ContextMenuItem>
          <SquareCheck className="mr-3 h-4 w-4" />
          Select
        </ContextMenuItem>
        <ContextMenuItem>
          <Share className="mr-3 h-4 w-4" />
          Share
        </ContextMenuItem>
        <ContextMenuSeparator />

        <ContextMenuItem>
          <Info className="mr-3 h-4 w-4" />
          Info
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MessageBubble;
