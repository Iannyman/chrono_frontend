"use client";
import { House, IdCard, List, Settings, LogOut, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

const menuItems = [
  { name: "Home", icon: House, variant: "ghost", href: "/" },
  { name: "Employees", icon: IdCard, variant: "ghost", href: "/employees" },
  { name: "Enterprise", icon: List, variant: "ghost", href: "/enterprise" },
  { name: "Personnel", icon: Users, variant: "ghost", href: "/personnel" },
  { name: "Settings", icon: Settings, variant: "ghost", href: "/settings" },
] as const;

interface SidebarProps {
  user: AuthUser | null;
  isAdmin: boolean;
}

const Sidebar = ({ user, isAdmin }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try{
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if(!response.ok) return;
      router.replace("/login");
    } catch {
      toast.error("Something went wrong. Please try again.", { position: "top-right" });
    }    
  };

  return (
    <div className="flex">
      <div className="relative w-20 md:w-60 bg-gray-800 p-4 text-white">
        <div className="w-fit mx-auto">
          <Image
            className="w-30 h-35"
            src="/new-logo.png"
            alt="Logo"
            width={120}
            height={140}
            priority
          />
        </div>

        <nav className="mt-4 flex flex-col justify-between">
          <ul className="flex flex-col gap-3">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive = pathname === item.href ||
              (item.href !== "/" &&
                  pathname.startsWith(`${item.href}/`));

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex h-14 w-full items-center rounded-xl px-4 text-sm font-medium hover:text-[#fbfdc1] ${isActive
                          ? "bg-[#fbfdc1] text-gray-900 hover:text-gray-900"
                          : "text-white hover:bg-gray-700 hover:text-[#fbfdc1]"
                      }
                    `}>
                
                    <span className="flex h-5 w-5 items-center justify-center shrink-0">
                      <Icon size={20} />
                    </span>

                    <span className="ml-4 hidden md:block">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="absolute bottom-5 border-t-2 border-gray-700 px-4 pt-4 w-50">
            <div className="flex flex-col gap-3">
              <div className="leading-4">
                <h4 className="font-semibold">{user?.displayName ?? "User"}</h4>
                <span className="text-xs text-gray-400">{isAdmin ? "Admin" : ""}</span>
              </div>

              <Button
                onClick={handleLogout}
                variant="logout"
                className="flex h-10 w-full items-center rounded-xl text-sm font-medium hover:text-[#fbfdc1] cursor-pointer"
              >
                <span className="flex h-5 w-5 items-center justify-center shrink-0">
                  <LogOut size={20} />
                </span>

                <span className="ml-4">Logout</span>
              </Button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
