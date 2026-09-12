import { apiSlice } from "./apiSlice";
import type { Department } from "../types";

export const departmentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listDepartments: builder.query<Department[], void>({
      query: () => "/departments/",
      providesTags: ["Department"],
    }),
    createDepartment: builder.mutation<Department, { name: string; description?: string }>({
      query: (body) => ({ url: "/departments/", method: "POST", body }),
      invalidatesTags: ["Department"],
    }),
    updateDepartment: builder.mutation<Department, { id: number; name: string; description?: string }>({
      query: ({ id, ...body }) => ({ url: `/departments/${id}/`, method: "PATCH", body }),
      invalidatesTags: ["Department"],
    }),
    deleteDepartment: builder.mutation<void, number>({
      query: (id) => ({ url: `/departments/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Department"],
    }),
  }),
});

export const {
  useListDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentsApi;