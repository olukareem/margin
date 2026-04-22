import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

const MIN_WIDTH = 220;
const MAX_WIDTH = 440;
const DEFAULT_WIDTH = 260;

type UseResizableSidebarArgs = {
  sidebarRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
};

type UseResizableSidebar = {
  isCollapsed: boolean;
  isResetting: boolean;
  isMobile: boolean;
  onMouseDown: (event: React.MouseEvent) => void;
  resetWidth: () => void;
  collapse: () => void;
};

export function useResizableSidebar({
  sidebarRef,
  panelRef,
}: UseResizableSidebarArgs): UseResizableSidebar {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isResizingRef = useRef(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const applyWidth = useCallback(
    (width: number) => {
      const sidebar = sidebarRef.current;
      const panel = panelRef.current;
      if (!sidebar || !panel) return;
      sidebar.style.width = `${width}px`;
      panel.style.setProperty("left", `${width}px`);
      panel.style.setProperty("width", `calc(100% - ${width}px)`);
    },
    [sidebarRef, panelRef],
  );

  const resetWidth = useCallback(() => {
    const sidebar = sidebarRef.current;
    const panel = panelRef.current;
    if (!sidebar || !panel) return;
    setIsCollapsed(false);
    setIsResetting(true);
    if (isMobile) {
      sidebar.style.width = "100%";
      panel.style.setProperty("width", "0");
      panel.style.setProperty("left", "100%");
    } else {
      applyWidth(DEFAULT_WIDTH);
    }
    setTimeout(() => setIsResetting(false), 280);
  }, [applyWidth, isMobile, panelRef, sidebarRef]);

  const collapse = useCallback(() => {
    const sidebar = sidebarRef.current;
    const panel = panelRef.current;
    if (!sidebar || !panel) return;
    setIsCollapsed(true);
    setIsResetting(true);
    sidebar.style.width = "0";
    panel.style.setProperty("width", "100%");
    panel.style.setProperty("left", "0");
    setTimeout(() => setIsResetting(false), 280);
  }, [panelRef, sidebarRef]);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isResizingRef.current) return;
      const width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, event.clientX));
      applyWidth(width);
    },
    [applyWidth],
  );

  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      isResizingRef.current = true;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleMouseMove, handleMouseUp],
  );

  useEffect(() => {
    if (isMobile) collapse();
    else resetWidth();
  }, [isMobile, collapse, resetWidth]);

  return {
    isCollapsed,
    isResetting,
    isMobile,
    onMouseDown,
    resetWidth,
    collapse,
  };
}
