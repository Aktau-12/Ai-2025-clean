import React from "react";
import { Navigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;


interface Props {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: Props) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
