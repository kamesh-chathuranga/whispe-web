/* eslint-disable @typescript-eslint/no-explicit-any */
import socket from "@/lib/socket";
import { Attachment } from "@/types/types";

export const onMessageSend = (
  chatId: string,
  message: string,
  attachment?: Attachment
) => {
  if (!chatId || !message) return;

  socket.emit(
    "message:send",
    { chatId, content: message, attachment },
    (res: any) => {
      if (res.status === 201 && res.data) {
        socket.emit("message:sent", { messageId: res.data._id });
      } else {
        console.log(res.error);
        socket.emit("message:failed", { messageId: res.data._id });
      }
    }
  );
};
