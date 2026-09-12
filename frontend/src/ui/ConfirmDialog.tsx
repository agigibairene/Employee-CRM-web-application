import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  isLoading,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose}>
      <p className="text-sm text-ink-muted">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onClose} className="px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink">
          Cancel
        </button>
        <Button onClick={onConfirm} isLoading={isLoading} className="w-auto px-4 bg-danger hover:bg-[#832f22]">
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}