"use client";

import { SignInButton } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";

export const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight">
        Notes in the margins. Thoughts you come back to.
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
        A quiet writing space. Folders, tags, and a search that actually finds
        what you wrote.
      </p>
      {isLoading && (
        <div className="w-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}
      {isAuthenticated && !isLoading && (
        <Button asChild>
          <Link href="/notes">
            Open your notes
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      )}
      {!isAuthenticated && !isLoading && (
        <SignInButton mode="modal">
          <Button>
            Start writing
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </SignInButton>
      )}
    </div>
  );
};
