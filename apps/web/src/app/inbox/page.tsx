"use client";

import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import { MessageSquare } from "lucide-react";

export default function InboxEmptyPage() {
  const { setIsSidebarOpen } = useChat();

  return (
    <div className="flex-1 flex items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-10 w-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Select a conversation</h2>
        <p className="text-gray-500 mb-6">
          Choose a chat from the sidebar to view messages or start a new
          conversation.
        </p>
        <Button onClick={() => setIsSidebarOpen(true)} className="md:hidden">
          Open Conversations
        </Button>
      </div>
    </div>
  );
}
