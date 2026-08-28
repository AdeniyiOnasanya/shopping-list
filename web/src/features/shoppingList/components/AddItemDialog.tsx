import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { TextField } from "@/components/ui/TextField";
import { parsePoundsToPence } from "@/lib/money";
import { useAddItem } from "../hooks/useAddItem";

type Props = {
  listId: number;
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
};

export function AddItemDialog({ listId, open, onClose, onAdded }: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const { addItem, isSaving, fieldErrors, reset } = useAddItem(listId);

  const errors = { ...fieldErrors, ...localErrors };

  function close() {
    setName("");
    setPrice("");
    setLocalErrors({});
    reset();
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLocalErrors({});

    if (name.trim() === "") {
      setLocalErrors({ name: "Give the item a name." });
      return;
    }

    const pence = parsePoundsToPence(price);

    if (pence === null) {
      setLocalErrors({ price: "Enter an amount like 2.50." });
      return;
    }

    try {
      await addItem({ name: name.trim(), price_pence: pence });
      close();
      onAdded();
    } catch {
      // A 422 is already surfaced through fieldErrors.
    }
  }

  return (
    <Dialog open={open} onClose={close} title="Add an item">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          label="Item"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
          autoComplete="off"
          enterKeyHint="done"
        />

        <TextField
          label="Price"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          error={errors.price}
          prefix="£"
          inputMode="decimal"
          placeholder="0.00"
          hint="Leave blank if you don't know it yet."
        />

        <div className="mt-2 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={close}
            className="h-14 flex-1"
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isSaving} className="flex-[1.4]">
            {isSaving ? "Adding…" : "Add to list"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
