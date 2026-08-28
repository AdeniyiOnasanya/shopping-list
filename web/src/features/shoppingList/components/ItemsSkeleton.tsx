export function ItemsSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="px-4 pb-2 pt-4 sm:px-6">
        <span className="block h-3 w-24 rounded bg-line" />
      </div>

      {Array.from({ length: 5 }, (_, i) => i).map((row) => (
        <div
          key={row}
          className="flex min-h-16 items-center gap-4 border-t border-line px-4 py-2 sm:px-6"
        >
          <span className="h-4 flex-1 rounded bg-line" />
          <span className="h-4 w-14 rounded bg-line" />
        </div>
      ))}
    </div>
  );
}
