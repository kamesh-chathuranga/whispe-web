"use client";

import { calculateTime } from "@/lib/calculateTime";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import React from "react";
import MessageStatus from "./message-status";

const MessageContainer = () => {
  const {  currentUser } = useStore();

  return (
    <div className="flex-grow overflow-auto w-full h-[80vh]">
      <div className="mx-10 my-6 h-full">
        <div className="flex w-full h-full">
          <div className="flex flex-col w-full overflow-y-auto gap-1  ">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.authorId === currentChat?.id
                    ? "justify-start"
                    : "justify-end"
                )}
              >
                {message.type === "text" && (
                  <div
                    className={cn(
                      "px-2 py-[5px] text-sm rounded-md flex gap-4 items-center max-w-[45%]",
                      message.authorId === currentChat?.id
                        ? "bg-message-receive text-black"
                        : "bg-message-send text-white"
                    )}
                  >
                    <span className="break-all">{message.message}</span>
                    <div className="flex gap-1 self-end items-end -mb-[6px] -mr-[2px] min-w-fit">
                      <span className="pt-1 min-w-fit text-[9.5px] text-message-time">
                        {calculateTime(message.createdAt)}
                      </span>
                      <span>
                        {message.authorId === currentUser?.id && (
                          <MessageStatus status={message.status} />
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageContainer;
