import { getOwnProfile } from "@/services/profile";
import { ProfileDTO } from "@repo/shared-types";
import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ProfileContextType {
  profile: ProfileDTO | undefined | null;
  setProfile: React.Dispatch<
    React.SetStateAction<ProfileDTO | undefined | null>
  >;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [profile, setProfile] = useState<ProfileDTO | undefined | null>(
    undefined
  );

  const refreshProfile = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const result = await getOwnProfile();
      setProfile(result.data);
    } catch (error) {
      console.error("Failed to fetch profile: ", error);
      setProfile(null);
    }
  }, [status]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (status === "authenticated") {
      timeoutId = setTimeout(() => {
        refreshProfile();
      }, 0);
    } else if (status === "loading") {
      timeoutId = setTimeout(() => {
        setProfile(undefined);
      }, 0);
    } else {
      timeoutId = setTimeout(() => {
        setProfile(null);
      }, 0);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [refreshProfile, status]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context)
    throw new Error("useProfile must be used within ProfileProvider");
  return context;
};
