// lib/socket.ts
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_BASE_HOST!, {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
