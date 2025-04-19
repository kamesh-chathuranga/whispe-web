import {
  SingleChat,
  ReceivedFriendRequest,
  User,
  Message,
} from "@/types/types";
import { create } from "zustand";

interface Store {
  currentUser: User | null;
  friendRequests: ReceivedFriendRequest[];
  chatList: SingleChat[];
  messages: Message[];
  localStream: MediaStream | null;
  setLocalStream: (stream: MediaStream | null) => void;
  setMessages: (messages: Message[]) => void;
  setChatList: (chatList: SingleChat[]) => void;
  setFriendRequests: (friendRequests: ReceivedFriendRequest[]) => void;
  setCurrentUser: (user: User | null) => void;
}

export const useStore = create<Store>()((set) => ({
  currentUser: null,
  friendRequests: [],
  chatList: [],
  messages: [],
  localStream: null,
  setLocalStream: (stream) => set({ localStream: stream }),
  setMessages: (messages) => set({ messages }),
  setChatList: (chatList) => set({ chatList }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setFriendRequests: (friendRequests) => set({ friendRequests }),
}));
