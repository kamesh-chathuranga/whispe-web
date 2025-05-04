"use client";

import React from "react";
import { Message } from "@/types/types";
import MessageBubble from "./message-bubble";

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
      className="w-full h-[80vh] flex flex-col overflow-y-auto px-4 py-1 bg-[url('/chat-background.png')] bg-cover bg-no-repeat bg-center"
    >
      {loadingHistory && <p>Loading...</p>}

      {messages.map((message, idx) => {
        const prevMessage = idx > 0 ? messages[idx - 1] : null;
        return (
          <MessageBubble
            key={idx}
            idx={idx}
            message={message}
            currentUserId={currentUserId}
            prevMessage={prevMessage}
          />
        );
      })}

      {isTyping && (
        <div className="flex my-1 justify-start">
          <div className="px-3 py-[8px] text-sm flex items-center gap-1 max-w-[45%] bg-white text-black rounded-sm shadow-md">
            <span
              className="block w-1 h-1 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <span
              className="block w-1 h-1 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="block w-1 h-1 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
