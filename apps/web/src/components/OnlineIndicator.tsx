export function OnlineIndicator({
  userId,
  currentOnlineList,
  userSettings,
}: {
  userId: string;
  currentOnlineList: string[];
  userSettings?: {
    showOnlineStatus: boolean;
    notificationsEnabled: boolean;
  };
}) {
  if (!userSettings?.showOnlineStatus) return null;

  const isOnline = currentOnlineList.includes(userId);

  if (!isOnline) return null;

  return (
    <span className="absolute flex h-3 w-3 -bottom-1 -left-1">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
    </span>
  );
}
