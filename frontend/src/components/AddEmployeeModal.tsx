import { useState, type FormEvent } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { useAddEmployeeMutation } from "../redux/employeeApi";
import { useListDepartmentsQuery } from "../redux/departmentsApi";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
  const [addEmployee, { isLoading }] = useAddEmployeeMutation();
  const { data: departments } = useListDepartmentsQuery();

  const [form, setForm] = useState({ email: "", full_name: "", job_title: "", department: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.full_name) errs.full_name = "Enter the employee's name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid company email.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    try {
      await addEmployee({
        email: form.email,
        full_name: form.full_name,
        job_title: form.job_title,
        department: form.department ? Number(form.department) : undefined,
      }).unwrap();
      setForm({ email: "", full_name: "", job_title: "", department: "" });
      onClose();
    } catch (err: any) {
      setFormError(err?.data?.email?.[0] || err?.data?.detail || "Couldn't add this employee.");
    }
  }

  return (
    <Modal title="Add employee" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {formError && (
          <div className="rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
            {formError}
          </div>
        )}

        <FormField label="Full name" htmlFor="full_name" error={errors.full_name}>
          <input
            id="full_name"
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            className="rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-(--primary)"
          />
        </FormField>

        <FormField label="Company email" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="name@company.com"
            className="rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-(--primary)"
          />
        </FormField>

        <FormField label="Job title" htmlFor="job_title">
          <input
            id="job_title"
            value={form.job_title}
            onChange={(e) => update("job_title", e.target.value)}
            className="rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-(--primary)"
          />
        </FormField>

        <FormField label="Department" htmlFor="department">
          <select
            id="department"
            value={form.department}
            onChange={(e) => update("department", e.target.value)}
            className="rounded-sm border border-border bg-white px-3 py-2 text-sm outline-none focus:border-(--primary)"
          >
            <option value="">None</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </FormField>

        <p className="text-xs text-ink-muted">
          An activation link will be emailed to this address so they can set their password.
        </p>

        <Button type="submit" isLoading={isLoading} className="mt-1">
          Send invite
        </Button>
      </form>
    </Modal>
  );
}