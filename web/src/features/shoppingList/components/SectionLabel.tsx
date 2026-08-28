export function SectionLabel({ count }: { count: number }) {
  return (
    <p className="px-4 pb-2 pt-4 text-xs font-bold uppercase tracking-label text-subtle sm:px-6">
      To find · {count}
    </p>
  );
}
