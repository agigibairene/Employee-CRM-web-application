import { useState } from "react";
import { useGetMeQuery } from "../../redux/authApi";
import { useListLeaveRequestsQuery, useApproveLeaveRequestMutation, useRejectLeaveRequestMutation, } from "../../redux/leaveApi";
import { Badge } from "../../ui/Badge";
import { Skeleton } from "../../ui/Skeleton";
import { EmptyState } from "../EmptyState";
import { SubmitLeaveModal } from "./SubmitLeaveModal";

export default function LeaveManagementPage() {
  const { data: me } = useGetMeQuery();
  const isHRAdmin = me?.role === "HR_ADMIN";

  const { data: leaveRequests, isLoading, isError, refetch } = useListLeaveRequestsQuery();
  const [approve, { isLoading: isApproving }] = useApproveLeaveRequestMutation();
  const [reject, { isLoading: isRejecting }] = useRejectLeaveRequestMutation();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [actioningId, setActioningId] = useState<number | null>(null);

  async function handleApprove(id: number) {
    setActioningId(id);
    try {
      await approve(id).unwrap();
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id: number) {
    setActioningId(id);
    try {
      await reject(id).unwrap();
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif-brand text-2xl font-semibold text-ink">Leave</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {isHRAdmin ? "Review and manage leave requests." : "Your leave requests."}
          </p>
        </div>
        {!isHRAdmin && (
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="rounded-sm bg-(--primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--primary)-hover"
          >
            Request leave
          </button>
        )}
      </div>

      {isError && (
        <div className="rounded-sm border border-danger bg-danger-bg px-4 py-3 text-sm text-danger">
          Couldn't load leave requests.{" "}
          <button onClick={() => refetch()} className="font-medium underline underline-offset-2">
            Try again
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      )}

      {!isLoading && leaveRequests && leaveRequests.length === 0 && (
        <EmptyState
          title="No leave requests"
          description={
            isHRAdmin
              ? "Requests submitted by employees will show up here."
              : "You haven't requested any time off yet."
          }
        />
      )}

      {!isLoading && leaveRequests && leaveRequests.length > 0 && (
        <div className="overflow-hidden rounded-sm border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-paper text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                {isHRAdmin && <th className="px-4 py-3 font-medium">Employee</th>}
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {isHRAdmin && <th className="px-4 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((leave) => (
                <tr key={leave.id} className="border-b border-border last:border-0">
                  {isHRAdmin && <td className="px-4 py-3 font-medium text-ink">{leave.employee_name}</td>}
                  <td className="px-4 py-3 text-ink-muted">
                    {leave.start_date} → {leave.end_date}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{leave.reason || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge status={leave.status} />
                  </td>
                  {isHRAdmin && (
                    <td className="px-4 py-3">
                      {leave.status === "PENDING" ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(leave.id)}
                            disabled={isApproving && actioningId === leave.id}
                            className="text-sm font-medium text-(--primary) hover:underline disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(leave.id)}
                            disabled={isRejecting && actioningId === leave.id}
                            className="text-sm font-medium text-danger hover:underline disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-muted">
                          Reviewed by {leave.reviewed_by_name ?? "—"}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SubmitLeaveModal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
    </div>
  );
}