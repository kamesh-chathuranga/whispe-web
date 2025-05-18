import { useCallback } from "react";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { MessagesResponse } from "./use-chat-api";
import { Message } from "@/types/types";

const useMessageMutation = () => {
  const queryClient = useQueryClient();

  const addNewMessage = useCallback(
    (message: Message) => {
      if (!message) return;

      queryClient.setQueryData(
        ["messages", message.chat],
        (oldData: InfiniteData<MessagesResponse> | undefined) => {
          if (!oldData) return undefined;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages: [...page.messages, message],
            })),
          };
        }
      );
    },
    [queryClient]
  );

  const updateMessage = useCallback(
    (tempId: string, message: Message) => {
      if (!tempId || !message) return;

      queryClient.setQueryData(
        ["messages", message.chat],
        (oldData: InfiniteData<MessagesResponse> | undefined) => {
          if (!oldData) return undefined;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages: page.messages.map((msg) =>
                msg._id === tempId ? message : msg
              ),
            })),
          };
        }
      );
    },
    [queryClient]
  );

  return { addNewMessage, updateMessage };
};

export default useMessageMutation;
