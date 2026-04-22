"use client";

import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useTheme } from "next-themes";
import { type ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const ConvexClientProvider = ({ children }: { children: ReactNode }) => {
  const { resolvedTheme } = useTheme();
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
        variables: {
          colorPrimary: "hsl(28 42% 60%)",
          borderRadius: "0.5rem",
        },
      }}
    >
      <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};
