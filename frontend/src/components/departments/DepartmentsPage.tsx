import { useState } from "react";
import {useListDepartmentsQuery,useDeleteDepartmentMutation, } from "../../redux/departmentsApi";
import { Skeleton } from "../../ui/Skeleton";
import { EmptyState } from "../EmptyState";
import { ConfirmDialog } from "../../ui/ConfirmDialog";
import { DepartmentModal } from "./DepartmentModal";
import type { Department } from "../../types";

export default function DepartmentsPage() {
  const { data: departments, isLoading, isError, refetch } = useListDepartmentsQuery();
  const [deleteDepartment, { isLoading: isDeleting }] = useDeleteDepartmentMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openCreate() {
    setEditingDepartment(null);
    setIsModalOpen(true);
  }

  function openEdit(dept: Department) {
    setEditingDepartment(dept);
    setIsModalOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteDepartment(deleteTarget.id).unwrap();
      setDeleteTarget(null);
    } catch (err: unknown) {
      const errorData = (err as { data?: { detail?: string } })?.data;
      setDeleteError(errorData?.detail || "Couldn't delete this department.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif-brand text-2xl font-semibold text-ink">Departments</h1>
          <p className="mt-1 text-sm text-ink-muted">Organize your team by department.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-sm bg-(--primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--primary)-hover"
        >
          New department
        </button>
      </div>

      {isError && (
        <div className="rounded-sm border border-danger bg-danger-bg px-4 py-3 text-sm text-danger">
          Couldn't load departments.{" "}
          <button onClick={() => refetch()} className="font-medium underline underline-offset-2">
            Try again
          </button>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {!isLoading && departments && departments.length === 0 && (
        <EmptyState
          title="No departments yet"
          description="Create your first department to start organizing employees."
        />
      )}

      {!isLoading && departments && departments.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <div key={dept.id} className="flex flex-col justify-between rounded-sm border border-border bg-white p-5">
              <div>
                <h2 className="font-medium text-ink">{dept.name}</h2>
                <p className="mt-1 text-sm text-ink-muted">{dept.description || "No description"}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-ink-muted">
                  {dept.employee_count} {dept.employee_count === 1 ? "employee" : "employees"}
                </span>
                <div className="flex gap-3 text-sm">
                  <button onClick={() => openEdit(dept)} className="text-(--primary) hover:underline">
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(dept)}
                    className="text-danger hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DepartmentModal
        key={editingDepartment?.id ?? (isModalOpen ? "create-open" : "create-closed")}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        department={editingDepartment}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete department"
        description={
          deleteError ||
          `This will permanently delete "${deleteTarget?.name}". This can't be undone.`
        }
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}