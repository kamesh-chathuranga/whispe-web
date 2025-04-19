/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen: Date;
  friends: string[];
}

export interface Person {
  _id: string;
  name: string;
  avatarUrl?: string;
}

export interface SentFriendRequest {
  id: string;
  receiverName: string;
  receiverImageUrl?: string;
}

export interface ReceivedFriendRequest {
  id: string;
  senderName: string;
  senderImageUrl?: string;
}

export interface Chat {
  id: string;
  partnerName: string;
  avatarUrl: string | undefined;
  lastMessage?: Message;
}

export interface Message {
  _id: string;
  sender: { name: string; avatarUrl?: string; _id: string };
  content: string;
  attachments?: any[];
  createdAt: string;
  chat: string;
}
