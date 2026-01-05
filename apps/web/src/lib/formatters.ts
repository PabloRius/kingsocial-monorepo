export function formatCount(
  count: number | undefined | null,
  tag: string,
  tagPlural?: string
) {
  // Format a large number into a simplified version with a tag
  if (count === null || count === undefined) return count;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k+ items`;
  return `${count} ${count !== 1 ? tagPlural || tag + "s" : tag}`;
}

export function formatDate(date: Date) {
  // Format a date into a card-friendly format
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(time: string) {
  // Format a string timestamp in a card-friendly format
  const [hours, minutes] = time.split(":");
  const hour = Number.parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function formatChatTimestamp(date: Date): string {
  const now = new Date();
  const d = new Date(date);

  // Midnight today
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Midnight yesterday
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d >= today) {
    // Today -> show time
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (d >= yesterday) {
    // Yesterday
    return "yesterday";
  } else {
    // Older
    return d.toLocaleDateString([], {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
}

export function getColorFromId(id: string): string {
  // Generates a unique color for each id given (for community chats)
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;

  return `hsl(${hue}, 70%, 50%)`;
}
