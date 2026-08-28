import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/Button";

type Props = {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, lastPage, onChange }: Props) {
  if (lastPage <= 1) return null;

  return (
    <nav
      aria-label="Pages of items"
      className="mt-auto flex items-center justify-between gap-3 border-t border-line px-4 py-4 sm:px-6"
    >
      <Button
        variant="secondary"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft aria-hidden="true" size={20} />
        Previous
      </Button>

      <p aria-live="polite" className="text-sm font-medium text-subtle">
        Page {page} of {lastPage}
      </p>

      <Button
        variant="secondary"
        onClick={() => onChange(page + 1)}
        disabled={page === lastPage}
      >
        Next
        <ChevronRight aria-hidden="true" size={20} />
      </Button>
    </nav>
  );
}
