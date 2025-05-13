/* eslint-disable @next/next/no-img-element */
import { Plus, SendHorizonal, Trash2 } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import EmojiPicker from "../custom/emoji-picker";

interface MediaPreviewCardProps {
  mediaFiles: File[];
  setMediaFiles: React.Dispatch<React.SetStateAction<File[]>>;
  caption?: string;
  setCaption: (message: string) => void;
}

const MediaPreviewCard = ({
  mediaFiles,
  setMediaFiles,
  caption: message,
  setCaption,
}: MediaPreviewCardProps) => {
  const [previewIndex, setPreviewIndex] = useState(0);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const filesArray = Array.from(e.target.files);
        setMediaFiles((prev) => {
          const newFiles = filesArray.filter(
            (file) => !prev.some((f) => f.name === file.name)
          );
          return [...prev, ...newFiles];
        });
      }
    },
    [setMediaFiles]
  );

  const openMediaFileSelector = useCallback(() => {
    mediaFileInputRef.current?.click();
  }, []);

  const removeFile = useCallback(
    (index: number) => {
      setMediaFiles((files) => files.filter((_, i) => i !== index));
      if (previewIndex >= mediaFiles.length - 1) {
        setPreviewIndex(mediaFiles.length - 2 >= 0 ? mediaFiles.length - 2 : 0);
      }
    },
    [mediaFiles, previewIndex, setMediaFiles]
  );

  const currentFile = mediaFiles[previewIndex];

  return (
    <div className="border rounded-lg shadow-md absolute backdrop-blur-xl bottom-2 left-2 z-50">
      <input
        type="file"
        ref={mediaFileInputRef}
        style={{ display: "none" }}
        onChange={handleMediaFile}
        accept="image/*,video/*"
        multiple
      />

      <div className="bg-gray-200/70 p-1 flex justify-between items-center">
        <Button variant="ghost" onClick={() => removeFile(previewIndex)}>
          <Trash2 />
        </Button>
      </div>

      <div className="w-[35rem] h-[18rem]">
        {/* Main Preview */}
        {currentFile.type.startsWith("image") ? (
          <img
            src={URL.createObjectURL(currentFile)}
            alt={currentFile.name}
            className="h-full w-full object-contain mx-auto"
          />
        ) : (
          <video
            src={URL.createObjectURL(currentFile)}
            controls
            className="h-full w-full object-contain mx-auto"
          />
        )}
      </div>

      <div className="flex bg-gray-200/90 items-center">
        <EmojiPicker
          onEmojiClick={() => {}}
          containerClassName="bottom-32 left-0"
          buttonClassName="hover:bg-gray-300/80"
        />
        <Textarea
          className="focus-visible:ring-0 focus-visible:ring-offset-0 resize-none py-5 min-h-9 bg-gray-200/90 rounded-none"
          placeholder="Caption (optional)"
          onChange={(e) => setCaption(e.target.value)}
          value={message}
          autoFocus
          rows={1}
        />
      </div>

      {/* Thumbnail selector */}
      <div className="flex space-x-2 p-2 bg-gray-200/70 justify-between items-center">
        <Button
          className="size-11 bg-white/90 border hover:bg-white/80"
          onClick={openMediaFileSelector}
        >
          <Plus color="black" />
        </Button>

        {mediaFiles.length > 1 && (
          <div className="flex space-x-2 overflow-auto">
            {mediaFiles.map((file, idx) => (
              <button
                key={idx}
                className={`relative border rounded hover:opacity-100 transition-opacity ${
                  idx === previewIndex
                    ? "border-green-500 border-b-[3px] opacity-100"
                    : "opacity-50"
                }`}
                onClick={() => setPreviewIndex(idx)}
              >
                {file.type.startsWith("image") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="size-12 object-cover"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(file)}
                    className="h-16 w-16"
                  />
                )}
              </button>
            ))}
          </div>
        )}

        <Button className="bg-green-600 hover:bg-green-500 size-11 relative">
          <SendHorizonal />
          <span className="absolute -bottom-1 -right-1 text-xs bg-white text-black rounded-full px-1">
            {mediaFiles.length}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default MediaPreviewCard;
