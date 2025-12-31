/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Directory } from "../types";

const baseQuery = fetchBaseQuery({
    baseUrl: "http://localhost:3000/references",
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as any).auth.accessToken;
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

export const directoriesApi = createApi({
    reducerPath: "directoriesApi",
    baseQuery,
    tagTypes: ["Directory"],
    endpoints: (builder) => ({
        getDirectories: builder.query<Directory[], string | undefined>({
            query: (type) => (type ? `/${type}` : "/"),
            providesTags: ["Directory"],
        }),
        createDirectory: builder.mutation<Directory, { type: string; data: Partial<Directory> }>({
            query: ({ type, data }) => ({
                url: `/${type}`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Directory"],
        }),

        updateDirectory: builder.mutation<Directory, { type: string; id: string; data: Partial<Directory> }>({
            query: ({ type, id, data }) => ({
                url: `/${type}/${id}`, // <-- type должен быть, например, "series", "district", "roomcount"
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Directory"],
        }),

        deleteDirectory: builder.mutation<void, { type: string; id: string }>({
            query: ({ type, id }) => ({
                url: `/${type}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Directory"],
        }),
    }),
});

export const {
    useGetDirectoriesQuery,
    useCreateDirectoryMutation,
    useUpdateDirectoryMutation,
    useDeleteDirectoryMutation,
} = directoriesApi;
