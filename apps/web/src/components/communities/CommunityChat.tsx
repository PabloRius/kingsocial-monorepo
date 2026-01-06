"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/UserAvatar";
import { useChat } from "@/context/ChatContext";
import { useProfile } from "@/context/ProfileContext";
import { formatChatTimestamp, getColorFromId } from "@/lib/formatters";
import { sendMessageToCommunity } from "@/services/chat";
import { updateCommunityMemberSettings } from "@/services/communities";
import { CommunityMember, CommunityMessage } from "@repo/shared-types";
import { Bell, BellOff, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface CommunityChatProps {
  initialMessages: CommunityMessage[];
  communityId: string;
  member: CommunityMember;
}

export const CommunityChat = ({
  initialMessages,
  communityId,
  member,
}: CommunityChatProps) => {
  const { socket } = useChat();
  const { profile } = useProfile();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [chatAlerts, setChatAlerts] = useState(member.chatAlerts);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket Listener
  useEffect(() => {
    if (!socket) return;

    // Join the community room
    socket.emit("join_community", communityId);

    const handleNewMessage = (msg: CommunityMessage) => {
      if (msg.communityId === communityId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on("community_message", handleNewMessage);
    return () => {
      socket.off("community_message", handleNewMessage);
      socket.emit("leave_community", communityId);
    };
  }, [socket, communityId]);

  const handleSend = async () => {
    if (!input.trim() || !member.id) return;
    const content = input;
    setInput(""); // Optimistic UI

    try {
      await sendMessageToCommunity({
        content,
        communityId,
        memberId: member.id,
      });
      // The socket listener handles adding the message to state
    } catch (error) {
      console.error("Failed to send", error);
    }
  };

  if (!profile) return;

  const toggleMute = async () => {
    if (!member.id || isToggling) return;
    setIsToggling(true);
    const newStatus = !chatAlerts;

    try {
      // Optimistic update
      setChatAlerts(newStatus);
      await updateCommunityMemberSettings(communityId, {
        chatAlerts: newStatus,
      });
      toast.success(newStatus ? "Notifications enabled" : "Community muted");
    } catch (error) {
      console.error(error);
      setChatAlerts(!newStatus); // Rollback
      toast.error("Failed to update settings");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card className="flex flex-col h-150 border-none shadow-xl rounded-3xl overflow-hidden bg-white pb-0">
      <div className="px-6 py-3 border-b bg-slate-50 flex justify-between items-center">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Community Chat
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className={`rounded-xl transition-colors ${
            chatAlerts
              ? "text-slate-400 hover:bg-slate-100"
              : "text-amber-600 hover:bg-amber-50"
          }`}
        >
          {chatAlerts ? (
            <Bell className="w-4 h-4 mr-2" />
          ) : (
            <BellOff className="w-4 h-4 mr-2" />
          )}
          <span className="text-xs font-medium">
            {chatAlerts ? "Mute" : "Muted"}
          </span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isMe = msg.sender?.userId === profile?.id;
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
            >
              <UserAvatar
                avatarUrl={msg.sender?.user.image || undefined}
                name={msg.sender?.user.name || "User"}
              />
              <div
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-bold"
                    style={{ color: getColorFromId(msg.senderId || "1") }}
                  >
                    {msg.sender?.user.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatChatTimestamp(msg.createdAt)}
                  </span>
                </div>
                <div
                  className={`px-4 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-100 text-slate-800 rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>
      <div className="p-4 bg-slate-50 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message the community..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="rounded-xl border-none bg-white shadow-inner"
        />
        <Button
          onClick={handleSend}
          className="rounded-xl bg-blue-600 hover:bg-blue-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
