export function SectionLabel({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <p className="px-4 pb-2 pt-4 text-xs font-bold uppercase tracking-label text-subtle sm:px-6">
      {label} · {count}
    </p>
  );
}
