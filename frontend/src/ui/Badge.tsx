type Status = "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "PENDING" | "APPROVED" | "REJECTED";

const styles: Record<Status, string> = {
  ACTIVE: "bg-primary/10 text-primary",
  ON_LEAVE: "bg-accent/15 text-[#8a6a3a]",
  INACTIVE: "bg-ink-muted/10 text-ink-muted",
  PENDING: "bg-accent/15 text-[#8a6a3a]",
  APPROVED: "bg-primary/10 text-primary",
  REJECTED: "bg-danger-bg text-danger",
};

const labels: Record<Status, string> = {
  ACTIVE: "Active",
  ON_LEAVE: "On leave",
  INACTIVE: "Inactive",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function Badge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}