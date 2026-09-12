import { useState, type FormEvent } from "react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { FormField } from "../../ui/FormField";
import { useSubmitLeaveRequestMutation } from "../../redux/leaveApi";

interface SubmitLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitLeaveModal({ isOpen, onClose }: SubmitLeaveModalProps) {
  const [submitLeave, { isLoading }] = useSubmitLeaveRequestMutation();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ startDate?: string; endDate?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  function validate() {
    const errs: { startDate?: string; endDate?: string } = {};
    if (!startDate) errs.startDate = "Pick a start date.";
    if (!endDate) errs.endDate = "Pick an end date.";
    if (startDate && endDate && endDate < startDate) errs.endDate = "End date can't be before the start date.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    try {
      await submitLeave({ start_date: startDate, end_date: endDate, reason }).unwrap();
      setStartDate("");
      setEndDate("");
      setReason("");
      onClose();
    } catch (err: unknown) {
      const errorData = (err as { data?: { non_field_errors?: string[]; detail?: string } })?.data;
      setFormError(errorData?.non_field_errors?.[0] || errorData?.detail || "Couldn't submit this request.");
    }
  }

  return (
    <Modal title="Request leave" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {formError && (
          <div className="rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start date" htmlFor="start_date" error={errors.startDate}>
            <input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-(--primary)"
            />
          </FormField>
          <FormField label="End date" htmlFor="end_date" error={errors.endDate}>
            <input
              id="end_date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-(--primary)"
            />
          </FormField>
        </div>

        <FormField label="Reason (optional)" htmlFor="reason">
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-(--primary)"
          />
        </FormField>

        <Button type="submit" isLoading={isLoading} className="mt-1">
          Submit request
        </Button>
      </form>
    </Modal>
  );
}