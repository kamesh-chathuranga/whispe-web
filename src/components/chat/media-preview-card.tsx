import React, { useCallback, useRef, useState, useEffect } from "react";
import { Music, Plus, SendHorizonal, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import EmojiPicker from "../custom/emoji-picker";
import { onMessageSend } from "@/lib/sendMessage";
import mediaUploader from "@/lib/mediaUploader";
import { useStore } from "@/store";
import { v4 as uuidv4 } from "uuid";
import { Attachment, Message, Person } from "@/types/types";
import useMessageMutation from "@/hooks/use-message";
import { AxiosProgressEvent } from "axios";
import { mapMimTypeToFileType } from "@/lib/utils";
import Image from "next/image";

interface MediaItem {
  id: string;
  file: File;
  caption: string;
  objectUrl: string;
}

interface MediaPreviewCardProps {
  caption?: string;
  mediaFiles: File[];
  onClose: () => void;
}

const MediaPreviewCard = ({
  caption: initialCaption,
  mediaFiles: initialMediaFiles,
  onClose,
}: MediaPreviewCardProps) => {
  const { currentChat, currentUser } = useStore();
  const { addNewMessage, updateMessage } = useMessageMutation();
  const [previewIndex, setPreviewIndex] = useState(0);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  // Effect to initialize mediaItems when initialMediaFiles prop changes
  useEffect(() => {
    const initialItems: MediaItem[] = initialMediaFiles.map((file, i) => ({
      id: uuidv4(),
      file,
      caption: i === 0 ? initialCaption || "" : "",
      objectUrl: URL.createObjectURL(file),
    }));

    setMediaItems(initialItems);
    setPreviewIndex(0);

    return () => {
      initialItems.forEach((item) => URL.revokeObjectURL(item.objectUrl));
    };
  }, [initialCaption, initialMediaFiles]);

  const sendMessageWithAttachments = useCallback(async () => {
    if (!mediaItems.length || !currentChat) return;

    const itemsToProcess = [...mediaItems];

    setMediaItems([]);
    setPreviewIndex(0);
    onClose();
    mediaItems.forEach((item) => URL.revokeObjectURL(item.objectUrl));

    const uploadTasks = itemsToProcess.map(async (item) => {
      const tempId = uuidv4();

      const tempMessage: Message = {
        _id: tempId,
        chat: currentChat._id,
        sender: {
          _id: currentUser?.id,
          name: currentUser?.name,
          avatarUrl: currentUser?.avatarUrl,
        } as Person,
        content: item.caption || "",
        attachment: {
          url: item.objectUrl,
          filename: item.file.name,
          mimeType: item.file.type,
          size: item.file.size,
          type: mapMimTypeToFileType(item.file.type),
          objectKey: "",
          uploadProgress: 0,
        } as Attachment,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      addNewMessage(tempMessage);

      try {
        const onProgress = (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            updateMessage(tempId, {
              ...tempMessage,
              attachment: {
                ...tempMessage.attachment,
                uploadProgress: progress,
              } as Attachment,
            });
          }
        };

        const attachmentDetails = await mediaUploader(
          item.file,
          currentChat._id,
          onProgress
        );

        return { item, tempId, attachmentDetails, error: null, tempMessage };
      } catch (error) {
        console.log("Error uploading or sending message:", error);

        updateMessage(tempId, {
          ...tempMessage,
          status: "failed",
          attachment: {
            ...tempMessage.attachment,
            uploadProgress: -1,
          } as Attachment,
        });

        return { item, tempId, attachmentDetails: null, error, tempMessage };
      }
    });

    const uploadResults = await Promise.all(uploadTasks);

    for (const result of uploadResults) {
      if (result.attachmentDetails && !result.error) {
        try {
          onMessageSend(
            currentChat._id,
            result.item.caption || "",
            result.tempId,
            result.attachmentDetails
          );
        } catch (sendError) {
          console.log(
            `Error sending message for ${result.item.file.name}:`,
            sendError
          );

          updateMessage(result.tempId, {
            ...result.tempMessage,
            status: "failed",
            attachment: {
              ...result.tempMessage.attachment,
              uploadProgress: -1,
            } as Attachment,
          });
        }
      }
    }
  }, [
    mediaItems,
    currentChat,
    currentUser?.id,
    currentUser?.name,
    currentUser?.avatarUrl,
    addNewMessage,
    updateMessage,
    onClose,
  ]);

  const handleMediaFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const filesArray = Array.from(e.target.files);

        const newFiles = filesArray.filter(
          (file) => !mediaItems.some((item) => item.file.name === file.name)
        );

        const newMediaItems: MediaItem[] = newFiles.map((file) => ({
          id: uuidv4(),
          file,
          caption: "",
          objectUrl: URL.createObjectURL(file),
        }));

        setMediaItems((prevItems) => [...prevItems, ...newMediaItems]);
      }
    },
    [mediaItems]
  );

  const openMediaFileSelector = useCallback(() => {
    mediaFileInputRef.current?.click();
  }, []);

  const removeFile = useCallback(
    (id: string) => {
      const itemToRemove = mediaItems.find((item) => item.id === id);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.objectUrl);
      }

      const updatedItems = mediaItems.filter((item) => item.id !== id);
      setMediaItems(updatedItems);

      if (previewIndex >= updatedItems.length) {
        setPreviewIndex(updatedItems.length > 0 ? updatedItems.length - 1 : 0);
      }

      if (updatedItems.length === 0) {
        onClose();
      }
    },
    [mediaItems, previewIndex, onClose]
  );

  const handleCaptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newCaption = e.target.value;

      setMediaItems((prevItems) =>
        prevItems.map((item, idx) =>
          idx === previewIndex ? { ...item, caption: newCaption } : item
        )
      );
    },
    [previewIndex]
  );

  const handleEmojiClick = useCallback(
    (emoji: string) => {
      setMediaItems((prevItems) =>
        prevItems.map((item, idx) =>
          idx === previewIndex
            ? { ...item, caption: (item.caption || "") + emoji }
            : item
        )
      );
    },
    [previewIndex]
  );

  if (mediaItems.length === 0) {
    return null;
  }

  const currentMediaItem = mediaItems[previewIndex];

  const displayMediaPreview = (type: Attachment["type"]) => {
    switch (type) {
      case "image":
        return (
          <Image
            src={currentMediaItem.objectUrl}
            alt={currentMediaItem.file.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="h-full w-full object-contain mx-auto"
          />
        );

      case "video":
        return (
          <video
            src={currentMediaItem.objectUrl}
            controls
            className="h-full w-full object-contain mx-auto"
          />
        );

      case "audio":
        return (
          <div className="h-full w-full gap-2 flex flex-col items-center justify-center bg-gray-100 p-4">
            <Music size={64} className="text-gray-500 mb-4" />
            <p
              className="text-sm font-semibold text-center w-1/2 px-2 text-gray-800 truncate"
              title={currentMediaItem.file.name}
            >
              {currentMediaItem.file.name}
            </p>
            <p className="text-xs text-gray-600">
              {(currentMediaItem.file.size / (1024 * 1024)).toFixed(2)} MB,{" "}
              {currentMediaItem.file.type}
            </p>
          </div>
        );
      default:
        break;
    }
  };

  const displayThumbnail = (type: Attachment["type"], item: MediaItem) => {
    switch (type) {
      case "image":
        return (
          <Image
            src={item.objectUrl}
            alt={item.file.name}
            className="size-12 object-cover"
            width={48}
            height={48}
          />
        );
      case "video":
        return <video src={item.objectUrl} className="size-12" />;
      case "audio":
        return (
          <div className="size-12 flex items-center justify-center">
            <Music size={25} className="text-gray-500" />
          </div>
        );
      default:
        break;
    }
  };

  const fileType = mapMimTypeToFileType(currentMediaItem.file.type);

  return (
    <div className="border rounded-lg shadow-md absolute backdrop-blur-xl bottom-2 left-2 z-50">
      <input
        type="file"
        ref={mediaFileInputRef}
        style={{ display: "none" }}
        onChange={handleMediaFile}
        multiple
      />

      <div className="bg-gray-200/50 p-1 flex justify-between items-center">
        <Button variant="ghost" onClick={() => removeFile(currentMediaItem.id)}>
          <Trash2 />
        </Button>
      </div>

      <div className="w-[35rem] h-[18rem] relative">
        {displayMediaPreview(fileType)}
      </div>

      <div className="flex bg-gray-200/90 items-center">
        <EmojiPicker
          onEmojiClick={(e) => handleEmojiClick(e.emoji)}
          containerClassName="bottom-32 left-0"
          buttonClassName="hover:bg-gray-300/80"
        />
        <Textarea
          className="focus-visible:ring-0 focus-visible:ring-offset-0 resize-none py-5 min-h-9 bg-gray-200/90 rounded-none"
          placeholder="Caption (optional)"
          onChange={handleCaptionChange}
          value={currentMediaItem.caption || ""}
          autoFocus
          rows={1}
        />
      </div>

      {/* Thumbnail selector */}
      <div className="flex space-x-2 p-2 bg-gray-200/50 justify-between items-center">
        <Button
          className="size-11 bg-white/90 border hover:bg-white/80"
          onClick={openMediaFileSelector}
        >
          <Plus color="black" />
        </Button>

        {mediaItems.length > 1 && (
          <div className="flex space-x-2 overflow-auto">
            {mediaItems.map((item, idx) => {
              const fileType = mapMimTypeToFileType(item.file.type);

              return (
                <button
                  key={item.id}
                  className={`relative rounded hover:opacity-100 border-b-[3px] transition-opacity ${
                    idx === previewIndex
                      ? "border-green-500 opacity-100"
                      : "opacity-50 border-b-transparent"
                  }`}
                  onClick={() => setPreviewIndex(idx)}
                >
                  {displayThumbnail(fileType, item)}
                </button>
              );
            })}
          </div>
        )}

        <Button
          className="bg-green-600 hover:bg-green-500 size-11 relative"
          onClick={sendMessageWithAttachments}
        >
          <SendHorizonal />
          {/* Display the count of media items */}
          <span className="absolute -bottom-1 -right-1 text-xs bg-white text-black rounded-full px-1">
            {mediaItems.length}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default MediaPreviewCard;
