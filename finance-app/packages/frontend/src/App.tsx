import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Resgister";
import { DashboardPage } from "./pages/Dashboard";

function App() {
  const path = window.location.pathname;
  const token = localStorage.getItem("token");

  // rota register
  if (path === "/register") return <RegisterPage />;

  // se estiver logado
  if (token) return <DashboardPage />;

  // se não estiver logado
  return <LoginPage />;
}

export default App;