import { createApi } from "@reduxjs/toolkit/query/react";
import axios, { AxiosError } from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { RootState } from "./store";

interface TokenPair {
  access: string;
  refresh: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AcceptInviteRequest {
  token: string;
  password: string;
}

interface AxiosBaseQueryError {
  status?: number;
  data?: unknown;
}

const axiosBaseQuery =({ baseUrl }: { baseUrl: string } = { baseUrl: "" }): BaseQueryFn<
    {
      url: string;
      method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      data?: unknown;
    },
    unknown,
    AxiosBaseQueryError
  > =>
  async ({ url, method, data }, { getState }) => {
    try {
      const token = (getState() as RootState).auth.accessToken;

      const response = await axios({
        baseURL: baseUrl,
        url,
        method,
        data,
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      return {
        data: response.data,
      };
    } catch (error) {
      const err = error as AxiosError;

      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const authApi = createApi({
  reducerPath: "authApi",

  baseQuery: axiosBaseQuery({
    baseUrl:
      import.meta.env.VITE_API_BASE_URL ??
      "http://localhost:8000/auth",
  }),

  endpoints: (builder) => ({
    login: builder.mutation<TokenPair, LoginRequest>({
      query: (credentials) => ({
        url: "/login/",
        method: "POST",
        data: credentials,
      }),
    }),

    acceptInvite: builder.mutation<
      { detail: string },
      AcceptInviteRequest
    >({
      query: (payload) => ({
        url: "/invite/accept/",
        method: "POST",
        data: payload,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useAcceptInviteMutation,
} = authApi;