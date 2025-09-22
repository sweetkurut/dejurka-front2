// AdminRoute.tsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../store";

const AdminRoute: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    // Если у пользователя роль "admin", рендерим дочерний маршрут (Outlet)
    if (user?.role === "admin") {
        return <Outlet />;
    }

    // В противном случае перенаправляем на дашборд или страницу с ошибкой
    return <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
