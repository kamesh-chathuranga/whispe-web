"use client";

import React from "react";
import ChatTopBar from "./chat-top-bar";
import SearchBar from "./search-bar";
import ChatList from "./chat-list";

const LeftSidePanel = () => {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div className="flex flex-col h-full px-4 pt-2 gap-y-4">
      <ChatTopBar />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ChatList searchQuery={searchQuery} />
    </div>
  );
};

export default LeftSidePanel;
