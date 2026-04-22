import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Resgister";
import { DashboardPage } from "./pages/Dashboard";
import { TransactionsPage } from "./pages/Transactions";
import { ProtectedRoute } from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/" element={<LoginPage />} />

      {/* REGISTER */}
      <Route path="/register" element={<RegisterPage />} />

      {/* DASHBOARD PROTEGIDO */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* TRANSAÇÕES PROTEGIDO */}
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <TransactionsPage />
          </ProtectedRoute>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
