import API from "@/lib/axios";
import { Attachment, MediaUploadResponse } from "@/types/types";

const mediaUploader = async (
  files: File[],
  chatId: string
): Promise<Attachment[]> => {
  try {
    const presignData = await API.post<MediaUploadResponse[]>(
      `/chats/${chatId}/media/upload`,
      files.map((f) => ({ filename: f.name, mimeType: f.type, size: f.size }))
    );

    await Promise.all(
      presignData.data.map((sign, idx) =>
        API.put(sign.url, files[idx], {
          headers: { "Content-Type": files[idx].type },
        })
      )
    );

    return presignData.data.map((p) => ({
      objectKey: p.objectKey,
      filename: p.filename,
      size: p.size,
      mimeType: p.mimeType,
      type: p.type,
    }));
  } catch (error) {
    console.log("Error uploading media files:", error);
    return [];
  }
};

export default mediaUploader;
