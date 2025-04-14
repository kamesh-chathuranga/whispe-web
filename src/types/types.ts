export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen: Date;
  friends: string[];
}

export interface BaseResponse {
  message: string;
  status: number | undefined;
}

export interface LoginActionResponse extends BaseResponse {
  data: User | null;
}
