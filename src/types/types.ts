import { CallType } from "@/hooks/use-media-call";
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

export interface Attachment {
  url?: string;
  objectKey: string;
  type: "image" | "audio" | "video" | "file";
  filename: string;
  size: number;
  mimeType: string;
  duration?: number;
  uploadProgress?: number;
}

export interface Message {
  _id: string;
  sender: Person;
  content: string;
  attachment?: Attachment;
  createdAt: string;
  chat: string;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  isDeleted?: boolean;
}

export interface IncomingCall {
  caller: Person;
  receiver: Person;
  isRinging: boolean;
  callType: CallType;
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

export interface MediaUploadResponse {
  filename: string;
  url: string;
  objectKey: string;
  mimeType: string;
  size: number;
  type: Attachment["type"];
}
