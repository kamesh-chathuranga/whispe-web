// lib/socket.ts
import { io } from "socket.io-client";
import API from "./axios";
import { DEFAULT_SIGNOUT_REDIRECT } from "@/routes";

const socket = io(process.env.NEXT_PUBLIC_API_BASE_HOST!, {
  transports: ["websocket"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

socket.on("connect_error", async (err) => {
  console.log("Socket auth error:", err.message);
  if (err.message === "AUTHENTICATION_ERROR") {
    try {
      await API.post("/auth/refresh");
      socket.connect();
    } catch {
      console.log("Refresh failed, redirecting to login");
      if (typeof window !== "undefined") {
        window.location.href = DEFAULT_SIGNOUT_REDIRECT;
      }
    }
  }
});

export default socket;
