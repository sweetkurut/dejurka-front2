import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface RequireAuthProps {
    children: JSX.Element;
}

export function RequireAuth({ children }: RequireAuthProps) {
    const location = useLocation();
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
