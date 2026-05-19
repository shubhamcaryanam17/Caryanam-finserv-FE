/**
 * Label for greetings: prefers full name when present, otherwise a readable value from email.
 */
export function getLoggedInDisplayName(user) {
  if (!user) return "User";

  const direct =
    (typeof user.name === "string" && user.name.trim()) ||
    (typeof user.fullName === "string" && user.fullName.trim());
  if (direct) return direct;

  const email = typeof user.email === "string" ? user.email.trim() : "";
  if (!email) return "User";

  if (!email.includes("@")) return email;

  const local = email.split("@")[0];
  const words = local.replace(/[._-]+/g, " ").split(" ").filter(Boolean);
  if (words.length === 0) return email;

  return words
    .map(
      (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
}
