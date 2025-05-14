"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatHeader from "./chat-header";
import MessageContainer from "./message-container";
import { useStore } from "@/store";
import MessageBar from "./message-bar";
import socket from "@/lib/socket";
import API from "@/lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { currentChat, currentUser, messages, setMessages } = useStore();

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const prevScrollHeightRef = useRef(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!currentChat) return;

    setMessages([]);
    const controller = new AbortController();

    (async () => {
      try {
        setIsLoading(true);

        const response = await API.get(
          `/chats/${currentChat._id}/messages?limit=${20}`,
          { signal: controller.signal }
        );
        setMessages(response.data);
      } catch (error) {
        if (controller.signal.aborted) return;

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

    return () => controller.abort();
  }, [currentChat, setMessages]);

  const markMessagesAsRead = useCallback(() => {
    if (!socket || !messages.length) return;

    const unreadMessages = messages.filter(
      (message) =>
        message.sender._id !== currentUser?.id &&
        (message.status === "sent" || message.status === "delivered")
    );

    unreadMessages.forEach((message) => {
      socket.emit("message:read", { messageId: message._id });
    });
  }, [messages, currentUser]);

  // Second effect just for marking messages as read
  useEffect(() => {
    if (currentChat && messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages, markMessagesAsRead, currentChat]);

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
    if (!socket) return;

    socket.on("message:status", ({ messageId, status }) => {
      const updatedMessages = messages.map((message) =>
        message._id === messageId ? { ...message, status } : message
      );
      setMessages(updatedMessages);
    });

    return () => {
      socket.off("message:status");
    };
  }, [messages, setMessages]);

  useEffect(() => {
    if (containerRef.current && messages.length > 0 && !isLoading) {
      const scrollContainer = containerRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (containerRef.current && messages.length > 0) {
      const scrollContainer = containerRef.current;
      const isNearBottom =
        scrollContainer.scrollHeight -
          scrollContainer.scrollTop -
          scrollContainer.clientHeight <
        200;

      isNearBottomRef.current = isNearBottom;

      if (isNearBottom) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [isTyping, messages.length]);

  useEffect(() => {
    if (
      containerRef.current &&
      prevScrollHeightRef.current > 0 &&
      !loadingHistory
    ) {
      const newScrollHeight = containerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeightRef.current;

      containerRef.current.scrollTop = scrollDiff;
      prevScrollHeightRef.current = 0;
    }
  }, [loadingHistory, messages]);

  const loadPreviousMessages = useCallback(async () => {
    if (!currentChat || loadingHistory || !hasMore) return;

    try {
      setLoadingHistory(true);

      const firstMessageTimestamp =
        messages.length > 0 ? messages[0].createdAt : undefined;

      if (!firstMessageTimestamp) return;

      const response = await API.get(
        `/chats/${
          currentChat._id
        }/messages?limit=${20}&before=${firstMessageTimestamp}`
      );

      if (response.data.length === 0) {
        setHasMore(false);
        return;
      }

      if (containerRef.current) {
        prevScrollHeightRef.current = containerRef.current.scrollHeight;
      }

      const updatedMessages = [...response.data, ...messages];
      setMessages(updatedMessages);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message, { position: "top-center" });
      } else {
        toast.error("An error occurred while fetching previous messages.", {
          position: "top-center",
        });
      }
    } finally {
      setLoadingHistory(false);
    }
  }, [currentChat, loadingHistory, hasMore, messages, setMessages]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop } = containerRef.current;

    if (scrollTop < 50 && !loadingHistory && hasMore) {
      loadPreviousMessages();
    }

    const isNearBottom =
      containerRef.current.scrollHeight -
        containerRef.current.scrollTop -
        containerRef.current.clientHeight <
      200;

    isNearBottomRef.current = isNearBottom;
  }, [loadingHistory, hasMore, loadPreviousMessages]);

  const handleTypingStatus = useCallback(() => {
    const chatId = currentChat?._id;
    socket.emit("typing", chatId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", chatId);
    }, 1000);
  }, [currentChat?._id]);

  if (!currentChat || !currentUser) {
    return <div className="p-4">No chat selected.</div>;
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <ChatHeader chat={currentChat} />
      <MessageContainer
        ref={containerRef}
        isTyping={isTyping}
        messages={messages}
        onScroll={handleScroll}
        currentUserId={currentUser.id}
        loadingHistory={loadingHistory || isLoading}
      />
      <MessageBar onTypingStatusChange={handleTypingStatus} />
    </div>
  );
};

export default ChatContainer;
