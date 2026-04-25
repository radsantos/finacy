// routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Retorna Outlet para renderizar as rotas filhas
  return <Outlet />;
};
