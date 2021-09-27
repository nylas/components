export function getNameInitials(name: string): string {
  const nameParts = name.split(" ");
  return nameParts
    .map((n, i) => (i === 0 || i === nameParts.length - 1 ? n[0] : ""))
    .join("");
}
