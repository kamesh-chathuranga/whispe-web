/* eslint-disable @next/next/no-img-element */
import { Plus, SendHorizonal, Trash2 } from "lucide-react";
import React, { useCallback, useRef, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import EmojiPicker from "../custom/emoji-picker"; // Assuming this component exists
import { onMessageSend } from "@/lib/sendMessage"; // Assuming this hook exists
import mediaUploader from "@/lib/mediaUploader"; // Assuming this function exists
import { useStore } from "@/store"; // Assuming this store exists
import { v4 as uuidv4 } from "uuid"; // Import uuid for generating unique IDs

// Define the interface for a single media item in the state
interface MediaItem {
  id: string; // Unique ID for reliable state management and list keys
  file: File;
  caption: string;
  objectUrl: string; // Store the object URL directly with the item
}

interface MediaPreviewCardProps {
  caption?: string; // Optional caption prop for initial state
  mediaFiles: File[]; // Keep this prop to receive initial files
  // setMediaFiles: (files: File[]) => void; // Keep this prop to update parent state if necessary, though refactored state is internal now
  onClose: () => void; // Callback to close the preview card
}

const MediaPreviewCard = ({
  caption: initialCaption, // Default to empty string if not provided
  mediaFiles: initialMediaFiles, // Rename prop for clarity
  // setMediaFiles, // Still accepting but won't directly manage parent state of File[]
  onClose,
}: MediaPreviewCardProps) => {
  const { currentChat } = useStore(); // Assuming currentChat has _id

  // Use a single state to manage media items including files, captions, and object URLs
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  // Effect to initialize mediaItems when initialMediaFiles prop changes
  // and to clean up object URLs on unmount or prop change
  useEffect(() => {
    const initialItems: MediaItem[] = initialMediaFiles.map((file, i) => ({
      id: uuidv4(), // Generate unique ID for each initial file
      file,
      caption: i === 0 ? initialCaption || "" : "", // Initialize with empty caption
      objectUrl: URL.createObjectURL(file), // Create object URL for preview
    }));

    setMediaItems(initialItems);
    setPreviewIndex(0); // Reset preview index when initial files change

    // Cleanup function to revoke object URLs
    return () => {
      initialItems.forEach((item) => URL.revokeObjectURL(item.objectUrl));
      // Note: More granular cleanup for items added/removed after initial mount
      // is handled in removeFile and sendMessageWithAttachments
    };
  }, [initialCaption, initialMediaFiles]); // Rerun effect if the initial files array reference changes

  const sendMessageWithAttachments = useCallback(async () => {
    if (!mediaItems.length || !currentChat) return;

    // Extract files and captions from the mediaItems state
    const filesToSend = mediaItems.map((item) => item.file);
    const captionsToSend = mediaItems.map((item) => item.caption);

    // Clear media items state and revoke object URLs before uploading
    // This provides immediate visual feedback that sending is in progress/done
    const itemsToRevoke = [...mediaItems]; // Copy for revocation after state clear
    setMediaItems([]);
    setPreviewIndex(0);
    // setMediaFiles([]); // Update parent state to clear files if needed
    onClose(); // Close the preview card

    // Revoke object URLs immediately after clearing state
    itemsToRevoke.forEach((item) => URL.revokeObjectURL(item.objectUrl));

    try {
      const attachments = await mediaUploader(filesToSend, currentChat?._id);

      // Send each message with its corresponding caption and attachment
      attachments.forEach((attachment, index) => {
        onMessageSend(currentChat._id, captionsToSend[index] || "", attachment);
      });
    } catch (error) {
      console.log("Error uploading or sending message:", error);
      // Handle errors, potentially by showing a message to the user
    }
  }, [mediaItems, currentChat, setMediaItems, onClose]); // Add dependencies

  const handleMediaFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const filesArray = Array.from(e.target.files);

        // Filter out files that are already in the mediaItems state (basic check by name)
        const newFiles = filesArray.filter(
          (file) => !mediaItems.some((item) => item.file.name === file.name)
        );

        const newMediaItems: MediaItem[] = newFiles.map((file) => ({
          id: uuidv4(), // Generate unique ID for new files
          file,
          caption: "", // Initialize new files with empty captions
          objectUrl: URL.createObjectURL(file), // Create object URL
        }));

        // Add new items to the existing mediaItems state
        setMediaItems((prevItems) => [...prevItems, ...newMediaItems]);
        // Optionally update parent state if needed, but internal state is source of truth here
        // setMediaFiles(prevFiles => [...prevFiles, ...newFiles]);
      }
    },
    [mediaItems] // Dependency on mediaItems to check for duplicates
  );

  const openMediaFileSelector = useCallback(() => {
    mediaFileInputRef.current?.click();
  }, []);

  const removeFile = useCallback(
    (id: string) => {
      // Find the item to be removed to revoke its object URL
      const itemToRemove = mediaItems.find((item) => item.id === id);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.objectUrl); // Revoke the object URL
      }

      // Filter out the item with the given ID
      const updatedItems = mediaItems.filter((item) => item.id !== id);
      setMediaItems(updatedItems);

      // Adjust preview index if the removed item was currently previewed
      if (previewIndex >= updatedItems.length) {
        setPreviewIndex(updatedItems.length > 0 ? updatedItems.length - 1 : 0);
      }
      // If no files are left, trigger the onClose callback
      if (updatedItems.length === 0) {
        onClose();
      }

      // Optionally update parent state
      // setMediaFiles(updatedItems.map(item => item.file));
    },
    [mediaItems, previewIndex, onClose] // Dependencies
  );

  const handleCaptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newCaption = e.target.value;
      // Update the caption for the currently previewed item
      setMediaItems((prevItems) =>
        prevItems.map((item, idx) =>
          idx === previewIndex ? { ...item, caption: newCaption } : item
        )
      );
    },
    [previewIndex] // Dependency on previewIndex to update the correct item
  );

  const handleEmojiClick = useCallback(
    (emoji: string) => {
      // Append the emoji to the caption of the currently previewed item
      setMediaItems((prevItems) =>
        prevItems.map((item, idx) =>
          idx === previewIndex
            ? { ...item, caption: (item.caption || "") + emoji }
            : item
        )
      );
    },
    [previewIndex] // Dependency on previewIndex
  );

  // If there are no media items, don't render the preview card
  if (mediaItems.length === 0) {
    return null;
  }

  // Get the current item to preview
  const currentMediaItem = mediaItems[previewIndex];

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

      <div className="bg-gray-200/50 p-1 flex justify-between items-center">
        {/* Use the unique ID to remove the current file */}
        <Button variant="ghost" onClick={() => removeFile(currentMediaItem.id)}>
          <Trash2 />
        </Button>
      </div>

      <div className="w-[35rem] h-[18rem]">
        {/* Main Preview - Use the objectUrl from the state */}
        {currentMediaItem.file.type.startsWith("image") ? (
          <img
            src={currentMediaItem.objectUrl}
            alt={currentMediaItem.file.name}
            className="h-full w-full object-contain mx-auto"
          />
        ) : (
          <video
            src={currentMediaItem.objectUrl}
            controls
            className="h-full w-full object-contain mx-auto"
          />
        )}
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
          value={currentMediaItem.caption || ""} // Use caption from the current item
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

        {mediaItems.length > 0 && (
          <div className="flex space-x-2 overflow-auto">
            {mediaItems.map((item, idx) => (
              <button
                key={item.id} // Use unique ID as the key for list rendering
                className={`relative rounded hover:opacity-100 border-b-[3px] transition-opacity ${
                  idx === previewIndex
                    ? "border-green-500 opacity-100"
                    : "opacity-50 border-b-transparent"
                }`}
                onClick={() => setPreviewIndex(idx)}
              >
                {item.file.type.startsWith("image") ? (
                  <img
                    src={item.objectUrl} // Use objectUrl for thumbnail preview
                    alt={item.file.name}
                    className="size-12 object-cover"
                  />
                ) : (
                  <video src={item.objectUrl} className="size-12" /> // Use objectUrl for video thumbnail
                )}
              </button>
            ))}
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
