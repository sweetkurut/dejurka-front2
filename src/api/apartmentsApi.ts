import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Apartment, ApartmentFilters } from "../types";

const baseQuery = fetchBaseQuery({
    baseUrl: "/api/apartments",
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as any).auth.token;
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

export const apartmentsApi = createApi({
    reducerPath: "apartmentsApi",
    baseQuery,
    tagTypes: ["Apartment"],
    endpoints: (builder) => ({
        getApartments: builder.query<
            { apartments: Apartment[]; total: number },
            {
                page?: number;
                limit?: number;
                filters?: ApartmentFilters;
            }
        >({
            query: ({ page = 1, limit = 20, filters = {} }) => ({
                url: "/",
                params: { page, limit, ...filters },
            }),
            providesTags: ["Apartment"],
        }),
        getApartment: builder.query<Apartment, string>({
            query: (id) => `/${id}`,
            providesTags: ["Apartment"],
        }),
        createApartment: builder.mutation<Apartment, Partial<Apartment>>({
            query: (data) => ({
                url: "/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Apartment"],
        }),
        updateApartment: builder.mutation<Apartment, { id: string; data: Partial<Apartment> }>({
            query: ({ id, data }) => ({
                url: `/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Apartment"],
        }),
        deleteApartment: builder.mutation<void, string>({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Apartment"],
        }),
    }),
});

export const {
    useGetApartmentsQuery,
    useGetApartmentQuery,
    useCreateApartmentMutation,
    useUpdateApartmentMutation,
    useDeleteApartmentMutation,
} = apartmentsApi;
