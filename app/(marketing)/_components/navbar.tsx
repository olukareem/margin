"use client";

import { SignInButton, UserButton } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { useScrollTop } from "@/hook/use-scroll-top";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";

export const Navbar = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const scrolled = useScrollTop();

  return (
    <div
      className={cn(
        "z-50 bg-background/80 backdrop-blur fixed top-0 flex items-center w-full px-6 py-4",
        scrolled && "border-b",
      )}
    >
      <Logo />
      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
        {isLoading && <Spinner />}
        {!isAuthenticated && !isLoading && (
          <>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button size="sm">Start writing</Button>
            </SignInButton>
          </>
        )}
        {isAuthenticated && !isLoading && (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/notes">Open notes</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </>
        )}
        <ModeToggle />
      </div>
    </div>
  );
};
