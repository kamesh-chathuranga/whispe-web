import socket from "@/lib/socket";
import { Attachment, Message } from "@/types/types";

interface SendMessageResponse {
  status: number;
  data?: Message;
  error?: string;
}

export const onMessageSend = (
  chatId: string,
  message: string,
  tempId: string,
  attachment?: Attachment
) => {
  if (!chatId || !tempId) return;

  socket.emit(
    "message:send",
    { chatId, content: message, tempId, attachment },
    (res: SendMessageResponse) => {
      if (res.status === 201 && res.data) {
        socket.emit("message:sent", { messageId: res.data._id });
      } else {
        console.log(res.error);
        // socket.emit("message:failed", { messageId: res.data._id });
      }
    }
  );
};
