import { apiSlice } from "./apiSlice";
import type { LeaveRequest } from "../types";

export const leaveApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listLeaveRequests: builder.query<LeaveRequest[], void>({
      query: () => "/leave-redashboardApi.tsquests/",
      providesTags: ["Leave"],
    }),
    submitLeaveRequest: builder.mutation<LeaveRequest, { start_date: string; end_date: string; reason: string }>({
      query: (body) => ({ url: "/leave-requests/", method: "POST", body }),
      invalidatesTags: ["Leave", "Dashboard"],
    }),
    approveLeaveRequest: builder.mutation<LeaveRequest, number>({
      query: (id) => ({ url: `/leave-requests/${id}/approve/`, method: "POST" }),
      invalidatesTags: ["Leave", "Employee", "Dashboard"],
    }),
    rejectLeaveRequest: builder.mutation<LeaveRequest, number>({
      query: (id) => ({ url: `/leave-requests/${id}/reject/`, method: "POST" }),
      invalidatesTags: ["Leave", "Employee", "Dashboard"],
    }),
  }),
});

export const {
  useListLeaveRequestsQuery,
  useSubmitLeaveRequestMutation,
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
} = leaveApi;