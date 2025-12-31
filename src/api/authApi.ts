/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { LoginRequest, User } from "../types";
import { authInitialized, loginSuccess, logout } from "@/store/slices/authSlice";

/* ================= BASE QUERY ================= */

const baseQuery = fetchBaseQuery({
    baseUrl: "http://localhost:3000",
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as any).auth.accessToken;
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

/* ================= BASE QUERY WITH REFRESH ================= */

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
        const refreshToken = (api.getState() as any).auth.refreshToken;

        if (!refreshToken) {
            api.dispatch(logout());
            return result;
        }

        const refreshResult = await baseQuery(
            {
                url: "/auth/refresh",
                method: "POST",
                body: { refreshToken },
            },
            api,
            extraOptions
        );

        if (!refreshResult.data) {
            api.dispatch(logout());
            return result;
        }

        const { accessToken, refreshToken: newRefreshToken } = refreshResult.data as {
            accessToken: string;
            refreshToken: string;
        };

        // 🔥 ПОЛУЧАЕМ ПРОФИЛЬ С НОВЫМ ТОКЕНОМ
        const profileResult = await baseQuery(
            {
                url: "/users/profile",
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            api,
            extraOptions
        );

        if (!profileResult.data) {
            api.dispatch(logout());
            return result;
        }

        api.dispatch(
            loginSuccess({
                user: profileResult.data as User,
                accessToken,
                refreshToken: newRefreshToken,
            })
        );

        // повторяем исходный запрос
        result = await baseQuery(args, api, extraOptions);
    }

    return result;
};

/* ================= API ================= */

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["User"],
    endpoints: (builder) => ({
        /* ===== LOGIN ===== */
        login: builder.mutation<{ user: User; accessToken: string; refreshToken: string }, LoginRequest>({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
        }),

        /* ===== GET PROFILE ===== */
        getProfile: builder.query<User, void>({
            query: () => "/users/profile",
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;

                    dispatch(
                        loginSuccess({
                            user: data,
                            accessToken: localStorage.getItem("accessToken")!,
                            refreshToken: localStorage.getItem("refreshToken")!,
                        })
                    );
                } catch {
                    // ignore
                } finally {
                    dispatch(authInitialized()); // 🔥 обязательно
                }
            },
            providesTags: ["User"],
        }),

        /* ===== UPDATE PROFILE ===== */
        updateProfile: builder.mutation<User, Partial<User>>({
            query: (updates) => ({
                url: "/users/profile",
                method: "PATCH",
                body: updates,
            }),
            invalidatesTags: ["User"],
        }),
    }),
});

export const { useLoginMutation, useGetProfileQuery, useUpdateProfileMutation } = authApi;
