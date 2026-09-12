import { apiSlice } from "./apiSlice";
import type { EmployeeDetail, EmployeeListItem } from "../types";

export interface EmployeeFilters {
  search?: string;
  department?: number;
  employment_status?: string;
}

function toQueryString(filters: EmployeeFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.department) params.set("department", String(filters.department));
  if (filters.employment_status) params.set("employment_status", filters.employment_status);
  return params.toString();
}

export const employeesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listEmployees: builder.query<EmployeeListItem[], EmployeeFilters>({
      query: (filters) => `/employees/?${toQueryString(filters)}`,
      providesTags: ["Employee"],
    }),
    getEmployee: builder.query<EmployeeDetail, number>({
      query: (id) => `/employees/${id}/`,
      providesTags: (_result, _error, id) => [{ type: "Employee", id }],
    }),
    addEmployee: builder.mutation<EmployeeDetail, Partial<EmployeeDetail> & { email: string; full_name: string }>({
      query: (body) => ({ url: "/employees/", method: "POST", body }),
      invalidatesTags: ["Employee", "Dashboard"],
    }),
    updateEmployee: builder.mutation<EmployeeDetail, { id: number } & Record<string, unknown>>({
      query: ({ id, ...body }) => ({ url: `/employees/${id}/`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Employee", id }, "Employee"],
    }),
    deactivateEmployee: builder.mutation<void, number>({
      query: (id) => ({ url: `/employees/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Employee", "Dashboard"],
    }),
  }),
});

export const {
  useListEmployeesQuery,
  useGetEmployeeQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeactivateEmployeeMutation,
} = employeesApi;