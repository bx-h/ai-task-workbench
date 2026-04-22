import { cn } from "@/lib/utils";

interface Hunk {
  header: string;
  lines: { kind: "add" | "del" | "ctx" | "meta"; text: string }[];
}

interface Props {
  path: string;
  hunks: Hunk[];
  additions?: number;
  deletions?: number;
  className?: string;
}

export function DiffBlock({ path, hunks, additions, deletions, className }: Props) {
  const adds = additions ?? hunks.flatMap((h) => h.lines).filter((l) => l.kind === "add").length;
  const dels = deletions ?? hunks.flatMap((h) => h.lines).filter((l) => l.kind === "del").length;

  return (
    <div className={cn("overflow-hidden rounded-md border border-border bg-background font-mono text-[12px]", className)}>
      {/* header */}
      <div className="flex items-center gap-2 border-b border-border bg-surface-elevated px-3 py-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">diff</span>
        <span className="truncate text-foreground">{path}</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px]">
          <span className="text-diff-add-fg">+{adds}</span>
          <span className="text-diff-del-fg">−{dels}</span>
          <DiffBar adds={adds} dels={dels} />
        </span>
      </div>

      {hunks.map((h, hi) => (
        <div key={hi} className="border-b border-border/50 last:border-b-0">
          <div className="bg-surface px-3 py-1 text-[11px] text-diff-meta">{h.header}</div>
          <div>
            {h.lines.map((line, i) => {
              const sign = line.kind === "add" ? "+" : line.kind === "del" ? "−" : " ";
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-stretch leading-[1.55]",
                    line.kind === "add" && "bg-diff-add-bg/40",
                    line.kind === "del" && "bg-diff-del-bg/40",
                  )}
                >
                  <span
                    className={cn(
                      "w-6 select-none border-r border-border/40 px-1 text-right text-[11px]",
                      line.kind === "add" && "text-diff-add-fg",
                      line.kind === "del" && "text-diff-del-fg",
                      line.kind === "ctx" && "text-muted-foreground/50",
                    )}
                  >
                    {sign}
                  </span>
                  <pre
                    className={cn(
                      "scrollbar-thin flex-1 overflow-x-auto whitespace-pre px-2 py-0.5",
                      line.kind === "add" && "text-diff-add-fg",
                      line.kind === "del" && "text-diff-del-fg",
                      line.kind === "ctx" && "text-foreground/80",
                      line.kind === "meta" && "text-diff-meta",
                    )}
                  >
                    {line.text}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function DiffBar({ adds, dels }: { adds: number; dels: number }) {
  const total = Math.max(adds + dels, 1);
  const a = Math.round((adds / total) * 5);
  const d = 5 - a;
  return (
    <span className="ml-1 inline-flex h-2 items-center gap-px">
      {Array.from({ length: a }).map((_, i) => <span key={`a${i}`} className="h-2 w-1.5 bg-diff-add-fg/80" />)}
      {Array.from({ length: d }).map((_, i) => <span key={`d${i}`} className="h-2 w-1.5 bg-diff-del-fg/80" />)}
    </span>
  );
}