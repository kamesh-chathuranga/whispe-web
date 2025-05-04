/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import FriendRequestCard from "./friend-request-card";
import { ScrollArea } from "../ui/scroll-area";
import { ReceivedFriendRequest } from "@/types/types";
import API from "@/lib/axios";
import { useStore } from "@/store";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

const FriendRequestCardContainer = () => {
  const { friendRequests, setFriendRequests } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await API.get("/friend-request/received");
        const requests: ReceivedFriendRequest[] = response.data.map(
          (request: any) => ({
            id: request._id,
            senderName: request.sender.name,
            senderImageUrl: request.sender?.avatarUrl,
          })
        );
        setFriendRequests(requests);
      } catch (error) {
        console.error("Error fetching people:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [setFriendRequests]);

  const handleFriendRequestAccept = async (requestId: string) => {
    try {
      const response = await API.post(`/friend-request/${requestId}/accept`);
      const updatedRequests = friendRequests.filter(
        (request) => request.id !== requestId
      );
      setFriendRequests(updatedRequests);
      toast.success(response.data.message);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error(
          "An error occurred while accepting the friend request. Please try again."
        );
      }
    }
  };

  const handleFriendRequestDelete = async (requestId: string) => {
    try {
      const response = await API.delete(`/friend-request/${requestId}/cancel`);
      const updatedRequests = friendRequests.filter(
        (request) => request.id !== requestId
      );
      setFriendRequests(updatedRequests);
      toast.success(response.data.message);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error(
          "An error occurred while deleting the friend request. Please try again."
        );
      }
    }
  };

  const content = isLoading ? (
    <p>Loading...</p>
  ) : (
    <div className="flex flex-wrap gap-4 h-full ">
      {friendRequests.map((request) => (
        <FriendRequestCard
          key={request.id}
          id={request.id}
          name={request.senderName}
          imageUrl={request.senderImageUrl}
          onAccept={handleFriendRequestAccept}
          onDelete={handleFriendRequestDelete}
        />
      ))}
    </div>
  );

  return <ScrollArea className="h-full pb-14 pt-4">{content}</ScrollArea>;
};

export default FriendRequestCardContainer;
