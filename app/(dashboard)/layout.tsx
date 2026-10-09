import { cookies } from "next/headers";
import Sidebar from "@/components/sidebar";
import { USER_COOKIE } from "@/lib/auth-cookie";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(USER_COOKIE)?.value;
  let user: AuthUser | null = null;
  if (raw) {
    try {
      user = JSON.parse(raw);
    } catch {
      user = null;
    }
  }

  // --- ADMIN CHECK ---
  const admins = process.env.ADMINS?.toLowerCase().split(",").map(a => a.trim()) ?? [];
  const isAdmin = user?.username ? admins.includes(user.username) : false;

  return (
    <>
      <Sidebar user={user} isAdmin={isAdmin} />
      {children}
    </>
  );
}