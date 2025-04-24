"use client";

import {
  calculateTime,
  formatDateSeparator,
  isSameDay,
} from "@/lib/calculateTime";
import { cn } from "@/lib/utils";
import React from "react";
import { Message } from "@/types/types";

interface MessageContainerProps {
  messages: Message[];
  currentUserId: string;
  ref: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  loadingHistory: boolean;
  isTyping: boolean;
}

const MessageContainer = ({
  messages,
  currentUserId,
  loadingHistory,
  ref,
  onScroll,
  isTyping,
}: MessageContainerProps) => {
  return (
    <div
      ref={ref}
      onScroll={onScroll}
      className="w-full h-[80vh] flex flex-col overflow-y-auto px-4 py-1"
    >
      {loadingHistory && <p>Loading...</p>}

      {messages.map((message, idx) => {
        const messageDate = new Date(message.createdAt);
        const prevMessage = idx > 0 ? messages[idx - 1] : null;
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
                <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-300 rounded-sm">
                  {formatDateSeparator(messageDate)}
                </span>
              </div>
            )}

            <div
              className={cn(
                "flex mb-[1px]",
                isOwn ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "px-2 py-[5px] text-sm flex gap-4 items-center max-w-[45%]",
                  isOwn
                    ? "bg-message-send text-white"
                    : "bg-message-receive text-black",
                  "rounded-md",
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
      })}

      {isTyping && (
        <div className="flex my-1 justify-start">
          <div className="px-2 py-[5px] text-sm flex items-center gap-1 max-w-[45%] bg-message-receive text-black rounded-sm">
            <span
              className="block w-2 h-2 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <span
              className="block w-2 h-2 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="block w-2 h-2 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
