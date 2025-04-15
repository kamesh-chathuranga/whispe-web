"use client";

import { useEffect } from "react";
import { useStore } from "@/store";
import API from "@/lib/axios";
import { User } from "@/types/types";

const SyncUserStore = () => {
  const { setCurrentUser } = useStore();

  useEffect(() => {
    (async () => {
      try {
        const response = await API.get("/users/me");

        if (response.status == 200 && response.data) {
          const user: User = {
            id: response.data._id,
            name: response.data.name,
            avatarUrl: response.data.avatarUrl,
            email: response.data.email,
            friends: response.data.friends,
            isOnline: response.data.isOnline,
            lastSeen: response.data.lastSeen,
          };

          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    })();
  }, [setCurrentUser]);

  return null;
};

export default SyncUserStore;
