import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {  User } from "../../types";

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;
    initialized: boolean; // 🔥 добавили
}

const initialState: AuthState = {
    user: null,
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
    isLoading: false,
    error: null,
    initialized: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        loginSuccess: (
            state,
            action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
        ) => {
            state.isLoading = false;
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            localStorage.setItem("accessToken", action.payload.accessToken);
            localStorage.setItem("refreshToken", action.payload.refreshToken);
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        },
        authInitialized: (state) => {
            state.initialized = true;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, authInitialized } = authSlice.actions;
export default authSlice.reducer;
