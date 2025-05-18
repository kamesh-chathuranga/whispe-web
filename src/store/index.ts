import {
  SingleChat,
  ReceivedFriendRequest,
  User,
  IncomingCall,
  PeerData,
  FriendStatus,
} from "@/types/types";
import { create } from "zustand";

interface Store {
  currentUser: User | null;
  friendRequests: ReceivedFriendRequest[];
  chatList: SingleChat[];
  localStream: MediaStream | null;
  currentChat: SingleChat | null;
  incomingCall: IncomingCall | null;
  peer: PeerData | null;
  isCallEnded: boolean;
  friendStatuses: FriendStatus[];
  mediaFiles: File[];

  setMediaFiles: (files: File[]) => void;
  setIncomingCall: (incomingCall: IncomingCall | null) => void;
  setCurrentChat: (chat: SingleChat | null) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setChatList: (chatList: SingleChat[]) => void;
  setFriendRequests: (friendRequests: ReceivedFriendRequest[]) => void;
  setCurrentUser: (user: User | null) => void;
  setIsCallEnded: (isCallEnded: boolean) => void;
  setFriendStatuses: (friendStatuses: FriendStatus[]) => void;

  setPeer: (
    peer: PeerData | null | ((prevPeer: PeerData | null) => PeerData | null)
  ) => void;
}

export const useStore = create<Store>()((set) => ({
  currentUser: null,
  friendRequests: [],
  chatList: [],
  localStream: null,
  currentChat: null,
  incomingCall: null,
  peer: null,
  isCallEnded: false,
  friendStatuses: [],
  mediaFiles: [],

  setIncomingCall: (incomingCall) => set({ incomingCall }),
  setCurrentChat: (chat) => set({ currentChat: chat }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setChatList: (chatList) => set({ chatList }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setFriendRequests: (friendRequests) => set({ friendRequests }),
  setIsCallEnded: (isCallEnded) => set({ isCallEnded }),
  setFriendStatuses: (friendStatuses) => set({ friendStatuses }),
  setMediaFiles: (files) => set({ mediaFiles: files }),

  setPeer: (peer) =>
    set((state) => ({
      peer: typeof peer === "function" ? peer(state.peer) : peer,
    })),
}));
