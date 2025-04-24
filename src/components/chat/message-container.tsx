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
}

const MessageContainer = ({
  messages,
  currentUserId,
  loadingHistory,
  ref,
  onScroll,
}: MessageContainerProps) => {
  return (
    <div
      ref={ref}
      onScroll={onScroll}
      className="w-full h-[80vh] flex flex-col overflow-y-auto px-4 py-1"
    >
      {loadingHistory && <p>Loading...</p>}

      {messages.map((message, idx) => {
        const massageDate = new Date(message.createdAt);
        const prevMessage = idx > 0 ? messages[idx - 1] : null;
        const prevDate = prevMessage ? new Date(prevMessage.createdAt) : null;
        const showSeparator =
          idx === 0 || (prevDate && !isSameDay(massageDate, prevDate));
        const hasNextMessageFromSameUser =
          messages[idx - 1]?.sender._id === message.sender._id;
        const isOwn = message.sender._id === currentUserId;

        return (
          <React.Fragment key={message._id}>
            {showSeparator && (
              <div className="flex justify-center my-2">
                <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-300 rounded-sm">
                  {formatDateSeparator(massageDate)}
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
                    "rounded-tr-none": !hasNextMessageFromSameUser && isOwn,
                    "rounded-tl-none": !hasNextMessageFromSameUser && !isOwn,
                  }
                )}
              >
                <span className="break-all">{message.content}</span>
                <div className="flex gap-1 self-end items-end -mb-[6px] -mr-[2px] min-w-fit">
                  <span className="pt-1 min-w-fit text-[9.5px] text-message-time">
                    {calculateTime(massageDate)}
                  </span>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default MessageContainer;
