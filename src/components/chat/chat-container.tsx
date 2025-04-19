/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatHeader from "./chat-header";
import MessageContainer from "./message-container";
import { usePathname } from "next/navigation";
import { useStore } from "@/store";
import MessageBar from "./message-bar";
import socket from "@/lib/socket";

const ChatContainer: React.FC = () => {
  const pathname = usePathname();
  const chatId = pathname?.split("/")[2] ?? null;

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const { chatList, currentUser, messages, setMessages } = useStore();
  const currentChat = chatList.find((c) => c._id === chatId);
  const isNearBottomRef = useRef(true);

  // 1. Load initial messages when chatId changes
  useEffect(() => {
    if (!chatId) return;

    // Reset state
    setMessages([]);
    setHasMore(true);
    setLoadingHistory(true);

    // Join and fetch first page
    socket.emit("joinChat", chatId, (res: any) => {
      if (res.status !== 200) {
        setLoadingHistory(false);
        return;
      }

      socket.emit(
        "message:history",
        { chatId, before: null, limit: 20 },
        (historyRes: any) => {
          if (historyRes.status === 200 && historyRes.data.length) {
            setMessages(historyRes.data);
            if (historyRes.data.length < 20) {
              setHasMore(false);
            }
          } else {
            setHasMore(false);
          }
          setLoadingHistory(false);
          // setTimeout(() => scrollToBottom(), 0); // Initial scroll to bottom
        }
      );
    });
  }, [chatId, setMessages]);

  // 2. Subscribe to new messages
  // useEffect(() => {
  //   const handleNew = (newMessage: Message) => {
  //     console.log("New message received:", newMessage);

  //     setMessages([...messages, newMessage]);
  //     if (isNearBottomRef.current) {
  //       scrollToBottom();
  //     }
  //   };

  //   socket.on("message:new", handleNew);
  //   return () => {
  //     socket.off("message:new", handleNew);
  //   };
  // }, [messages, setMessages]);

  // const scrollToBottom = () => {
  //   const el = containerRef.current;
  //   if (el) {
  //     el.scrollTop = el.scrollHeight;
  //   }
  // };

  // 3. Handle scroll events
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    // Check if near the top to load history
    if (el.scrollTop < 100) {
      fetchHistory();
    }

    // Update near-bottom status
    const threshold = 100;
    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    isNearBottomRef.current = isNearBottom;
  };

  // 4. Fetch older messages
  const fetchHistory = useCallback(() => {
    if (!chatId || loadingHistory || !hasMore) return;

    const el = containerRef.current;
    if (!el) return;

    // Save current scroll position
    const prevScrollHeight = el.scrollHeight;
    const prevScrollTop = el.scrollTop;

    setLoadingHistory(true);
    const oldest = messages[0]?.createdAt ?? null;

    socket.emit(
      "message:history",
      { chatId, before: oldest, limit: 20 },
      (res: any) => {
        if (res.status === 200 && res.data.length) {
          setMessages([...res.data, ...messages]);
          if (res.data.length < 20) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
        setLoadingHistory(false);

        // Adjust scroll position after messages are added
        setTimeout(() => {
          if (containerRef.current) {
            const newScrollHeight = containerRef.current.scrollHeight;
            containerRef.current.scrollTop =
              prevScrollTop + (newScrollHeight - prevScrollHeight);
          }
        }, 0);
      }
    );
  }, [chatId, loadingHistory, hasMore, messages, setMessages]);

  // 5. Send message
  const sendMessage = (message: string) => {
    if (!chatId) return;
    socket.emit(
      "message:send",
      { chatId, content: message, attachments: [] },
      (res: any) => {
        if (res.status !== 201) console.error(res.error);
      }
    );
  };

  if (!chatId) {
    return <div className="p-4">No chat selected.</div>;
  }

  if (!currentChat || !currentUser) {
    return <div className="p-4">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <ChatHeader chat={currentChat} />
      <MessageContainer
        messages={messages}
        currentUserId={currentUser.id}
        loadingHistory={loadingHistory}
        ref={containerRef}
        onScroll={handleScroll}
      />
      <MessageBar setMessage={sendMessage} />
    </div>
  );
};

export default ChatContainer;
