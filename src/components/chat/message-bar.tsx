"use client";

import React, { useCallback } from "react";
import { Button } from "../ui/button";
import { MouseDownEvent } from "emoji-picker-react/dist/config/config";
import { Mic, SendHorizonal } from "lucide-react";
import { Textarea } from "../ui/textarea";
import AudioRecorder from "./audio-recorder";
import EmojiPicker from "../custom/emoji-picker";
import { onMessageSend } from "@/lib/sendMessage";
import { useStore } from "@/store";
import AttachmentDropdown from "./attachment-dropdown";
import MediaPreviewCard from "./media-preview-card";
import { Message, Person, User } from "@/types/types";
import { v4 as uuidv4 } from "uuid";
import useMessageMutation from "@/hooks/use-message";

interface MessageBarProps {
  user: User;
  chatId: string;
  onTypingStatusChange: () => void;
}

const MessageBar = ({
  user,
  chatId,
  onTypingStatusChange,
}: MessageBarProps) => {
  const { addNewMessage } = useMessageMutation();
  const { mediaFiles, setMediaFiles } = useStore();

  const [message, setMessage] = React.useState("");
  const [showAudioRec, setShowAudioRec] = React.useState(false);

  const addEmoji: MouseDownEvent = useCallback((emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  }, []);

  const handleKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
      onTypingStatusChange();
    },
    [onTypingStatusChange]
  );

  const handleSendMessage = useCallback(() => {
    const tempId = uuidv4();
    const newMessage: Message = {
      _id: tempId,
      content: message,
      sender: {
        _id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
      } as Person,
      chat: chatId,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    addNewMessage(newMessage);
    onMessageSend(chatId, message, tempId);
    setMessage("");
  }, [chatId, message, addNewMessage, user.avatarUrl, user.id, user.name]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && message.trim()) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [message, handleSendMessage]
  );

  return (
    <div className="flex items-center p-3 h-[10%] relative border-t border-gray-200 gap-1">
      {showAudioRec ? (
        <AudioRecorder showAudioRecorderHandler={setShowAudioRec} />
      ) : (
        <>
          <EmojiPicker onEmojiClick={addEmoji} />

          <AttachmentDropdown setMediaFiles={setMediaFiles} />

          {mediaFiles.length > 0 && (
            <MediaPreviewCard
              caption={message}
              mediaFiles={mediaFiles}
              onClose={() => setMediaFiles([])}
            />
          )}

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
            <Button variant="ghost" onClick={handleSendMessage}>
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
