"use client";

import React, { Fragment } from "react";

import { useStore } from "@/store";
import ChatContainer from "./chat-container";
import EmptyChat from "./empty-chat";

const RightSidePanel = () => {
  const { currentChat } = useStore();

  return <Fragment>{currentChat ? <ChatContainer /> : <EmptyChat />}</Fragment>;
};

export default RightSidePanel;
