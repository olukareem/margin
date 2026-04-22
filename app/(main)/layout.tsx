import { MainShell } from "./_components/main-shell";

// Auth-gated pages are user-specific and must not be prerendered.
export const dynamic = "force-dynamic";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return <MainShell>{children}</MainShell>;
};

export default MainLayout;
