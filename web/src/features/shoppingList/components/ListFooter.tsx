import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ListFooter({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="shrink-0 border-t border-line bg-white px-4 py-4 pb-safe sm:px-6">
      <Button onClick={onAdd} className="w-full">
        <Plus aria-hidden="true" size={20} />
        Add item
      </Button>
    </div>
  );
}
