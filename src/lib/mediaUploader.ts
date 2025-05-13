import API from "@/lib/axios";
import { Attachment, MediaUploadResponse } from "@/types/types";

const mediaUploader = async (files: File[]): Promise<Attachment[]> => {
  try {
    const presignData = await API.post<MediaUploadResponse[]>(
      "/messages/upload",
      files.map((f) => ({ filename: f.name, contentType: f.type }))
    );

    await Promise.all(
      presignData.data.map((p, idx) =>
        API.put(p.url, files[idx], {
          headers: { "Content-Type": files[idx].type },
        })
      )
    );

    return presignData.data.map((p) => ({
      url: p.url.split("?")[0],
      filename: p.filename,
      size: files.find((f) => f.name === p.filename)!.size,
      mimeType: files.find((f) => f.name === p.filename)!.type,
      type: files
        .find((f) => f.name === p.filename)!
        .type.split("/")[0] as Attachment["type"],
    }));
  } catch (error) {
    console.log("Error uploading media files:", error);
    return [];
  }
};

export default mediaUploader;
