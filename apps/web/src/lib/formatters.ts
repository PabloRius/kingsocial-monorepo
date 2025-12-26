export function formatCount(
  // Format a large number into a simplified version with a tag
  count: number | undefined | null,
  tag: string,
  tagPlural?: string
) {
  if (count === null || count === undefined) return count;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k+ items`;
  return `${count} ${count !== 1 ? tagPlural || tag + "s" : tag}`;
}
