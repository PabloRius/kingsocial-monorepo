"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CommunityDTO } from "@repo/shared-types";
import {
  CheckCircle,
  ChevronRight,
  Globe,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CommunityCardProps {
  community: CommunityDTO;
  variant: "my" | "discover";
  onJoinClick?: (community: CommunityDTO) => void;
  role?: string;
  isMember?: boolean;
  isCreator?: boolean;
}

export default function CommunityCard({
  community,
  variant,
  onJoinClick,
  role,
  isMember,
}: CommunityCardProps) {
  const isOwner =
    role?.toLowerCase() === "admin" || role?.toLowerCase() === "creator";

  return (
    <Link href={`/communities/${community.id}`} className="block h-full group">
      <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={community.coverImage || "/placeholder.png"}
            alt={community.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

          {/* LEFT BADGE: ADMIN STATUS */}
          <div className="absolute top-4 left-4 flex gap-2">
            {variant === "my" && isOwner && (
              <Badge className="bg-amber-500/90 text-white border-none backdrop-blur-md">
                <ShieldCheck className="w-3 h-3 mr-1" /> Admin
              </Badge>
            )}
          </div>

          {/* RIGHT BADGE: PRIVACY STATUS (Discover Mode) */}
          {variant === "discover" && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-white/20 text-white border-none backdrop-blur-md font-medium">
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
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-xl tracking-tight leading-tight group-hover:text-blue-300 transition-colors">
              {community.name}
            </h3>
          </div>
        </div>

        <CardContent className="px-6 flex flex-col flex-1 pt-6">
          {" "}
          {/* Added pt-6 for better spacing */}
          <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1 italic leading-relaxed">
            &quot;{community.description}&quot;
          </p>
          <div className="flex items-center justify-between mt-auto pb-4">
            {" "}
            {/* Added pb-4 */}
            <div className="flex -space-x-2 overflow-hidden">
              {[...Array(Math.min(community.members.length, 3))].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500"
                >
                  <Users className="w-3 h-3" />
                </div>
              ))}
              <span className="pl-4 text-xs font-medium text-slate-400 self-center">
                {community.members.length} members
              </span>
            </div>
            {variant === "discover" ? (
              isMember ? (
                <div className="text-blue-600 bg-blue-50 p-2 rounded-full">
                  <CheckCircle className="w-5 h-5" />
                </div>
              ) : (
                <Button
                  size="sm"
                  className="rounded-full bg-slate-900 hover:bg-blue-600 transition-colors px-4"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onJoinClick?.(community);
                  }}
                >
                  {community.mode === "private" ? "Request" : "Join"}
                </Button>
              )
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
