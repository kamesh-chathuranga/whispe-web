"use client";

import React, { useCallback, useState, forwardRef } from "react";
import { Message } from "@/types/types";
import MessageBubble from "./message-bubble";
import ChatContextMenu from "./chat-context-menu";

interface MessageContainerProps {
  messages: Message[];
  currentUserId: string;
  onScroll: () => void;
  loadingHistory: boolean;
  isTyping: boolean;
}

const MessageContainer = forwardRef<HTMLDivElement, MessageContainerProps>(
  ({ messages, currentUserId, loadingHistory, onScroll, isTyping }, ref) => {
    const [chatContextOpen, setChatContextOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleContainerContextMenu = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (
          (e.target as HTMLElement).closest("[data-message-bubble]") === null
        ) {
          e.preventDefault();
          setPosition({ x: e.clientX, y: e.clientY });
          setChatContextOpen(true);
        }
      },
      []
    );

    return (
      <div
        ref={ref}
        onScroll={onScroll}
        onContextMenu={handleContainerContextMenu}
        className="relative w-full h-[80vh] flex flex-col overflow-y-auto px-4 py-1 bg-[url('/chat-background.png')] bg-cover bg-no-repeat bg-center"
      >
        {loadingHistory && <p>Loading...</p>}

        <ChatContextMenu
          open={chatContextOpen}
          onOpenChange={setChatContextOpen}
          position={position}
        />

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
  }
);

MessageContainer.displayName = "MessageContainer";

export default MessageContainer;
