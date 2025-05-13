"use client";

import React from "react";
import { Button } from "../ui/button";
import { MouseDownEvent } from "emoji-picker-react/dist/config/config";
import { Mic, SendHorizonal } from "lucide-react";
import { Textarea } from "../ui/textarea";
import AudioRecorder from "./audio-recorder";
import AttachmentWrapper from "./attachment-wrapper";
import EmojiPicker from "../custom/emoji-picker";
import useMessageSend from "@/hooks/use-message-send";

interface MessageBarProps {
  onTypingStatusChange: () => void;
}

const MessageBar = ({ onTypingStatusChange }: MessageBarProps) => {
  const { onMessageSend } = useMessageSend();

  const [message, setMessage] = React.useState("");
  const [showAudioRec, setShowAudioRec] = React.useState(false);

  const addEmoji: MouseDownEvent = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTypingStatusChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && message.trim()) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    onMessageSend(message);
    setMessage("");
  };

  return (
    <div className="flex items-center p-3 h-[10%] relative border-t border-gray-200 gap-1">
      {showAudioRec ? (
        <AudioRecorder
          showAudioRecorderHandler={setShowAudioRec}
          startRecordingOnMount={true}
        />
      ) : (
        <>
          <EmojiPicker onEmojiClick={addEmoji} />
          <AttachmentWrapper message={message} setMessage={setMessage} />

          <Textarea
            className="focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[40px] max-h-[120px] py-2"
            placeholder="Type a message"
            onChange={(e) => handleKeyChange(e)}
            onKeyDown={(e) => handleKeyDown(e)}
            value={message}
            autoFocus
            rows={1}
          />

          {message ? (
            <Button variant="ghost" onClick={sendMessage}>
              <SendHorizonal />
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setShowAudioRec(true)}>
              <Mic />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default MessageBar;
