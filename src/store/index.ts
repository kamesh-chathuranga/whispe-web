import { Chat, ReceivedFriendRequest, User } from "@/types/types";
import { create } from "zustand";

interface Store {
  currentUser: User | null;
  friendRequests: ReceivedFriendRequest[];
  chatList: Chat[];
  setChatList: (chatList: Chat[]) => void;
  setFriendRequests: (friendRequests: ReceivedFriendRequest[]) => void;
  setCurrentUser: (user: User | null) => void;
}

export const useStore = create<Store>()((set) => ({
  currentUser: null,
  friendRequests: [],
  chatList: [],
  setChatList: (chatList) => set({ chatList }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setFriendRequests: (friendRequests) => set({ friendRequests }),
}));
