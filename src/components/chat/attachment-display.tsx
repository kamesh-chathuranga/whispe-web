import { useAttachmentUrl } from "@/hooks/use-chat-api";
import { Message } from "@/types/types";
import Image from "next/image";
import React from "react";

interface AttachmentDisplayProps {
  message: Message;
}

const AttachmentDisplay = ({ message }: AttachmentDisplayProps) => {
  const { attachmentUrl, isLoading, fetchAttachmentUrl } =
    useAttachmentUrl(message);

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
        return <audio src={url} controls className="w-full" />;
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

  let url;

  if (message.attachment && message.attachment.url) {
    url = message.attachment.url;
  } else {
    fetchAttachmentUrl();
    url = attachmentUrl;
  }

  return (
    <div className="flex flex-col gap-2 w-full shadow-md rounded-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
      {isLoading && (
        <p className="text-xs text-gray-500">Loading attachments...</p>
      )}
      {!isLoading && url && displayAttachment(url)}

      {!isLoading && !url && !message.attachment && (
        <p className="text-xs text-red-500">Could not load attachments.</p>
      )}
    </div>
  );
};

export default AttachmentDisplay;
