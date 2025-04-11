export interface ServerActionResponse {
  status: number;
  success: boolean;
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen: Date;
  friends: string[];
}
