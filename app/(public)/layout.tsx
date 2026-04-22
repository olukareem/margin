const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="h-full bg-background text-foreground">{children}</div>;
};

export default PublicLayout;
