"use client";

import React, { useMemo } from "react";
import ChatHeader from "./chat-header";
import MessageContainer from "./message-container";
import { usePathname } from "next/navigation";
import { useStore } from "@/store";
import MessageBar from "./message-bar";

const ChatContainer = () => {
  const pathname = usePathname();
  const segments = pathname?.split("/");
  const chatId = segments && segments.length > 2 ? segments[2] : null;

  const { chatList, currentUser } = useStore();

  const currentChat = useMemo(
    () => chatList.find((c) => c.id === chatId),
    [chatList, chatId]
  );

  if (!chatId) {
    return <div className="p-4">No chat selected.</div>;
  }
  if (!currentChat) {
    return <div className="p-4">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <ChatHeader chat={currentChat} />
      {/* <MessageContainer messages={} /> */}
      <MessageBar
        currentChat={currentChat}
        currentUser={currentUser}
        setMessage={() => {}}
      />
    </div>
  );
};

export default ChatContainer;
