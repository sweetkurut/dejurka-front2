// src/components/ProtectedRoute/ProtectedRoute.tsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { Result, Button } from "antd";
import { RootState } from "../../store";

// Define the props for the component
interface ProtectedRouteProps {
    children?: React.ReactNode; // Make children optional
    allowedRoles?: ("admin" | "manager" | "agent")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = ["admin", "agent"] }) => {
    const { user, token } = useSelector((state: RootState) => state.auth);

    // 1. Check if the user is authenticated (has a token)
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    console.log("ProtectedRoute user:", user);

    // 2. If allowedRoles are specified, check if the user's role is in the list
    if (user && allowedRoles && !allowedRoles.includes(user.role)) {
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

    // 3. Render either children or Outlet
    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
