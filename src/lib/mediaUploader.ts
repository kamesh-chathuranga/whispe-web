import API from "@/lib/axios";
import { MediaUploadResponse } from "@/types/types";

const mediaUploader = async (
  files: File[]
): Promise<
  {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    key: string;
  }[]
> => {
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
    key: p.key,
  }));
};

export default mediaUploader;
