import { useGetDashboardStatsQuery } from "../redux/dashboardApi";
import { StatCard } from "./StatCard";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";
import { formatRelativeDate } from "../ui/formatDate";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useGetDashboardStatsQuery();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif-brand text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">An overview of the organization.</p>
      </div>

      {isError && (
        <div className="rounded-sm border border-danger bg-danger-bg px-4 py-3 text-sm text-danger">
          Couldn't load dashboard stats.{" "}
          <button onClick={() => refetch()} className="font-medium underline underline-offset-2">
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[92px]" />)
        ) : data ? (
          <>
            <StatCard label="Total employees" value={data.total_employees} />
            <StatCard label="Active" value={data.active_employees} />
            <StatCard label="On leave" value={data.on_leave_employees} />
            <StatCard label="Departments" value={data.departments_count} />
          </>
        ) : null}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium text-ink">Recent activity</h2>

        {isLoading && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        )}

        {!isLoading && data && data.recent_activity.length === 0 && (
          <EmptyState
            title="No activity yet"
            description="Employee updates, leave requests, and new hires will show up here."
          />
        )}

        {!isLoading && data && data.recent_activity.length > 0 && (
          <ul className="rounded-sm border border-border bg-white">
            {data.recent_activity.map((activity, i) => (
              <li
                key={activity.id}
                className={`flex items-center justify-between px-4 py-3 text-sm ${
                  i !== data.recent_activity.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div>
                  <span className="font-medium text-ink">{activity.employee}</span>{" "}
                  <span className="text-ink-muted">{activity.description.toLowerCase()}</span>
                </div>
                <span className="text-xs text-ink-muted">{formatRelativeDate(activity.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}