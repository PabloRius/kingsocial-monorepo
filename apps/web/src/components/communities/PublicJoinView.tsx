import { CommunityDTO } from "@repo/shared-types";
import { Users } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export const PublicJoinView = ({
  community,
  onJoin,
}: {
  community: CommunityDTO;
  onJoin: () => void;
}) => (
  <Card className="p-12 text-center border-none shadow-xl rounded-3xl bg-white max-w-2xl mx-auto">
    <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
      <Users className="h-10 w-10 text-blue-600" />
    </div>
    <h2 className="text-3xl font-bold mb-4">Discover {community.name}</h2>
    <p className="text-slate-500 mb-8">
      This is a public community. Join now to participate in the chat and see
      upcoming student events!
    </p>
    <Button
      onClick={onJoin}
      className="h-14 px-12 rounded-2xl bg-blue-600 text-lg font-bold shadow-lg shadow-blue-200"
    >
      Join Community
    </Button>
  </Card>
);
