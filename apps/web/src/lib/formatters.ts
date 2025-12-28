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
