import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { Result, Button } from "antd";
import { RootState } from "../../store";

interface ProtectedRouteProps {
    children?: React.ReactNode;
    allowedRoles?: ("admin" | "agent")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = ["admin", "agent"] }) => {
    const { user, accessToken, initialized } = useSelector((state: RootState) => state.auth);

    // 🔥 если инициализация не завершена — показываем загрузку
    if (!initialized) {
        return <div>Загрузка...</div>;
    }

    // 🔥 если нет токена — редирект на login
    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    // 🔥 если роль не разрешена
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return (
            <Result
                status="403"
                title="403"
                subTitle="У вас нет прав доступа к этой странице"
                extra={
                    <Button type="primary" onClick={() => window.history.back()}>
                        Назад
                    </Button>
                }
            />
        );
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
