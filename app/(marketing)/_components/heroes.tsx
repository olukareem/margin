export const Heroes = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-5xl w-full">
      <div className="relative w-full max-w-3xl aspect-[16/10] rounded-xl border bg-muted/40 overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-48 border-r bg-muted/60 p-4 flex flex-col gap-y-2">
            <div className="h-3 w-24 bg-foreground/10 rounded" />
            <div className="h-3 w-20 bg-foreground/10 rounded" />
            <div className="h-3 w-28 bg-foreground/10 rounded" />
            <div className="mt-4 h-3 w-16 bg-foreground/5 rounded" />
            <div className="h-3 w-24 bg-foreground/5 rounded" />
          </div>
          <div className="flex-1 p-8 space-y-4">
            <div className="h-6 w-64 bg-foreground/15 rounded" />
            <div className="h-2 w-full bg-foreground/10 rounded" />
            <div className="h-2 w-11/12 bg-foreground/10 rounded" />
            <div className="h-2 w-10/12 bg-foreground/10 rounded" />
            <div className="h-2 w-9/12 bg-foreground/10 rounded" />
            <div className="pt-3 flex gap-x-2">
              <div className="h-5 w-16 bg-foreground/10 rounded-full" />
              <div className="h-5 w-20 bg-foreground/10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
