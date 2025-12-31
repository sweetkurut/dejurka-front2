import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { ConfigProvider, theme, App as AntApp } from "antd";
import ruRU from "antd/locale/ru_RU";
import { store, RootState } from "./store";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import ApartmentForm from "./pages/Apartments/ApartmentForm/ApartmentForm";
import ApartmentDetail from "./pages/Apartments/ApartmentDetail/ApartmentDetail";
import Users from "./pages/Users/Users";
import Profile from "./pages/Profile/Profile";
import Directories from "./pages/Directories/Directories";
import { useGetProfileQuery } from "./api/authApi";

const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { mode } = useSelector((state: RootState) => state.theme);

    useEffect(() => {
        document.documentElement.style.setProperty("--bg-color", mode === "dark" ? "#141414" : "#ffffff");
        document.documentElement.style.setProperty("--bg-secondary", mode === "dark" ? "#1f1f1f" : "#fafafa");
        document.documentElement.style.setProperty(
            "--text-color",
            mode === "dark" ? "#ffffffd9" : "#000000d9"
        );
        document.documentElement.style.setProperty(
            "--text-secondary",
            mode === "dark" ? "#ffffff73" : "#00000073"
        );
        document.documentElement.style.setProperty("--border-color", mode === "dark" ? "#303030" : "#d9d9d9");
    }, [mode]);

    return (
        <ConfigProvider
            locale={ruRU}
            theme={{
                algorithm: mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: "#1890ff",
                    borderRadius: 6,
                },
            }}
        >
            <AntApp>{children}</AntApp>
        </ConfigProvider>
    );
};

const AppRoutes: React.FC = () => {
    const { accessToken } = useSelector((state: RootState) => state.auth);

    // 🔥 всегда вызываем
    const {
        data: profile,
        isLoading,
        isError,
    } = useGetProfileQuery(undefined, {
        skip: !accessToken,
    });

    // 🔥 считаем инициализацию
    const initialized = !accessToken || profile || isError;

    if (!initialized) return <div>Загрузка...</div>;

    return (
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={accessToken ? <Navigate to="/dashboard" replace /> : <Login />}
                />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="apartments" element={<Dashboard />} />
                    <Route path="apartments/:id" element={<ApartmentDetail />} />
                    <Route path="apartments/add" element={<ApartmentForm />} />
                    <Route path="apartments/:id/edit" element={<ApartmentForm />} />
                    <Route path="profile" element={<Profile />} />

                    {/* Только для админа */}
                    <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                        <Route path="users" element={<Users />} />
                        <Route path="directories" element={<Directories />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
};

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <ThemeWrapper>
                <AppRoutes />
            </ThemeWrapper>
        </Provider>
    );
};

export default App;
