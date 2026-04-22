"use client";

import type { LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-y-4 px-6 py-12 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="max-w-sm space-y-1">
        <p className="text-base font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
};
