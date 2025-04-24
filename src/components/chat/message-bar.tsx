"use client";

import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import EmojiPicker from "emoji-picker-react";
import { MouseDownEvent } from "emoji-picker-react/dist/config/config";
import { Paperclip, SendHorizonal, Smile } from "lucide-react";

interface MessageBarProps {
  setMessage: (message: string) => void;
  handleTyping: () => void;
}

const MessageBar = ({ setMessage, handleTyping }: MessageBarProps) => {
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

  const handleKeyDown = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypedMessage(e.target.value);
    handleTyping();
  };

  const sendMessage = async () => {
    try {
      setMessage(typedMessage);
      setTypedMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center p-3 h-[10%] relative border-t border-gray-200 gap-2">
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
        className="focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="Type a message"
        onChange={(e) => handleKeyDown(e)}
        value={typedMessage}
        autoFocus
      />
      <Button variant="ghost" onClick={sendMessage}>
        <SendHorizonal />
      </Button>
    </div>
  );
};

export default MessageBar;
