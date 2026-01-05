"use client";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { stampCommunityJoinRequest } from "@/services/communities";
import { CommunityJoinRequest, CommunityMember } from "@repo/shared-types";
import { ShieldCheck, Users } from "lucide-react";
import { JoinRequest } from "./JoinRequest";

export const CommunityMembers = ({
  members,
  requests,
  isAdmin,
}: {
  members: CommunityMember[];
  requests: CommunityJoinRequest[];
  isAdmin: boolean;
}) => {
  const handleStampJoinRequest = async (
    requestId: string,
    status: "approved" | "declined"
  ) => {
    try {
      const result = await stampCommunityJoinRequest(requestId, status);
      if (!result.success) return console.error("Error stamping join request");
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-10">
      {isAdmin && requests.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-amber-600 flex items-center gap-2">
            Pending Requests ({requests.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests
              .filter((req) => req.status === "pending")
              .map((req) => (
                <JoinRequest
                  key={req.id}
                  {...req}
                  onApprove={() => handleStampJoinRequest(req.id, "approved")}
                  onDecline={() => handleStampJoinRequest(req.id, "declined")}
                />
              ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5" /> Members List
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {members.map((m) => (
            <Card
              key={m.userId}
              className="p-4 flex flex-col items-center text-center gap-2 border-none shadow-sm rounded-2xl hover:bg-slate-50 transition-colors"
            >
              <UserAvatar
                avatarUrl={m.user.image || undefined}
                name={m.user.name || "Student"}
              />
              <div className="space-y-1">
                <p className="text-sm font-bold truncate max-w-30">
                  {m.user.name}
                </p>
                {m.role !== "member" && (
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                    <ShieldCheck className="w-3 h-3" /> {m.role}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
