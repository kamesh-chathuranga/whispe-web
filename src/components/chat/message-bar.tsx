"use client";

import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Chat, Message, User } from "@/types/types";
import EmojiPicker from "emoji-picker-react";
import { MouseDownEvent } from "emoji-picker-react/dist/config/config";
import { Paperclip, SendHorizonal, Smile } from "lucide-react";

interface MessageBarProps {
  currentUser: User | null;
  currentChat: Chat | null;
  setMessage: (message: Message) => void;
}

const MessageBar = ({
  currentUser,
  currentChat,
  setMessage,
}: MessageBarProps) => {
  const [typedMessage, setTypedMessage] = React.useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
  const emojiPickerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const emojiPickerCloseHandler = (e: MouseEvent) => {
      if (
        (e.target as HTMLElement).id !== "emoji-picker" &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setIsEmojiPickerOpen(false);
      }
    };

    document.addEventListener("click", emojiPickerCloseHandler);
    return () => {
      document.removeEventListener("click", emojiPickerCloseHandler);
    };
  }, []);

  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen((prev) => !prev);
  };

  const addEmoji: MouseDownEvent = (emojiData) => {
    setTypedMessage((prev) => prev + emojiData.emoji);
  };

  const sendMessage = async () => {
    // try {
    //   const { data } = await axios.post(
    //     "http://localhost:7000/api/message/new",
    //     {
    //       from: currentUser?.id,
    //       to: curentChat?.id,
    //       message: typedMessage,
    //     }
    //   );
    //   socket.current?.emit("send-message", {
    //     from: currentUser?.id,
    //     to: curentChat?.id,
    //     message: data,
    //   });
    //   setMessage(data);
    //   setTypedMessage("");
    // } catch (error) {
    //   console.log(error);
    // }
  };

  return (
    <div className="flex items-center p-3 h-[10%] relative">
      <Button variant="ghost" onClick={toggleEmojiPicker} id="emoji-picker">
        <Smile />
      </Button>

      {isEmojiPickerOpen && (
        <div className="absolute bottom-24 left-16" ref={emojiPickerRef}>
          <EmojiPicker onEmojiClick={addEmoji} />
        </div>
      )}
      <Button variant="ghost">
        <Paperclip />
      </Button>
      <Input
        placeholder="Type a message"
        onChange={(e) => setTypedMessage(e.target.value)}
        value={typedMessage}
      />
      <Button variant="ghost" onClick={sendMessage}>
        <SendHorizonal />
      </Button>
    </div>
  );
};

export default MessageBar;
