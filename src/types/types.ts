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
  lastMessage: string;
}
