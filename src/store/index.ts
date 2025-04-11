import { User } from "@/types/types";
import React from "react";
import { Socket } from "socket.io-client";
import { create } from "zustand";

interface Store {
  currentUser: User | null;
  socket: React.RefObject<Socket | null>;
  setCurrentUser: (user: User | null) => void;
  setSocket: (socket: React.RefObject<Socket | null>) => void;
}

export const useStore = create<Store>()((set) => ({
  currentUser: null,
  socket: React.createRef<Socket | null>(),
  setCurrentUser: (user) => set({ currentUser: user }),
  setSocket: (socket) => set({ socket }),
}));
