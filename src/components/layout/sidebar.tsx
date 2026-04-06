"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Database,
  CreditCard,
  Settings,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  FlaskConical,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/upload", label: "Data", icon: Database },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/playground", label: "Playground", icon: FlaskConical },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-white border-r border-zinc-100 flex flex-col z-30">
      <div className="px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 relative">
            <Image
              src="/Tech Logo - New Group.png"
              alt="Quantara Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-[15px] font-semibold text-zinc-900 tracking-tight">Quantara</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-violet-600" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-zinc-100">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer mb-1">
          <div className="w-7 h-7 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-zinc-900 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[11px] text-zinc-400 truncate">
              {user?.email || ""}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 w-full transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
