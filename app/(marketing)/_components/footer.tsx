import { Button } from "@/components/ui/button";

import { Logo } from "./logo";

export const Footer = () => {
  return (
    <div className="flex items-center w-full px-6 py-6 bg-background border-t">
      <Logo />
      <div className="md:ml-auto w-full justify-between md:justify-end flex items-center gap-x-2 text-muted-foreground">
        <Button variant="ghost" size="sm">
          Privacy
        </Button>
        <Button variant="ghost" size="sm">
          Terms
        </Button>
      </div>
    </div>
  );
};
