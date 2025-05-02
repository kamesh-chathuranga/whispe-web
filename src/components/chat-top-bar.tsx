"use client";

import React  from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ListFilter, MessageSquare } from "lucide-react";

const ChatTopBar = () => {
  // const {
  //   setContactList,
  //   contactList,
  //   setCurrentChat,
  //   currentUser,
  //   currentChat,
  //   setMessages,
  // } = useStore();

  // useEffect(() => {
  //   const getContactList = async () => {
  //     const users = await getAllUsers();
  //     const filteredUsers: User[] = users.filter(
  //       (user) => user.id !== currentUser?.id
  //     );
  //     setContactList(filteredUsers);
  //   };

  //   getContactList();
  // }, [setContactList, currentUser]);

  // useEffect(() => {
  //   const getAllUserMessages = async () => {
  //     try {
  //       const { data: messages } = await axios.get(
  //         `http://localhost:7000/api/message/all/${currentUser?.id}/${currentChat?.id}`
  //       );

  //       console.log(messages);
  //       setMessages(messages);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   if (currentChat?.id && currentUser?.id) {
  //     getAllUserMessages();
  //   }
  // }, [currentChat, currentUser, setMessages]);

  return (
    <div className="flex items-center justify-between w-full">
      <h1 className="text-3xl font-bold">Chatter</h1>
      <div className="flex items-center ">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <MessageSquare size={22} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuLabel className="text-2xl">New Chat</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* {contactList.map((contact) => {
              return (
                <DropdownMenuItem
                  key={contact.id}
                  onClick={() => setCurrentChat(contact)}
                >
                  {contact.name}
                </DropdownMenuItem>
              );
            })} */}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost">
          <ListFilter size={22} />
        </Button>
      </div>
    </div>
  );
};

export default ChatTopBar;
