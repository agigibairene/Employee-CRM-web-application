export interface Department {
  id: number;
  name: string;
  description: string;
  employee_count: number;
  created_at: string;
}

export interface EmployeeListItem {
  id: number;
  full_name: string;
  email: string;
  avatar_url: string;
  job_title: string;
  department: number | null;
  department_name: string | null;
  employment_status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
  start_date: string | null;
  location: string;
  manager: number | null;
  manager_name: string | null;
}

export interface EmployeeDetail extends EmployeeListItem {
  phone: string;
  date_joined: string;
  leave_requests: LeaveRequest[];
  recent_activity: { id: number; description: string; created_at: string }[];
}

export interface LeaveRequest {
  id: number;
  employee: number;
  employee_name: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_employees: number;
  active_employees: number;
  on_leave_employees: number;
  departments_count: number;
  recent_activity: { id: number; description: string; created_at: string; employee: string }[];
}