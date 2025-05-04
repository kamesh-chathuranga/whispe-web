import React from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import SideBar from "./side-bar";
import SearchBar from "./search-bar";
import ChatTopBar from "./chat-top-bar";
import ChatList from "./chat-list";
import RightSidePanel from "./right-side-panel";

const ChatPane = () => {
  return (
    <div className="flex h-full w-full">
      <SideBar />

      <ResizablePanelGroup direction="horizontal" className="h-full ">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={50}>
          <div className="flex flex-col h-full px-4 gap-y-4">
            <div className="flex flex-col gap-y-3">
              <ChatTopBar />
              <SearchBar />
            </div>
            <ChatList />
          </div>
        </ResizablePanel>
        <ResizableHandle className="w-1" />
        <ResizablePanel defaultSize={75} minSize={50}>
          <RightSidePanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ChatPane;
