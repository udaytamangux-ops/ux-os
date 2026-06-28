"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, FolderKanban, LayoutDashboard, Users, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/prompt-vault", label: "Vault", icon: Wand2 },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/ai-studio", label: "AI", icon: Bot },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mobile-nav-play fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface/95 px-2 pb-2 pt-1 shadow-[0_-10px_24px_rgba(24,48,84,0.08)] backdrop-blur-xl lg:hidden"
      aria-label="Primary mobile"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "anime-nav-link flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] transition-colors",
              active ? "bg-accent-d text-accent" : "text-t2 hover:bg-card hover:text-t1"
            )}
          >
            <Icon size={17} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
