"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";

import { SearchCommand } from "@/components/search-command";
import { Spinner } from "@/components/spinner";

import { ShortcutHost } from "./shortcut-host";
import { Sidebar } from "./sidebar/sidebar";

export const MainShell = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return redirect("/");
  }

  return (
    <div className="h-full flex bg-background">
      <Sidebar>
        <SearchCommand />
        <ShortcutHost />
        <main className="h-full overflow-y-auto">{children}</main>
      </Sidebar>
    </div>
  );
};
