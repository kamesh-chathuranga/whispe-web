import { useAttachmentUrl } from "@/hooks/use-chat-api";
import { Message } from "@/types/types";
import Image from "next/image";
import React, { useCallback } from "react";
import CircularProgressBar from "../custom/circular-progress-bar";
import { Separator } from "../ui/separator";
import { File, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import VoiceMessagePlayer from "./voice-message-player";

interface AttachmentDisplayProps {
  message: Message;
  userId: string;
}

const AttachmentDisplay = ({ message, userId }: AttachmentDisplayProps) => {
  const {
    attachmentUrl: resolvedUrl,
    isLoading,
    error,
  } = useAttachmentUrl(message);

  const onOpenAudio = useCallback((url: string) => {
    window.open(url, "_blank", "noopener");
  }, []);

  const displayAttachment = (url: string) => {
    if (
      !url ||
      !message.attachment ||
      !message.attachment.mimeType ||
      !message.attachment.filename
    ) {
      return null;
    }

    const type = message.attachment.type;

    switch (type) {
      case "image":
        return (
          <div className="relative w-80 h-44 rounded-md">
            <Image
              src={url}
              alt={message.attachment.filename}
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              className="rounded-md border object-cover"
            />
            {!message.content && (
              <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black/20 to-transparent rounded-b-md" />
            )}
          </div>
        );
      case "video":
        return (
          <video src={url} controls className="w-80 h-44 rounded-md border" />
        );
      case "voice":
        return <VoiceMessagePlayer audioUrl={url} sender={message.sender} />;
      default:
        return (
          <div
            className={cn(
              "w-80 min-h-28 rounded-md flex items-center justify-center flex-col",
              userId !== message.sender._id ? "bg-gray-50" : "bg-green-100"
            )}
          >
            <div className="flex items-center gap-4 w-full p-4">
              <span>
                {type === "audio" ? (
                  <Music className="text-gray-500" size={25} />
                ) : (
                  <File className="text-gray-500" size={25} />
                )}
              </span>
              <div className="flex flex-col min-w-0">
                <p className="text-sm text-gray-600 truncate">
                  {message.attachment.filename}
                </p>
                <p className="text-xs text-gray-500">
                  {(message.attachment.size / (1024 * 1024)).toFixed(2)} MB,{" "}
                  {message.attachment.type}
                </p>
              </div>
            </div>
            <Separator className="w-full" />
            <div className="w-full p-4">
              <div className="flex items-center justify-center gap-1">
                <button
                  className="border w-1/2 py-1 rounded-sm bg-white/80"
                  onClick={() => onOpenAudio(url)}
                >
                  Open
                </button>
                <button
                  className="border w-1/2 py-1 rounded-sm bg-white/80"
                  onClick={() => onOpenAudio(url)}
                >
                  Save as...
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  if (!message.attachment) {
    return null;
  }

  if (error) {
    return (
      <div className="p-2">
        <p className="text-xs text-red-500">
          Error loading attachment: {error.message}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-2 w-80 h-32">
        <p className="text-xs text-gray-500">Loading attachment...</p>
      </div>
    );
  }

  if (resolvedUrl) {
    const progress = message.attachment.uploadProgress;
    const isStillUploading = progress ? progress < 100 && progress >= 0 : false;

    return (
      <div
        className={cn(`relative flex flex-col gap-2 w-full`, {
          "shadow-md rounded-md hover:shadow-lg transition-shadow duration-200 ease-in-out":
            message.attachment.type !== "voice",
        })}
      >
        {displayAttachment(resolvedUrl)}
        {isStillUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-md z-10">
            <CircularProgressBar progress={progress!} />
          </div>
        )}
      </div>
    );
  }

  if (message.attachment && !resolvedUrl && !isLoading) {
    return (
      <div className="p-2">
        <p className="text-xs text-red-500">Could not display attachment.</p>
      </div>
    );
  }

  return null;
};

export default AttachmentDisplay;
