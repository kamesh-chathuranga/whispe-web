import API from "@/lib/axios";
import { Attachment, MediaUploadResponse } from "@/types/types";

const mediaUploader = async (
  file: File,
  chatId: string
): Promise<Attachment | undefined> => {
  try {
    const {
      data: { filename, mimeType, objectKey, size, type, url },
    } = await API.post<MediaUploadResponse>(`/chats/${chatId}/media/upload`, {
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    });

    API.put(url, file, {
      headers: { "Content-Type": type },
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
  }
};

export default mediaUploader;
