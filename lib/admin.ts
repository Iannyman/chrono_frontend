
export function isAdminUser(username?: string | null): boolean {
  const admins =
    process.env.ADMINS?.toLowerCase()
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean) ?? [];

  return username ? admins.includes(username.toLowerCase()) : false;
}
