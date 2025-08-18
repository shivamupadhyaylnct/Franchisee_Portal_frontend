import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthorization, getUserType } from "./ApiCore";

const ProtectedRoute = ({ allowedRoles }) => {
    const authData = getAuthorization();
    const roleData = getUserType()
    const token = authData ? authData : "";
    const role = roleData ? roleData.toLowerCase() : "";

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;