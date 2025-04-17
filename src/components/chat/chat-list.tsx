/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import ChatItem from "./chat";
import { useStore } from "@/store";
import socket from "@/lib/socket";
import { type Chat } from "@/types/types";
import toast from "react-hot-toast";
import Notification from "../custom/notification";
import API from "@/lib/axios";
import { AxiosError } from "axios";

const ChatList = () => {
  const { currentUser, chatList, setChatList } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await API.get("/chat");
        const chats: Chat[] = response.data.map((chat: any) => ({
          id: chat._id,
          avatarUrl: chat.avatarUrl,
          lastMessage: chat.lastMessage,
          partnerName:
            chat.participants[0]._id === currentUser?.id
              ? chat.participants[1].name
              : chat.participants[0].name,
        }));
        setChatList(chats);
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
    socket.emit("join", currentUser?.id);

    socket.on("friendRequestAccepted", (chat) => {
      const shouldNotified = chat.userId !== currentUser.id;
      const newChat: Chat = {
        id: chat.id,
        avatarUrl: chat.avatarUrl,
        lastMessage: chat.lastMessage,
        partnerName: chat.partnerName,
      };
      setChatList([...chatList, newChat]);

      if (!shouldNotified) return;
      toast.custom(
        (t) => (
          <Notification
            t={t}
            url={`/chat/${chat.id}`}
            senderName={newChat.partnerName}
            image={newChat.avatarUrl}
            message="Accept your friend request"
          />
        ),
        { position: "top-center" }
      );
    });

    return () => {
      socket.off("friendRequestAccepted");
    };
  }, [chatList, currentUser?.id, setChatList]);

  const content = isLoading ? (
    <p>Loading...</p>
  ) : (
    <div>
      {chatList.map((chat) => (
        <ChatItem
          id={chat.id}
          key={chat.id}
          avatarUrl={chat.avatarUrl}
          lastMessage={chat.lastMessage}
          partnerName={chat.partnerName}
        />
      ))}
    </div>
  );

  return <ScrollArea className="h-full pb-4">{content}</ScrollArea>;
};

export default ChatList;
