import Link from "next/link";

import { Button } from "@/components/ui/button";

// Root layout mounts ClerkProvider, so this page inherits it and cannot be prerendered
// without a real Clerk publishable key.
export const dynamic = "force-dynamic";

const NotFound = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-y-6 px-6 text-center">
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Nothing here.</h1>
        <p className="text-sm text-muted-foreground">
          The page you were looking for does not exist, or the note has been
          moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/notes">Back to notes</Link>
      </Button>
    </div>
  );
};

export default NotFound;
