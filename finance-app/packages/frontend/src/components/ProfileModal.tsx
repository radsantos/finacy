// components/ProfileModal.tsx
import { useState, useEffect } from "react";
import { useToast } from "../hooks/useToast";
import { ConfirmModal } from "./ConfirmModal";

type User = {
  id: string;
  name: string;
  email: string;
};

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (updatedUser: Partial<User>) => Promise<void>;
  onLogout: () => void;
};

export const ProfileModal = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
}: ProfileModalProps) => {
  const { showToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email] = useState(user.email);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  // Função para pegar as iniciais do nome
  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setIsEditing(false);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Por favor, preencha seu nome", "error");
      return;
    }

    try {
      setIsLoading(true);
      await onUpdateUser({ name: name.trim() });
      showToast("Perfil atualizado com sucesso! 🎉", "success");
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      showToast("Erro ao atualizar perfil. Tente novamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setShowConfirmLogout(true);
  };

  const confirmLogout = () => {
    onLogout();
    onClose();
  };

  const cancelLogout = () => {
    setShowConfirmLogout(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="sticky top-0 bg-white h-2"></div>

          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 space-y-4 sm:space-y-6"
          >
            {/* Avatar com duas letras */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#1F6343] to-[#154d34] rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                  {getUserInitials(user.name)}
                </div>
              </div>
            </div>

            {/* Nome com ícone de usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo
              </label>
              {isEditing ? (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F6343] focus:border-transparent"
                    placeholder="Seu nome completo"
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl bg-gray-50 text-gray-800 truncate">
                    {user.name}
                  </div>
                </div>
              )}
            </div>

            {/* E-mail com ícone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                O e-mail não pode ser alterado
              </p>
            </div>

            {/* Botões */}
            <div className="space-y-3 pt-4">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2.5 sm:py-3 bg-[#1F6343] text-white font-semibold rounded-xl text-sm sm:text-base hover:bg-[#154d34] transition-colors"
                  >
                    Editar perfil
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2.5 sm:py-3 bg-red-50 text-red-600 font-semibold rounded-xl text-sm sm:text-base hover:bg-red-100 transition-colors border border-red-200"
                  >
                    Sair da conta
                  </button>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name);
                    }}
                    className="w-full sm:flex-1 py-2.5 sm:py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm sm:text-base hover:bg-gray-200 transition-colors"
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || name === user.name}
                    className="w-full sm:flex-1 py-2.5 sm:py-3 bg-[#1F6343] text-white font-semibold rounded-xl text-sm sm:text-base hover:bg-[#154d34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmação de logout */}
      <ConfirmModal
        isOpen={showConfirmLogout}
        title="Sair da conta"
        message="Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar seus dados."
        confirmText="Sair"
        cancelText="Cancelar"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        type="danger"
      />
    </>
  );
};
