"use client";

import React, { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { useStore } from "@/store";
import socket from "@/lib/socket";
import toast from "react-hot-toast";
import Notification from "../custom/notification";
import API from "@/lib/axios";
import { AxiosError } from "axios";
import Chat from "./chat";

interface ChatListProps {
  searchQuery: string;
}

const ChatList = ({ searchQuery }: ChatListProps) => {
  const { currentUser, chatList, setChatList } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await API.get("/chat");
        setChatList(response.data);
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data.message);
        } else {
          toast.error("Failed to fetch chat list. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [currentUser?.id, setChatList]);

  useEffect(() => {
    if (!socket || !currentUser?.id) return;

    socket.on("friendRequest:accepted", (chat) => {
      const shouldNotified = chat.acceptBy !== currentUser.id;
      setChatList([...chatList, chat]);

      if (!shouldNotified) return;
      toast.custom(
        (t) => (
          <Notification
            t={t}
            url={`/chat/${chat._id}`}
            senderName={chat.partner.name}
            image={chat.partner.avatarUrl}
            message="Accept your friend request"
          />
        ),
        { position: "top-center" }
      );
    });

    return () => {
      socket.off("friendRequest:accepted");
    };
  }, [chatList, currentUser?.id, setChatList]);

  const filteredChatList = chatList.filter((chat) => {
    if (!searchQuery.trim()) return true;
    return chat.partner.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const content = isLoading ? (
    <p>Loading...</p>
  ) : (
    <div>
      {filteredChatList.length > 0 ? (
        filteredChatList.map((chat) => (
          <Chat
            _id={chat._id}
            key={chat._id}
            partner={chat.partner}
            lastMessage={chat.lastMessage}
          />
        ))
      ) : (
        <p className="text-center text-gray-500 py-4">No chats found</p>
      )}
    </div>
  );

  return <ScrollArea className="h-full pb-4">{content}</ScrollArea>;
};

export default ChatList;
