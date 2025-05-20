import API from "@/lib/axios";
import { Attachment, MediaUploadResponse } from "@/types/types";
import { AxiosProgressEvent } from "axios";

const mediaUploader = async (
  file: File,
  chatId: string,
  onUploadProgress: (progressEvent: AxiosProgressEvent) => void
): Promise<Attachment | undefined> => {
  try {
    const {
      data: { filename, mimeType, objectKey, size, type, url },
    } = await API.post<MediaUploadResponse>(`/chats/${chatId}/media/upload`, {
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    });

    await API.put(url, file, {
      headers: { "Content-Type": type },
      onUploadProgress,
    });

    return {
      objectKey,
      filename,
      size,
      mimeType,
      type,
    };
  } catch (error) {
    console.log("Error uploading media files:", error);
    return undefined;
  }
};

export default mediaUploader;
