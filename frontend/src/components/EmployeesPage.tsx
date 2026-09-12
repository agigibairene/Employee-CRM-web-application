import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useListEmployeesQuery } from "../redux/employeeApi";
import { useListDepartmentsQuery } from "../redux/departmentsApi";
import { Badge } from "../ui/Badge";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "./EmptyState";
import { AddEmployeeModal } from "./AddEmployeeModal";

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const debouncedSearch = useDebounced(search);
  const { data: departments } = useListDepartmentsQuery();
  const { data: employees, isLoading, isError, refetch } = useListEmployeesQuery({
    search: debouncedSearch || undefined,
    department: department ? Number(department) : undefined,
    employment_status: status || undefined,
  });

  const hasFilters = !!(search || department || status);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif-brand text-2xl font-semibold text-ink">Employees</h1>
          <p className="mt-1 text-sm text-ink-muted">Manage your team's records.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="rounded-sm bg-(--primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--primary)-hover"
        >
          Add employee
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or title"
          className="w-64 rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-(--primary)"
        />
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="rounded-sm border border-border bg-white px-3 py-2 text-sm outline-none focus:border-(--primary)"
        >
          <option value="">All departments</option>
          {departments?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-sm border border-border bg-white px-3 py-2 text-sm outline-none focus:border-(--primary)"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On leave</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {isError && (
        <div className="rounded-sm border border-danger bg-danger-bg px-4 py-3 text-sm text-danger">
          Couldn't load employees.{" "}
          <button onClick={() => refetch()} className="font-medium underline underline-offset-2">
            Try again
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      )}

      {!isLoading && employees && employees.length === 0 && (
        <EmptyState
          title={hasFilters ? "No employees match these filters" : "No employees yet"}
          description={
            hasFilters ? "Try a different search or clear the filters." : "Add your first employee to get started."
          }
        />
      )}

      {!isLoading && employees && employees.length > 0 && (
        <div className="overflow-hidden rounded-sm border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-paper text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Job title</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-border last:border-0 hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <Link to={`/employees/${emp.id}`} className="font-medium text-ink hover:text-(--primary)">
                      {emp.full_name}
                    </Link>
                    <p className="text-xs text-ink-muted">{emp.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{emp.job_title || "—"}</td>
                  <td className="px-4 py-3 text-ink-muted">{emp.department_name || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge status={emp.employment_status} />
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{emp.location || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddEmployeeModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}