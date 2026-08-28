import { Button } from "./Button";
import { Dialog } from "./Dialog";

type Props = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  isWorking?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = "Keep it",
  isWorking = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <p className="text-base text-muted">{body}</p>

      <div className="mt-2 flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          {cancelLabel}
        </Button>

        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={isWorking}
          className="flex-1"
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
