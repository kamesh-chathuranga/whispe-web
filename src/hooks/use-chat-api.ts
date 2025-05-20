import { AxiosError } from "axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Message } from "@/types/types";
import API from "@/lib/axios";

const PAGE_SIZE = 20;

export interface MessagesResponse {
  messages: Message[];
  nextCursor: string | null;
}

async function fetchChatMessages({
  queryKey,
  pageParam,
}: {
  queryKey: [string, string | undefined];
  pageParam?: string;
}) {
  const [, chatId] = queryKey;
  if (!chatId) {
    return { messages: [], nextCursor: null };
  }

  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    ...(pageParam ? { before: pageParam } : {}),
  });

  try {
    const { data } = await API.get<MessagesResponse>(
      `/chats/${chatId}/messages?${params.toString()}`
    );
    return data;
  } catch (err) {
    if (err instanceof AxiosError) {
      throw new Error(err.response?.data.message ?? "Failed to fetch messages");
    }
    throw new Error("Unknown error fetching messages");
  }
}

export function useGetUserChatMessages(chatId?: string) {
  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["messages", chatId] as [string, string | undefined],
    queryFn: fetchChatMessages,
    getNextPageParam: (lastPage: MessagesResponse) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!chatId,
  });

  const messages = data?.pages
    ? data.pages
        .slice()
        .reverse()
        .flatMap((p: MessagesResponse) => p.messages)
    : [];

  return {
    messages,
    isLoading: isLoading,
    error: error,
    fetchNextPage: fetchNextPage,
    hasNextPage: hasNextPage,
    isFetchingNextPage: isFetchingNextPage,
  };
}

interface AttachmentResponse {
  url: string;
}

async function fetchAttachmentUrl(chatId: string, messageId: string) {
  if (!chatId || !messageId) {
    throw new Error("Chat ID and Message ID are required");
  }

  try {
    const { data } = await API.get<AttachmentResponse>(
      `/chats/${chatId}/${messageId}/media/view`
    );
    return data;
  } catch (err) {
    if (err instanceof AxiosError) {
      throw new Error(
        err.response?.data.message ?? "Failed to fetch attachment URL"
      );
    }
    throw new Error("Unknown error fetching attachment URL");
  }
}

export function useAttachmentUrl(message: Message) {
  const { chat: chatId, _id: messageId, attachment } = message;
  const hasPredefinedUrl = !!attachment?.url;

  const query = useQuery({
    queryKey: ["attachmentUrl", chatId, messageId],
    queryFn: () => {
      if (!chatId || !messageId) {
        return Promise.resolve(undefined);
      }
      return fetchAttachmentUrl(chatId, messageId);
    },

    enabled: !hasPredefinedUrl && !!chatId && !!messageId,
    retry: false,
  });

  return {
    attachmentUrl: hasPredefinedUrl ? attachment!.url : query.data?.url,
    isLoading: query.isLoading && !hasPredefinedUrl,
    error: query.error,
    fetchAttachmentUrl: query.refetch,
  };
}
