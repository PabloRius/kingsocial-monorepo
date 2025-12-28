import { Badge, MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { UserDropdown } from "./buttons/UserDropwdown";
import { Button } from "./ui/button";

export const HeaderExpanded = () => {
  const { status } = useSession();

  if (status === "unauthenticated") return;

  const messages = 0;

  return (
    <div className="flex items-center gap-3">
      <Link href="/inbox">
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all cursor-pointer"
        >
          <MessageSquare className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          {messages > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center bg-celestial-blue-500">
              {messages}
            </Badge>
          )}
        </Button>
      </Link>

      <div className="relative group">
        <UserDropdown />
      </div>
    </div>
  );
};
