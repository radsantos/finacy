import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { graphqlRequest } from "../services/api";
import { GET_ME, UPDATE_USER } from "../graphql/queries/user";
import { ProfileModal } from "./ProfileModal";
import Logo from "../assets/Logo.png";

type User = {
  id: string;
  email: string;
  name: string;
};

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleUpdateUser = async (updatedUser: Partial<User>) => {
    try {
      const data = await graphqlRequest<{ updateUser: User }>(UPDATE_USER, {
        input: updatedUser,
      });
      setUser(data.updateUser);
      localStorage.setItem("user", JSON.stringify(data.updateUser));
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await graphqlRequest<{ me: User }>(GET_ME);
        setUser(data.me);
        localStorage.setItem("user", JSON.stringify(data.me));
      } catch {
        console.error("Erro ao carregar usuário:");
        const token = localStorage.getItem("token");
        if (!token) {
          localStorage.removeItem("token");
          navigate("/");
        }
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-[Inter]">
      {/* HEADER FIXO */}
      <header className="w-full h-16 bg-white border-b border-[#E5E7EB] sticky top-0 z-10 flex items-center justify-between px-4 sm:px-8">
        <img
          src={Logo}
          alt="Financy"
          className="w-24 sm:w-30 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        />

        <nav className="flex gap-4 sm:gap-6 text-[14px]">
          <span
            className={`cursor-pointer ${
              location.pathname === "/dashboard"
                ? "text-[#1F6343] font-semibold"
                : "text-[#6B7280] hover:text-[#1F6343]"
            }`}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </span>
          <span
            className={`cursor-pointer ${
              location.pathname === "/transactions"
                ? "text-[#1F6343] font-semibold"
                : "text-[#6B7280] hover:text-[#1F6343]"
            }`}
            onClick={() => navigate("/transactions")}
          >
            Transações
          </span>
          <span
            className={`cursor-pointer ${
              location.pathname === "/categories"
                ? "text-[#1F6343] font-semibold"
                : "text-[#6B7280] hover:text-[#1F6343]"
            }`}
            onClick={() => navigate("/categories")}
          >
            Categorias
          </span>
        </nav>

        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1F6343] flex items-center justify-center font-semibold text-white hover:bg-[#154d34] transition-colors"
          title={user?.name || "Usuário"}
        >
          {user ? getUserInitials(user.name) : "U"}
        </button>
      </header>

      {/* CONTEÚDO DINÂMICO */}
      <main className="p-4 sm:p-8">
        <Outlet />
      </main>

      {/* Modal de Perfil */}
      {user && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};
