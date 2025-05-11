import React, { useCallback, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Camera, File, ImageIcon, Paperclip } from "lucide-react";

const AttachmentDropdown = () => {
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const documentFileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        console.log("Selected files:", e.target.files);
      }
    },
    []
  );

  const handleDocumentFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        console.log("Selected files:", e.target.files);
      }
    },
    []
  );

  const openMediaFileSelector = useCallback(() => {
    if (mediaFileInputRef.current) {
      mediaFileInputRef.current.click();
    }
  }, []);

  const openDocumentFileSelector = useCallback(() => {
    if (documentFileInputRef.current) {
      documentFileInputRef.current.click();
    }
  }, []);

  return (
    <>
      <input
        type="file"
        ref={mediaFileInputRef}
        style={{ display: "none" }}
        onChange={handleMediaFile}
        accept="image/*,video/*"
      />
      <input
        type="file"
        ref={documentFileInputRef}
        style={{ display: "none" }}
        onChange={handleDocumentFile}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <Paperclip />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44">
          <DropdownMenuItem onClick={openMediaFileSelector}>
            <ImageIcon />
            <span>Photos & Videos</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Camera />
            <span>Camera</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openDocumentFileSelector}>
            <File />
            <span>Document</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default AttachmentDropdown;
