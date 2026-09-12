import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
}

function loadFromStorage(): AuthState {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem("hr_access_token"),
    refreshToken: localStorage.getItem("hr_refresh_token"),
  };
}

const authSlice = createSlice({
  name: "auth",
  initialState: loadFromStorage(),
  reducers: {
    setCredentials: (state, action: PayloadAction<{ access: string; refresh: string }>) => {
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
      localStorage.setItem("hr_access_token", action.payload.access);
      localStorage.setItem("hr_refresh_token", action.payload.refresh);
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem("hr_access_token");
      localStorage.removeItem("hr_refresh_token");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.accessToken;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;