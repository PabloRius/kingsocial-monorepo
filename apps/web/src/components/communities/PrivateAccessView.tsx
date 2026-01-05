"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CommunityDTO } from "@repo/shared-types";
import { Clock, Lock } from "lucide-react";
import { useState } from "react";
import { Textarea } from "../ui/textarea";

export const PrivateAccessView = ({
  community,
  isRequested,
  onRequestJoin,
}: {
  community: CommunityDTO;
  isRequested: boolean | undefined;
  onRequestJoin: (msg: string) => void;
}) => {
  const [msg, setMsg] = useState("");

  if (isRequested === undefined) return null;

  return (
    <Card className="max-w-xl mx-auto p-10 border-none shadow-2xl rounded-3xl bg-white text-center">
      <div
        className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
          isRequested ? "bg-amber-50" : "bg-slate-100"
        }`}
      >
        {isRequested ? (
          <Clock className="h-10 w-10 text-amber-600" />
        ) : (
          <Lock className="h-10 w-10 text-slate-600" />
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4">
        {isRequested ? "Request Pending" : "Private Community"}
      </h2>

      {isRequested ? (
        <p className="text-slate-500 leading-relaxed">
          Your request to join{" "}
          <span className="font-bold text-slate-900">{community.name}</span>
          {
            " is currently being reviewed by the moderators. You'll be notified once you're approved!"
          }
        </p>
      ) : (
        <div className="space-y-6">
          <p className="text-slate-500">
            This community is private. Please introduce yourself to the admins
            to request access.
          </p>
          <Textarea
            placeholder="Tell us why you'd like to join..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            className="rounded-xl border-slate-200"
          />
          <Button
            onClick={() => onRequestJoin(msg)}
            className="w-full h-12 bg-slate-900 rounded-xl font-bold"
          >
            Send Join Request
          </Button>
        </div>
      )}
    </Card>
  );
};
