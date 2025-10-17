import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginRequest, User } from "../types";

const baseQuery = fetchBaseQuery({
    baseUrl: "/api/auth",
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as any).auth.token;
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery,
    tagTypes: ["User"],
    endpoints: (builder) => ({
        login: builder.mutation<{ user: User; token: string }, LoginRequest>({
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
