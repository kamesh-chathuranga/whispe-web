import { useAttachmentUrl } from "@/hooks/use-chat-api";
import { Message } from "@/types/types";
import Image from "next/image";
import React from "react";
import CircularProgressBar from "../custom/circular-progress-bar";
import { Separator } from "../ui/separator";
import { Music } from "lucide-react";

interface AttachmentDisplayProps {
  message: Message;
}

const AttachmentDisplay = ({ message }: AttachmentDisplayProps) => {
  const {
    attachmentUrl: resolvedUrl,
    isLoading,
    error,
  } = useAttachmentUrl(message);

  const displayAttachment = (url: string) => {
    if (
      !url ||
      !message.attachment ||
      !message.attachment.mimeType ||
      !message.attachment.filename
    ) {
      return null;
    }

    switch (message.attachment.type) {
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
          <video
            src={url}
            controls
            className="max-w-full h-auto rounded-md border"
          />
        );
      case "audio":
        return (
          <div className="w-80 min-h-28 rounded-md flex items-center justify-center flex-col bg-green-100">
            <div className="flex items-center gap-4 w-full p-4">
              <span>
                <Music className="text-gray-500" size={25} />
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
                <button className="border w-1/2 py-1 rounded-sm bg-white/80">
                  Open
                </button>
                <button className="border w-1/2 py-1 rounded-sm bg-white/80">
                  Save as...
                </button>
              </div>
            </div>
          </div>
        );
      default: // 'file'
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            download={message.attachment.filename}
            className="p-2 border rounded-md flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 break-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span>{message.attachment.filename}</span>
          </a>
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
      <div className="p-2">
        <p className="text-xs text-gray-500">Loading attachment...</p>
      </div>
    );
  }

  if (resolvedUrl) {
    const progress = message.attachment.uploadProgress;
    const isStillUploading = progress ? progress < 100 && progress >= 0 : false;

    return (
      <div className="relative flex flex-col gap-2 w-full shadow-md rounded-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
        {displayAttachment(resolvedUrl)}
        {isStillUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-md z-10">
            {/* The CircularProgressBar is centered here by its parent div */}
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
