"use client";

import { getChats } from "@/services/chat";
import { ChatDTO, MessageDTO } from "@repo/shared-types";
import { Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useProfile } from "./ProfileContext";

interface ChatContextType {
  chats: ChatDTO[] | undefined | null;
  setChats: React.Dispatch<React.SetStateAction<ChatDTO[] | undefined | null>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  socket: Socket | null;
  onlineUsers: string[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const params = useParams();
  const currentPathIdRef = useRef<string | null>(null);
  useEffect(() => {
    currentPathIdRef.current = (params?.id as string) || null;
  }, [params?.id]);
  const [chats, setChats] = useState<ChatDTO[] | undefined | null>(undefined);
  const { profile } = useProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const currentCommunityRef = useRef<string | null>(null);

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    currentCommunityRef.current = (params?.communityId as string) || null;
  }, [params?.communityId]);

  useEffect(() => {
    if (!session?.sessionToken || socketRef.current) return;

    const init = async () => {
      try {
        const result = await getChats();
        setChats(result.data);
      } catch (error) {
        console.error(error);
        setChats(null);
      }
    };

    init();

    const s = io(process.env.NEXT_PUBLIC_CHAT_URL, {
      auth: { token: session.sessionToken },
      transports: ["websocket"],
    });

    socketRef.current = s;

    const timeoutId = setTimeout(() => {
      setSocket(s);
    }, 0);

    s.on("receive_message", (newMessage: MessageDTO) => {
      console.log("MEsagge received");
      setChats((prev) => {
        if (!prev) return prev;
        const chatIndex = prev.findIndex((c) => c.id === newMessage.chatId);
        if (chatIndex === -1) {
          getChats().then((result) => setChats(result.data));
          return prev;
        }

        const targetChat = prev[chatIndex];

        const messageExists = targetChat.messages.some(
          (m) => m.id === newMessage.id
        );
        if (messageExists) return prev;

        const isFromMe = newMessage.senderId === session.user.id;
        const isLookingAtChat = currentPathIdRef.current === newMessage.chatId;

        if (!isFromMe && !isLookingAtChat) {
          console.log("Should toast");
          toast.info("New message", {
            description: newMessage.content,
            action: {
              label: "View",
              onClick: () =>
                (window.location.href = `/inbox/${newMessage.chatId}`),
            },
          });
        }

        return prev
          ?.map((chat) =>
            chat.id === newMessage.chatId
              ? { ...chat, messages: [...chat.messages, newMessage] }
              : chat
          )
          .sort((a, b) => {
            const dateA = new Date(a.messages.at(-1)?.createdAt || 0);
            const dateB = new Date(b.messages.at(-1)?.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
          });
      });
    });

    s.on(
      "community_notification",
      (data: {
        communityName: string;
        communityId: string;
        content: string;
        senderName: string;
      }) => {
        const isLookingAtCommunity =
          currentCommunityRef.current === data.communityId;

        if (!isLookingAtCommunity) {
          toast.info(`New in ${data.communityName}`, {
            description: `${data.senderName}: ${data.content}`,
            icon: <Users className="h-4 w-4 text-purple-500" />,
            action: {
              label: "Open",
              onClick: () =>
                (window.location.href = `/communities/${data.communityId}`),
            },
          });
        }
      }
    );

    return () => {
      clearTimeout(timeoutId);
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [session]);

  useEffect(() => {
    if (!socket) return;

    socket.on("user_status_changed", ({ userId, status }) => {
      if (!profile?.settings?.showOnlineStatus) {
        setOnlineUsers([]);
        return;
      }

      setOnlineUsers((prev) => {
        if (status === "online") return [...new Set([...prev, userId])];
        return prev.filter((id) => id !== userId);
      });
    });

    return () => {
      socket.off("user_status_changed");
    };
  }, [socket, profile]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        isSidebarOpen,
        setIsSidebarOpen,
        socket,
        onlineUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};
