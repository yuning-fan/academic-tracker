import { urgencyScore, daysUntil, daysLabel } from "../utils/calc";

export default function DdlList({ items, showStudent }: { items: any[], showStudent: boolean }) {
  if (!items.length) return <p className="empty">暂无待完成项目</p>;

  // sort: pending/upcoming by days asc, final at end
  const sortedItems = [...items].sort((a, b) => {
    const ua = urgencyScore(a);
    const ub = urgencyScore(b);
    if (ua !== ub) return ua - ub;
    return a.weight > b.weight ? -1 : 1; // heavier weight first if same day
  });

  // group
  const groups: { label: string; items: any[] }[] = [];
  const bands = [
    { label: "今日 / 明日", max: 1 },
    { label: "本周内", max: 7 },
    { label: "两周内", max: 14 },
    { label: "本月", max: 31 },
    { label: "未来", max: Infinity },
  ];
  
  const nonFinal = sortedItems.filter((it) => it.status !== "final");
  const final = sortedItems.filter((it) => it.status === "final");

  const banded: any[][] = [];
  bands.forEach((band) => {
    const its = nonFinal.filter((it) => {
      const days = daysUntil(it.ddl);
      const prev = banded.flat().map((x) => x.name);
      if (prev.includes(it.name)) return false;
      if (days === null) return band.max === Infinity;
      return days <= band.max;
    });
    banded.push(its);
    if (its.length) groups.push({ label: band.label, items: its });
  });

  if (final.length) groups.push({ label: "期末冲刺", items: final });

  return (
    <>
      {groups.map((g, idx) => (
        <div key={idx}>
          <div className="ddl-group">{g.label}</div>
          {g.items.map((it, i) => {
            const dl = daysLabel(it.ddl, it.status);
            const dotColor =
              it.status === "final"
                ? "var(--purple)"
                : it.weight >= 15
                ? "var(--red)"
                : it.weight >= 10
                ? "var(--amber)"
                : "var(--text3)";
            const hl =
              it.status === "final"
                ? " hl-p"
                : it.weight >= 15
                ? " hl-r"
                : it.weight >= 10
                ? " hl-a"
                : "";
            const tagClass =
              it.status === "final"
                ? "tag-f"
                : it.weight >= 10
                ? "tag-k"
                : "tag-n";
            const tagText =
              it.status === "final" ? "期末" : it.weight >= 10 ? "重要" : "必做";

            return (
              <div key={i} className={`ddl-item${hl}`}>
                <div className="ddl-dot" style={{ background: dotColor }}></div>
                <span className="ddl-date">{it.ddl || "待定"}</span>
                {showStudent && it.studentName && (
                  <span className="ddl-student">{it.studentName}</span>
                )}
                <span className="ddl-course">{it.courseName || ""}</span>
                <span className="ddl-name">
                  {it.name}（{it.weight}%）
                  {it.note && (
                    <span style={{ fontSize: "10.5px", color: "var(--amber)", marginLeft: "4px" }}>
                      {it.note}
                    </span>
                  )}
                </span>
                <span className={`tag ${tagClass}`}>{tagText}</span>
                <span className="ddl-days" style={{ color: dl.color }}>
                  {dl.text}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
