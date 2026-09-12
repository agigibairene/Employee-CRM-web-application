import { useState, type FormEvent } from "react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { FormField } from "../../ui/FormField";
import { useCreateDepartmentMutation, useUpdateDepartmentMutation } from "../../redux/departmentsApi";
import type { Department } from "../../types";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department?: Department | null;
}

export function DepartmentModal({ isOpen, onClose, department }: DepartmentModalProps) {
  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
  const isEditing = !!department;

  const [name, setName] = useState(department?.name ?? "");
  const [description, setDescription] = useState(department?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setNameError("Enter a department name.");
      return;
    }
    setNameError(null);

    try {
      if (isEditing && department) {
        await updateDepartment({ id: department.id, name, description }).unwrap();
      } else {
        await createDepartment({ name, description }).unwrap();
      }
      onClose();
    } catch (err: unknown) {
      const errorData = (err as { data?: { name?: string[]; detail?: string } })?.data;
      setError(errorData?.name?.[0] || errorData?.detail || "Couldn't save this department.");
    }
  }

  return (
    <Modal title={isEditing ? "Edit department" : "New department"} isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && (
          <div className="rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </div>
        )}

        <FormField label="Name" htmlFor="dept_name" error={nameError ?? undefined}>
          <input
            id="dept_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-(--primary)"
          />
        </FormField>

        <FormField label="Description" htmlFor="dept_description">
          <textarea
            id="dept_description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-(--primary)"
          />
        </FormField>

        <Button type="submit" isLoading={isCreating || isUpdating} className="mt-1">
          {isEditing ? "Save changes" : "Create department"}
        </Button>
      </form>
    </Modal>
  );
}