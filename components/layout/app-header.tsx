export function AppHeader({ title }: { title: string }) {
  return <header className="flex h-16 shrink-0 items-center border-b border-border bg-card px-6">
    <h1 className="text-base font-medium text-foreground">{title}</h1>
  </header>;
}
