import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Directory } from '../../types';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/directories',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const directoriesApi = createApi({
  reducerPath: 'directoriesApi',
  baseQuery,
  tagTypes: ['Directory'],
  endpoints: (builder) => ({
    getDirectories: builder.query<Directory[], string | undefined>({
      query: (type) => ({
        url: '/',
        params: type ? { type } : {},
      }),
      providesTags: ['Directory'],
    }),
    createDirectory: builder.mutation<Directory, Partial<Directory>>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Directory'],
    }),
    updateDirectory: builder.mutation<Directory, { id: string; data: Partial<Directory> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Directory'],
    }),
    deleteDirectory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Directory'],
    }),
  }),
});

export const {
  useGetDirectoriesQuery,
  useCreateDirectoryMutation,
  useUpdateDirectoryMutation,
  useDeleteDirectoryMutation,
} = directoriesApi;