"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getOwnProfile } from "@/services/profile";
import { ProfileDTO } from "@repo/shared-types";
import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserAvatar } from "../user-avatar";

export function UserDropdown() {
  const [profile, setProfile] = useState<ProfileDTO | undefined | null>(
    undefined
  );

  useEffect(() => {
    const fetchOwnProfile = async () => {
      try {
        const result = await getOwnProfile();
        setProfile(result.data || null);
      } catch (error) {
        console.error(error);
        setProfile(null);
      }
    };
    fetchOwnProfile();
  }, []);

  if (profile === undefined) {
    return <></>;
  }

  if (profile === null) return;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1 transition-all">
          <UserAvatar
            avatarUrl={profile.image || undefined}
            name={profile.name || undefined}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <p className="font-medium">{profile.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {profile.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/profile"
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          >
            <User className="w-4 h-4 text-pink-500" />
            <span>Profile Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            signOut({ redirectTo: "/" });
          }}
          className="text-red-500 focus:text-red-500 hover:bg-red-50 focus:bg-red-50 dark:focus:bg-gray-700 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
