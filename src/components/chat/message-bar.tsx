"use client";

import React, { Fragment, useEffect } from "react";
import { Button } from "../ui/button";
import EmojiPicker from "emoji-picker-react";
import { MouseDownEvent } from "emoji-picker-react/dist/config/config";
import { Mic, SendHorizonal, Smile } from "lucide-react";
import { Textarea } from "../ui/textarea";
import AttachmentDropdown from "./attachment-dropdown";
import AudioRecorder from "./audio-recorder";

interface MessageBarProps {
  setMessage: (message: string) => void;
  onTypingStatusChange: () => void;
}

const MessageBar = ({ setMessage, onTypingStatusChange }: MessageBarProps) => {
  const [typedMessage, setTypedMessage] = React.useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
  const [showAudioRec, setShowAudioRec] = React.useState(false);

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

  const handleKeyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTypedMessage(e.target.value);
    onTypingStatusChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && typedMessage.trim()) {
      e.preventDefault();
      sendMessage();
    }
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
      {showAudioRec ? (
        <AudioRecorder
          showAudioRecorderHandler={setShowAudioRec}
          startRecordingOnMount={true}
        />
      ) : (
        <Fragment>
          <Button variant="ghost" onClick={toggleEmojiPicker} id="emoji-picker">
            <Smile />
          </Button>

          {isEmojiPickerOpen && (
            <div className="absolute bottom-24 left-16" ref={emojiPickerRef}>
              <EmojiPicker onEmojiClick={addEmoji} />
            </div>
          )}
          <AttachmentDropdown />
          <Textarea
            className="focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[40px] max-h-[120px] py-2"
            placeholder="Type a message"
            onChange={(e) => handleKeyChange(e)}
            onKeyDown={(e) => handleKeyDown(e)}
            value={typedMessage}
            autoFocus
            rows={1}
          />
          {typedMessage ? (
            <Button variant="ghost" onClick={sendMessage}>
              <SendHorizonal />
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setShowAudioRec(true)}>
              <Mic />
            </Button>
          )}
        </Fragment>
      )}
    </div>
  );
};

export default MessageBar;
