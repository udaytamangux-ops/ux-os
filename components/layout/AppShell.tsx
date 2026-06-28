"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimeAtmosphere } from "@/components/layout/AnimeAtmosphere";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";

// Routes that render bare (no sidebar / mobile nav / atmosphere).
function isBareRoute(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/portfolio/")
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isBareRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-bg/95 text-t1">
      <AnimeAtmosphere />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>
      <div className="relative z-10 flex min-h-dvh">
        <Sidebar />
        <main id="main-content" className="motion-stage min-w-0 flex-1 overflow-x-hidden pb-20 lg:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
