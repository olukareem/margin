import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Otion",
  description: "Olu's workspace",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/meridian-lightmode.svg",
        href: "/meridian-lightmode.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/meridian-darkmode.svg",
        href: "/meridian-darkmode.svg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="otion-theme-A"
          >
            <Toaster position="bottom-center" />
            <ModalProvider />

            {children}
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
