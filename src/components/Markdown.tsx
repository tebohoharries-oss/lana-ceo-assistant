import { Fragment } from "react";

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}

/** Lightweight markdown renderer for headings, bullets, numbered lists and bold. */
export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = (key: string) => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag
        key={key}
        className={
          list.ordered
            ? "ml-5 list-decimal space-y-1.5 text-sm leading-relaxed marker:text-primary"
            : "ml-5 list-disc space-y-1.5 text-sm leading-relaxed marker:text-primary"
        }
      >
        {list.items.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const key = `b${idx}`;
    if (!line.trim()) {
      flush(key);
      return;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      flush(key + "f");
      const level = (heading[1] ?? "").length;
      blocks.push(
        <h3
          key={key}
          className={
            level <= 2
              ? "mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              : "text-sm font-semibold text-foreground"
          }
        >
          {inline(heading[2] ?? "")}
        </h3>,
      );
      return;
    }
    const bullet = /^[-*•]\s+(.*)$/.exec(line.trim());
    if (bullet) {
      if (!list || list.ordered) {
        flush(key + "f");
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1] ?? "");
      return;
    }
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line.trim());
    if (numbered) {
      if (!list || !list.ordered) {
        flush(key + "f");
        list = { ordered: true, items: [] };
      }
      list.items.push(numbered[1] ?? "");
      return;
    }
    flush(key + "f");
    blocks.push(
      <p key={key} className="text-sm leading-relaxed">
        {inline(line.replace(/^>\s?/, ""))}
      </p>,
    );
  });
  flush("last");

  return <div className="space-y-3">{blocks}</div>;
}
