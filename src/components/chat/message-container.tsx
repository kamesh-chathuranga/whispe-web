"use client";

import { calculateTime } from "@/lib/calculateTime";
import { cn } from "@/lib/utils";
import React from "react";
// import MessageStatus from "./message-status";
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
      className=" w-full h-[80vh] flex flex-col overflow-y-auto px-4 py-1"
    >
      {loadingHistory && <p>Loading...</p>}

      {messages.map((message) => (
        <div
          key={message._id}
          className={cn(
            "flex mb-[1px]",
            message.sender._id !== currentUserId
              ? "justify-start"
              : "justify-end"
          )}
        >
          {/* {message.type === "text" && ( */}
          <div
            className={cn(
              "px-2 py-[5px] text-sm rounded-md flex gap-4 items-center max-w-[45%]",
              message.sender._id !== currentUserId
                ? "bg-message-receive text-black"
                : "bg-message-send text-white"
            )}
          >
            <span className="break-all">{message.content}</span>
            <div className="flex gap-1 self-end items-end -mb-[6px] -mr-[2px] min-w-fit">
              <span className="pt-1 min-w-fit text-[9.5px] text-message-time">
                {calculateTime(new Date(message.createdAt))}
              </span>
              {/* <span>
                        {message.sender === currentUser?.id && (
                          <MessageStatus status={message.status} />
                        )}
                      </span> */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageContainer;
