/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatHeader from "./chat-header";
import MessageContainer from "./message-container";
import { usePathname } from "next/navigation";
import { useStore } from "@/store";
import MessageBar from "./message-bar";
import socket from "@/lib/socket";
import API from "@/lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const ChatContainer: React.FC = () => {
  const pathname = usePathname();
  const chatId = pathname?.split("/")[2] ?? null;

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const { chatList, currentUser, messages, setMessages } = useStore();
  const currentChat = chatList.find((c) => c._id === chatId);
  const isNearBottomRef = useRef(true);

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    socket.on("typing", () => {
      setIsTyping(true);
    });

    socket.on("typing:stop", () => {
      setIsTyping(false);
    });

    return () => {
      socket.off("typing");
      socket.off("typing:stop");
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await API.post("/messages", {
          chatId,
          before: undefined,
          limit: 20,
        });
        setMessages(response.data);
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data.message, { position: "top-center" });
        } else {
          toast.error(
            "An error occurred while fetching messages. Please try again.",
            { position: "top-center" }
          );
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [chatId, setMessages]);

  const handleTypingStatus = useCallback(() => {
    socket.emit("typing", chatId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", chatId);
    }, 1000);
  }, [chatId]);

  const fetchHistory = useCallback(() => {
    if (!chatId || loadingHistory || !hasMore) return;

    const el = containerRef.current;
    if (!el) return;

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

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (el.scrollTop < 100) {
      fetchHistory();
    }

    const threshold = 100;
    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    isNearBottomRef.current = isNearBottom;
  }, [fetchHistory]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!chatId) return;

      socket.emit(
        "message:send",
        { chatId, content: message, attachments: [] },
        (res: any) => {
          if (res.status !== 201) console.error(res.error);
        }
      );
    },
    [chatId]
  );

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
        isTyping={isTyping}
        messages={messages}
        currentUserId={currentUser.id}
        loadingHistory={loadingHistory || isLoading}
        ref={containerRef}
        onScroll={handleScroll}
      />
      <MessageBar
        setMessage={sendMessage}
        onTypingStatusChange={handleTypingStatus}
      />
    </div>
  );
};

export default ChatContainer;
