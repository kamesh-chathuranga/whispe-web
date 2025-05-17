"use client";

import React, { forwardRef } from "react";
import { Message } from "@/types/types";
import MessageBubble from "./message-bubble";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SquareArrowOutUpRight, SquareCheck, X } from "lucide-react";

interface MessageContainerProps {
  messages: Message[];
  isTyping: boolean;
  userId: string;
  loadingHistory: boolean;
  isUserAtBottom: boolean;
  onScroll: () => void;
}

const MessageContainer = forwardRef<HTMLDivElement, MessageContainerProps>(
  (
    { messages, userId, loadingHistory, onScroll, isTyping, isUserAtBottom },
    ref
  ) => {
    return (
      <ContextMenu>
        <ContextMenuTrigger className="w-full h-[80%]">
          <div
            ref={ref}
            onScroll={onScroll}
            className="relative w-full h-full flex flex-col overflow-y-auto px-4 py-1 bg-[url('/chat-background.png')] bg-cover bg-no-repeat bg-center"
          >
            {loadingHistory && <p>Loading...</p>}

            {messages.map((message, idx) => {
              const prevMessage = idx > 0 ? messages[idx - 1] : null;
              return (
                <MessageBubble
                  key={idx}
                  idx={idx}
                  userId={userId}
                  message={message}
                  prevMessage={prevMessage}
                />
              );
            })}

            {isTyping && isUserAtBottom && (
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
        </ContextMenuTrigger>
        <ContextMenuContent className="w-44">
          <ContextMenuItem>
            <SquareCheck className="mr-3 h-4 w-4" />
            Select messages
          </ContextMenuItem>
          <ContextMenuItem>
            <SquareArrowOutUpRight className="mr-3 h-4 w-4" />
            Pop-out chat
          </ContextMenuItem>
          <ContextMenuItem>
            <X className="mr-3 h-4 w-4" />
            Close chat
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }
);

MessageContainer.displayName = "MessageContainer";

export default MessageContainer;
