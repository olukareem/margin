"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const Error = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-y-6 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <AlertTriangle className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-xl font-semibold tracking-tight">Something went wrong.</h1>
        <p className="text-sm text-muted-foreground">
          The page hit an error. Head back to your notes and try again.
        </p>
      </div>
      <Button asChild>
        <Link href="/notes">Back to notes</Link>
      </Button>
    </div>
  );
};

export default Error;
