"use client";

import { useQuery } from "convex/react";
import { Hash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

export const TagFilter = () => {
  const router = useRouter();
  const params = useParams<{ tag?: string }>();
  const tags = useQuery(api.notes.listTags);

  if (!tags || tags.length === 0) return null;

  const active = params.tag ? decodeURIComponent(params.tag) : undefined;

  return (
    <div className="flex flex-col">
      <p className="px-3 pt-4 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Tags
      </p>
      <div className="flex flex-col">
        {tags.map(({ name, count }) => {
          const isActive = active === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => router.push(`/tag/${encodeURIComponent(name)}`)}
              className={cn(
                "group flex items-center gap-x-2 px-3 py-1 text-sm text-muted-foreground hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
                isActive && "bg-primary/5 text-foreground",
              )}
            >
              <Hash className="h-3.5 w-3.5" />
              <span className="flex-1 truncate text-left">{name}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
