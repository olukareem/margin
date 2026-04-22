"use client";

import { ChevronsLeft, MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { type ElementRef, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { useResizableSidebar } from "@/hook/use-resizable-sidebar";

import { FolderTree } from "./folder-tree";
import { SidebarHeader } from "./sidebar-header";
import { TagFilter } from "./tag-filter";

export const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const panelRef = useRef<ElementRef<"div">>(null);

  const {
    isCollapsed,
    isResetting,
    isMobile,
    onMouseDown,
    resetWidth,
    collapse,
  } = useResizableSidebar({ sidebarRef, panelRef });

  useEffect(() => {
    if (isMobile) collapse();
  }, [pathname, isMobile, collapse]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full bg-muted/40 border-r flex flex-col w-60 relative z-[99]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0",
        )}
      >
        <button
          type="button"
          onClick={collapse}
          className={cn(
            "absolute top-3 right-2 h-6 w-6 rounded-sm text-muted-foreground hover:bg-primary/10 flex items-center justify-center opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100",
          )}
          aria-label="Collapse sidebar"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 overflow-y-auto">
          <SidebarHeader />
          <FolderTree />
          <TagFilter />
        </div>
        <button
          type="button"
          onMouseDown={onMouseDown}
          onClick={resetWidth}
          aria-label="Resize sidebar"
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>
      <div
        ref={panelRef}
        className={cn(
          "absolute top-0 z-[99] left-60 w-[calc(100%-240px)] h-full",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full",
        )}
      >
        {isCollapsed && (
          <nav className="bg-transparent px-3 py-2 w-full flex items-center">
            <MenuIcon
              role="button"
              tabIndex={0}
              onClick={resetWidth}
              onKeyDown={(e) => {
                if (e.key === "Enter") resetWidth();
              }}
              className="h-6 w-6 text-muted-foreground"
              aria-label="Open sidebar"
            />
          </nav>
        )}
        {children}
      </div>
    </>
  );
};
