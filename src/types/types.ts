/* eslint-disable @typescript-eslint/no-explicit-any */

import Peer from "simple-peer";

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

export interface SingleChat {
  _id: string;
  partner: Person;
  lastMessage?: Message;
}

export interface Message {
  _id: string;
  sender: Person;
  content: string;
  attachments?: any[];
  createdAt: string;
  chat: string;
}

export interface IncomingCall {
  caller: Person;
  receiver: Person;
  isRinging: boolean;
}

export interface PeerData {
  peerConnection: Peer.Instance;
  stream: MediaStream | null;
  partner: Person;
}

export interface FriendStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}
