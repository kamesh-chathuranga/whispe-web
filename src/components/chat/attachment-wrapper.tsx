import React, { useState } from "react";
import AttachmentDropdown from "./attachment-dropdown";
import MediaPreviewCard from "./media-preview-card";

interface AttachmentWrapperProps {
  message?: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}

const AttachmentWrapper = ({ message, setMessage }: AttachmentWrapperProps) => {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  return (
    <>
      <AttachmentDropdown setMediaFiles={setMediaFiles} />
      {mediaFiles.length > 0 && (
        <MediaPreviewCard
          caption={message}
          setCaption={setMessage}
          mediaFiles={mediaFiles}
          setMediaFiles={setMediaFiles}
        />
      )}
    </>
  );
};

export default AttachmentWrapper;
