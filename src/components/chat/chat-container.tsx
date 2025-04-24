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
    if (!chatId) return;

    setMessages([]);
    setHasMore(true);
    setLoadingHistory(true);

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
        }
      );
    });
  }, [chatId, setMessages]);

  const handleTyping = useCallback(() => {
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
        loadingHistory={loadingHistory}
        ref={containerRef}
        onScroll={handleScroll}
      />
      <MessageBar setMessage={sendMessage} handleTyping={handleTyping} />
    </div>
  );
};

export default ChatContainer;
