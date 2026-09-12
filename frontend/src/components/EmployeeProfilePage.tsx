import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetEmployeeQuery, useDeactivateEmployeeMutation } from "../redux/employeeApi";
import { Badge } from "../ui/Badge";
import { Skeleton } from "../ui/Skeleton";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { formatRelativeDate } from "../ui/formatDate";

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const employeeId = Number(id);
  const { data: employee, isLoading, isError } = useGetEmployeeQuery(employeeId);
  const [deactivate, { isLoading: isDeactivating }] = useDeactivateEmployeeMutation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="rounded-sm border border-danger bg-danger-bg px-4 py-3 text-sm text-danger">
        Couldn't load this employee's profile.
      </div>
    );
  }

  async function handleDeactivate() {
    await deactivate(employeeId).unwrap();
    setIsConfirmOpen(false);
    navigate("/employees");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between rounded-sm border border-border bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--primary)/10 font-serif-brand text-xl font-semibold text-(--primary)">
            {employee.full_name.charAt(0)}
          </div>
          <div>
            <h1 className="font-serif-brand text-xl font-semibold text-ink">{employee.full_name}</h1>
            <p className="text-sm text-ink-muted">{employee.job_title || "No title set"}</p>
            <div className="mt-2">
              <Badge status={employee.employment_status} />
            </div>
          </div>
        </div>
        {employee.employment_status !== "INACTIVE" && (
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="text-sm font-medium text-danger hover:underline"
          >
            Deactivate
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-medium text-ink">Personal information</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Email" value={employee.email} />
            <Row label="Phone" value={employee.phone || "—"} />
            <Row label="Location" value={employee.location || "—"} />
          </dl>
        </section>

        <section className="rounded-sm border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-medium text-ink">Employment</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Department" value={employee.department_name || "—"} />
            <Row label="Manager" value={employee.manager_name || "—"} />
            <Row label="Start date" value={employee.start_date || "—"} />
            <Row label="Joined system" value={new Date(employee.date_joined).toLocaleDateString()} />
          </dl>
        </section>

        <section className="rounded-sm border border-border bg-white p-5 md:col-span-2">
          <h2 className="mb-3 text-sm font-medium text-ink">Leave requests</h2>
          {employee.leave_requests.length === 0 ? (
            <p className="text-sm text-ink-muted">No leave requests on record.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {employee.leave_requests.map((leave) => (
                <li key={leave.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted">
                    {leave.start_date} → {leave.end_date}
                  </span>
                  <Badge status={leave.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-sm border border-border bg-white p-5 md:col-span-2">
          <h2 className="mb-3 text-sm font-medium text-ink">Recent activity</h2>
          {employee.recent_activity.length === 0 ? (
            <p className="text-sm text-ink-muted">No recent activity.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {employee.recent_activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted">{a.description}</span>
                  <span className="text-xs text-ink-muted">{formatRelativeDate(a.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Deactivate employee"
        description={`This will deactivate ${employee.full_name}'s account and mark them as inactive. This can be reversed later.`}
        confirmLabel="Deactivate"
        isLoading={isDeactivating}
        onConfirm={handleDeactivate}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}