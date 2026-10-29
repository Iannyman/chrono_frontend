
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { USER_COOKIE } from "@/lib/auth-cookie";
import { isAdminUser } from "@/lib/admin";

export default async function AdminLayout({
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

  if (!user || !isAdminUser(user.username)) {
    redirect("/");
  }

  return <>{children}</>;
}
