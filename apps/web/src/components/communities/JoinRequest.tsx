"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { formatDate } from "@/lib/formatters";
import { Check, MessageSquareQuote, X } from "lucide-react";

interface JoinRequestProps {
  id: string;
  user: { name?: string | null; image?: string | null };
  message?: string | null;
  createdAt: Date;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
}

export const JoinRequest = ({
  id,
  user,
  message,
  createdAt,
  onApprove,
  onDecline,
}: JoinRequestProps) => {
  return (
    <Card className="p-4 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <UserAvatar
            avatarUrl={user.image || undefined}
            name={user.name || undefined}
          />
          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 leading-none">
              {user.name}
            </h4>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              Requested {formatDate(createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:bg-red-50 h-8 w-8 p-0 rounded-full"
            onClick={() => onDecline(id)}
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 h-8 w-8 p-0 rounded-full shadow-sm"
            onClick={() => onApprove(id)}
          >
            <Check className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {message && (
        <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100 relative">
          <MessageSquareQuote className="absolute -top-2 -left-1 w-4 h-4 text-blue-200" />
          <p className="text-sm text-slate-600 italic pl-2 leading-relaxed">
            {`"${message}"`}
          </p>
        </div>
      )}
    </Card>
  );
};
