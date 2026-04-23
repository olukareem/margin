import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { cn } from "@/lib/utils";

import "./globals.css";

// Single font family: Inter for both UI and prose. Notion uses Inter
// (plus a few system stack fallbacks) for everything — no serif display
// face, no secondary family. Keeping this single-family matches.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Margin",
  description: "Notes in the margins. Thoughts you come back to.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(inter.variable)}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          storageKey="margin-theme"
        >
          <ConvexClientProvider>
            <EdgeStoreProvider>
              <Toaster position="bottom-center" />
              <ModalProvider />
              {children}
            </EdgeStoreProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
