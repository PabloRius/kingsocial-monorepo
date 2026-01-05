"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";
import { CommunityDTO } from "@repo/shared-types";
import {
  ArrowLeft,
  Calendar,
  Globe,
  Lock,
  Settings,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CommunityHeaderProps {
  community: CommunityDTO;
  isAdmin: boolean;
  onOpenSettings: () => void;
}

export const CommunityHeader = ({
  community,
  isAdmin,
  onOpenSettings,
}: CommunityHeaderProps) => {
  const router = useRouter();

  return (
    <div className="relative h-64 md:h-96 w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src={community.coverImage || "/placeholder-community.jpg"}
        alt={community.name}
        fill
        className="object-cover"
        priority
      />

      {/* Aesthetic Overlays */}
      <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent" />
      <div className="absolute inset-0 bg-slate-900/20 backdrop-hidden" />

      {/* Navigation & Actions */}
      <div className="absolute top-6 left-0 right-0 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button
            onClick={() => router.push("/communities")}
            variant="secondary"
            size="icon"
            className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {isAdmin && (
            <Button
              onClick={onOpenSettings}
              variant="secondary"
              className="rounded-xl bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md transition-all"
            >
              <Settings className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          )}
        </div>
      </div>

      {/* Community Identity Information */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-none backdrop-blur-md">
                {community.mode === "private" ? (
                  <>
                    <Lock className="w-3 h-3 mr-1" /> Private
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 mr-1" /> Public
                  </>
                )}
              </Badge>
              <Badge variant="outline" className="text-white border-white/30">
                Community
              </Badge>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-none">
              {community.name}
            </h1>

            <p className="text-slate-200 text-sm md:text-base max-w-2xl leading-relaxed opacity-90">
              {community.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[
                    ...Array(
                      community.members.length < 3
                        ? community.members.length
                        : 3
                    ),
                  ].map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[8px]"
                    >
                      <Users className="w-3 h-3" />
                    </div>
                  ))}
                </div>
                <span className="font-medium text-white">
                  {community.members.length.toLocaleString()} Members
                </span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-white/20 pl-6">
                <Calendar className="w-4 h-4" />
                <span>Launched {formatDate(community.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
