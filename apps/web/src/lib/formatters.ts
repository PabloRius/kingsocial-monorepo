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
