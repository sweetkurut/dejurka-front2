import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { LoginRequest, User } from "../types";
import { loginSuccess, logout } from "@/store/slices/authSlice";

const baseQuery = fetchBaseQuery({
    baseUrl: "http://localhost:3000/auth",
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as any).auth.accessToken;
        if (token) headers.set("authorization", `Bearer ${token}`);
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const refreshToken = (api.getState() as any).auth.refreshToken;
        const refreshResult = await baseQuery(
            {
                url: "/refresh",
                method: "POST",
                body: { refreshToken },
            },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            const newTokens = refreshResult.data as { accessToken: string; refreshToken: string };
            api.dispatch(loginSuccess({ ...((api.getState() as any).auth.user ?? {}), ...newTokens }));
            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(logout());
        }
    }

    return result;
};

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["User"],
    endpoints: (builder) => ({
        login: builder.mutation<{ user: User; accessToken: string; refreshToken: string }, LoginRequest>({
            query: (credentials) => ({
                url: "/login",
                method: "POST",
                body: credentials,
            }),
        }),
        getProfile: builder.query<User, void>({
            query: () => "/profile",
            providesTags: ["User"],
        }),
        updateProfile: builder.mutation<User, Partial<User>>({
            query: (updates) => ({
                url: "/profile",
                method: "PATCH",
                body: updates,
            }),
            invalidatesTags: ["User"],
        }),
    }),
});

export const { useLoginMutation, useGetProfileQuery, useUpdateProfileMutation } = authApi;
