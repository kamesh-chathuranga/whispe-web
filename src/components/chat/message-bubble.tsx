/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from "react";
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
import { Message } from "@/types/types"; // Ensure Attachment type is defined
import MessageStatus from "./message-status";
import API from "@/lib/axios";
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
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  const messageDate = new Date(message.createdAt);
  const prevDate = prevMessage ? new Date(prevMessage.createdAt) : null;
  const showSeparator =
    idx === 0 || (prevDate && !isSameDay(messageDate, prevDate));
  const hasPrevMessageFromSameUser =
    prevMessage?.sender._id === message.sender._id;
  const isOwn = message.sender._id === userId;

  useEffect(() => {
    setAttachmentUrl("");
    if (message.attachment && message.chat && message._id) {
      const fetchAttachmentUrls = async () => {
        setLoadingAttachments(true);
        try {
          const response = await API.get(
            `/chats/${message.chat}/${message._id}/media/view`
          );
          if (!response.data) {
            console.error(
              "Failed to fetch attachment URLs:",
              response.statusText
            );
            setAttachmentUrl("");
            return;
          }
          setAttachmentUrl(response.data.url);
        } catch (error) {
          console.error("Error fetching attachment URLs:", error);
          setAttachmentUrl("");
        } finally {
          setLoadingAttachments(false);
        }
      };
      fetchAttachmentUrls();
    }
  }, [message.attachment, message._id, message.chat]);

  const displayAttachment = () => {
    const url = attachmentUrl;
    if (
      !url ||
      !message.attachment ||
      !message.attachment.mimeType ||
      !message.attachment.filename
    ) {
      return null;
    }

    switch (message.attachment.type) {
      case "image":
        return (
          <div className="relative">
            <img
              src={url}
              alt={message.attachment.filename}
              className="w-80 h-auto rounded-md border object-contain"
            />
            {!message.content && (
              <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black/20 to-transparent rounded-b-md" />
            )}
          </div>
        );
      case "video":
        return (
          <video
            src={url}
            controls
            className="max-w-full h-auto rounded-md border"
          />
        );
      case "audio":
        return <audio src={url} controls className="w-full" />;
      default: // 'file'
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            download={message.attachment.filename}
            className="p-2 border rounded-md flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 break-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span>{message.attachment.filename}</span>
          </a>
        );
    }
  };

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
              "px-2 py-[0.4rem] text-sm flex flex-col gap-1 max-w-[45%] rounded-md text-black shadow-md relative",
              isOwn ? "bg-[#d8fad0]" : "bg-white",
              {
                "rounded-tr-none": !hasPrevMessageFromSameUser && isOwn,
                "rounded-tl-none": !hasPrevMessageFromSameUser && !isOwn,
              }
            )}
          >
            {/* Attachments Display */}
            {message.attachment && (
              <div className="mt-0.5 flex flex-col gap-2 w-full shadow-md rounded-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
                {loadingAttachments && (
                  <p className="text-xs text-gray-500">
                    Loading attachments...
                  </p>
                )}
                {!loadingAttachments && attachmentUrl && displayAttachment()}

                {!loadingAttachments &&
                  !attachmentUrl &&
                  !message.attachment && (
                    <p className="text-xs text-red-500">
                      Could not load attachments.
                    </p>
                  )}
              </div>
            )}

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
