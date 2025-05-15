/* eslint-disable @typescript-eslint/no-explicit-any */
import socket from "@/lib/socket";
import { useStore } from "@/store";
import { Attachment } from "@/types/types";
import { useCallback } from "react";

const useMessageSend = () => {
  const { currentChat } = useStore();
  const chatId = currentChat?._id;

  const onMessageSend = useCallback(
    (message: string, attachment?: Attachment) => {
      if (!chatId) return;

      socket.emit(
        "message:send",
        { chatId, content: message, attachment },
        (res: any) => {
          if (res.status !== 201) console.log(res.error);
        }
      );
    },
    [chatId]
  );

  return { onMessageSend };
};

export default useMessageSend;
