import { ArrowUpRight, type LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone: "cyan" | "violet" | "amber" | "emerald";
};

export function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
}: StatCardProps) {
  return (
    <article className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <span className={`icon-box icon-${tone}`}>
          <Icon className="size-5" />
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-foreground" />
      </div>
      <p className="text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
      <p className="mt-2 text-xs text-muted-foreground">{note}</p>
    </article>
  );
}
