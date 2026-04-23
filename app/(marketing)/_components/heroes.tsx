// Stylized mockup of the editor shell. Deliberately abstract — rectangles
// and pills stand in for a sidebar, title, body copy, and tags. Kept close
// to the real thing's tokens (`bg-sidebar`, `border`, `rounded-sm`) so the
// mockup evolves when the palette does.
export const Heroes = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-5xl w-full">
      <div className="relative w-full max-w-3xl aspect-[16/10] rounded-md border bg-background overflow-hidden shadow-sm">
        <div className="absolute inset-0 flex">
          <div className="w-48 border-r bg-sidebar p-4 flex flex-col gap-y-2">
            <div className="h-3 w-24 bg-foreground/10 rounded-sm" />
            <div className="h-3 w-20 bg-foreground/10 rounded-sm" />
            <div className="h-3 w-28 bg-foreground/10 rounded-sm" />
            <div className="mt-4 h-3 w-16 bg-foreground/5 rounded-sm" />
            <div className="h-3 w-24 bg-foreground/5 rounded-sm" />
          </div>
          <div className="flex-1 p-8 space-y-4">
            <div className="h-7 w-64 bg-foreground/15 rounded-sm" />
            <div className="h-2 w-full bg-foreground/10 rounded-sm" />
            <div className="h-2 w-11/12 bg-foreground/10 rounded-sm" />
            <div className="h-2 w-10/12 bg-foreground/10 rounded-sm" />
            <div className="h-2 w-9/12 bg-foreground/10 rounded-sm" />
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
