// hooks/useChatMessages.ts
import { AxiosError } from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import API from "@/lib/axios";
import { Message } from "@/types/types";

const PAGE_SIZE = 20;

// 1) Define the shape your API now returns:
export interface MessagesResponse {
  messages: Message[];
  nextCursor: string | null;
}

// 2) Keep the fetcher separate
export async function fetchChatMessages({ 
  queryKey,
  pageParam 
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

// 3) The hook
export function useGetUserChatMessages(chatId?: string) {
  const result = useInfiniteQuery({
    queryKey: ["messages", chatId] as [string, string | undefined],
    queryFn: fetchChatMessages,
    getNextPageParam: (lastPage: MessagesResponse) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!chatId,
    refetchOnWindowFocus: false
  });
  // 4) Turn pages of {messages,nextCursor} into one flat, chronological list:
  const messages = result.data?.pages
    ? result.data.pages
        .slice()
        .reverse()
        .flatMap((p: MessagesResponse) => p.messages)
    : [];
  return {
    messages,
    isLoading: result.isLoading,
    error: result.error,
    fetchNextPage: result.fetchNextPage,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: result.isFetchingNextPage,
  };
}
