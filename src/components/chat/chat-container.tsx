"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGetUserChatMessages } from "@/hooks/use-chat-api";
import { useStore } from "@/store";
import socket from "@/lib/socket";
import ChatHeader from "./chat-header";
import MessageBar from "./message-bar";
import MessageContainer from "./message-container";

const ChatContainer = () => {
  const { currentChat, currentUser } = useStore();
  const chatId = currentChat?._id;

  const {
    messages,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetUserChatMessages(chatId);

  const [isTyping, setIsTyping] = useState(false);
  const [userIsAtBottom, setUserIsAtBottom] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const initialLoadDoneRef = useRef<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef<number>(0);

  // Reset state when chat changes
  useEffect(() => {
    initialLoadDoneRef.current = false;
    setUserIsAtBottom(true);
    lastMessageCountRef.current = 0;

    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [chatId]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(() => {
    if (!socket || !messages || !currentUser) return;

    const unread = messages.filter(
      (message) =>
        message.sender._id !== currentUser.id &&
        (message.status === "sent" || message.status === "delivered")
    );

    unread.forEach((message) =>
      socket.emit("message:read", { messageId: message._id })
    );
  }, [messages, currentUser]);

  useEffect(() => {
    if (currentChat && messages && messages.length > 0 && userIsAtBottom) {
      markMessagesAsRead();
    }
  }, [messages, markMessagesAsRead, currentChat, userIsAtBottom]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);

    socket.on("typing", handleTyping);
    socket.on("typing:stop", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("typing:stop", handleStopTyping);
    };
  }, [chatId]);

  // Scroll Management: Initial scroll & new messages
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !messages || isLoading) return;

    const hasNewMessages = messages.length > lastMessageCountRef.current;

    if (messages.length > 0 && !initialLoadDoneRef.current) {
      el.scrollTop = el.scrollHeight;
      initialLoadDoneRef.current = true;
      setUserIsAtBottom(true);
    } else if (hasNewMessages && userIsAtBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, isLoading, chatId, userIsAtBottom]);

  // Scroll Management: Adjust scroll after loading previous messages
  useEffect(() => {
    const el = containerRef.current;
    if (
      el &&
      !isFetchingNextPage &&
      prevScrollHeightRef.current > 0 &&
      messages
    ) {
      const currentScrollHeight = el.scrollHeight;
      const heightOfNewlyLoadedMessages =
        currentScrollHeight - prevScrollHeightRef.current;

      if (heightOfNewlyLoadedMessages > 0) {
        el.scrollTop += heightOfNewlyLoadedMessages;
      }
      prevScrollHeightRef.current = 0;
    }
  }, [isFetchingNextPage, messages]);

  // Scroll Management: Handle user scroll for loading more & updating atBottom state
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const isCurrentlyNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    setUserIsAtBottom(isCurrentlyNearBottom);

    if (el.scrollTop < 50 && hasNextPage && !isFetchingNextPage) {
      prevScrollHeightRef.current = el.scrollHeight;
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // Scroll Management: Typing indicator visibility and scroll
  useEffect(() => {
    const el = containerRef.current;
    if (el && isTyping && userIsAtBottom) {
      const timer = setTimeout(() => {
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
          el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isTyping, userIsAtBottom]);

  const handleTypingStatus = useCallback(() => {
    if (!socket || !chatId) return;
    socket.emit("typing", chatId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", chatId);
    }, 1000);
  }, [chatId]);

  if (!currentUser) return <div className="p-4">No user.</div>;
  if (!currentChat) return <div className="p-4">No chat selected.</div>;
  if (error)
    return <div className="p-4 text-red-500">Error: {error.message}</div>;

  if (isLoading && !messages) {
    return <div className="flex-center h-full">Loading messages...</div>;
  }

  if (!messages) {
    return (
      <div className="flex-center h-full">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <ChatHeader chat={currentChat} />
      <MessageContainer
        ref={containerRef}
        messages={messages}
        isTyping={isTyping}
        onScroll={handleScroll}
        userId={currentUser.id}
        isUserAtBottom={userIsAtBottom}
        loadingHistory={isFetchingNextPage}
      />
      <MessageBar
        user={currentUser}
        chatId={currentChat._id}
        onTypingStatusChange={handleTypingStatus}
      />
    </div>
  );
};

export default ChatContainer;
