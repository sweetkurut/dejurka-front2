import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import themeSlice from "./slices/themeSlice";
import { authApi } from "@/api/authApi";
import { apartmentsApi } from "@/api/apartmentsApi";
import { usersApi } from "@/api/usersApi";
import { directoriesApi } from "@/api/directoriesApi";

export const store = configureStore({
    reducer: {
        auth: authSlice,
        theme: themeSlice,
        [authApi.reducerPath]: authApi.reducer,
        [apartmentsApi.reducerPath]: apartmentsApi.reducer,
        [usersApi.reducerPath]: usersApi.reducer,
        [directoriesApi.reducerPath]: directoriesApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            apartmentsApi.middleware,
            usersApi.middleware,
            directoriesApi.middleware
        ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
