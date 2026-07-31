import {
  useCallback,
  useEffect,
  useState,
} from "react";
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
  onUpdateUser: (
    updatedUser: Partial<User>,
  ) => Promise<void>;
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
  const [isEditing, setIsEditing] =
    useState(false);
  const [isLoading, setIsLoading] =
    useState(false);
  const [
    showConfirmLogout,
    setShowConfirmLogout,
  ] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setIsEditing(false);
      setShowConfirmLogout(false);
    }
  }, [isOpen, user.name]);

  const handleClose =
    useCallback((): void => {
      if (isLoading) {
        return;
      }

      setName(user.name);
      setIsEditing(false);
      setShowConfirmLogout(false);
      onClose();
    }, [isLoading, onClose, user.name]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "Escape" &&
        !showConfirmLogout
      ) {
        handleClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [
    isOpen,
    showConfirmLogout,
    handleClose,
  ]);

  const getUserInitials = (
    fullName: string,
  ): string => {
    if (!fullName.trim()) {
      return "U";
    }

    const names = fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (names.length === 1) {
      return names[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      names[0].charAt(0) +
      names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleCancelEditing = (): void => {
    setName(user.name);
    setIsEditing(false);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      showToast(
        "Por favor, preencha seu nome",
        "error",
      );
      return;
    }

    if (
      normalizedName === user.name.trim()
    ) {
      setIsEditing(false);
      return;
    }

    try {
      setIsLoading(true);

      await onUpdateUser({
        name: normalizedName,
      });

      showToast(
        "Perfil atualizado com sucesso! 🎉",
        "success",
      );

      setIsEditing(false);
    } catch (error) {
      console.error(
        "Erro ao atualizar perfil:",
        error,
      );

      showToast(
        "Erro ao atualizar perfil. Tente novamente.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = (): void => {
    setShowConfirmLogout(true);
  };

  const confirmLogout = (): void => {
    setShowConfirmLogout(false);
    onLogout();
    onClose();
  };

  const cancelLogout = (): void => {
    setShowConfirmLogout(false);
  };

  if (!isOpen) {
    return null;
  }

  const hasNameChanged =
    name.trim() !== user.name.trim();

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={handleClose}
        role="presentation"
      >
        <div
          className="relative max-h-[90vh] w-full max-w-125 overflow-y-auto rounded-2xl bg-white shadow-xl"
          onClick={(event) =>
            event.stopPropagation()
          }
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-title"
        >
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
            <div>
              <h2
                id="profile-modal-title"
                className="text-lg font-semibold text-gray-800 sm:text-xl"
              >
                Meu perfil
              </h2>

              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                Visualize e edite seus dados
                pessoais
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              aria-label="Fechar modal"
              title="Fechar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-4 sm:space-y-6 sm:p-6"
          >
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-[#1F6343] to-[#154d34] text-2xl font-bold text-white shadow-md sm:h-24 sm:w-24 sm:text-3xl">
                {getUserInitials(
                  isEditing
                    ? name
                    : user.name,
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Nome completo
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>

                {isEditing ? (
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#1F6343] sm:py-2.5 sm:pl-10 sm:pr-4 sm:text-base"
                    placeholder="Seu nome completo"
                    disabled={isLoading}
                    autoFocus
                  />
                ) : (
                  <div
                    id="profile-name"
                    className="w-full truncate rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-800 sm:py-2.5 sm:pl-10 sm:pr-4 sm:text-base"
                  >
                    {user.name}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                E-mail
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                  id="profile-email"
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-500 sm:py-2.5 sm:pl-10 sm:pr-4 sm:text-base"
                />
              </div>

              <p className="mt-1 text-xs text-gray-400">
                O e-mail não pode ser alterado
              </p>
            </div>

            <div className="space-y-3 pt-2 sm:pt-4">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setIsEditing(true)
                    }
                    className="w-full rounded-xl bg-[#1F6343] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#154d34] sm:py-3 sm:text-base"
                  >
                    Editar perfil
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 sm:py-3 sm:text-base"
                  >
                    Sair da conta
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 sm:py-3 sm:text-base"
                  >
                    Fechar
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={
                      handleCancelEditing
                    }
                    disabled={isLoading}
                    className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:py-3 sm:text-base"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      !hasNameChanged
                    }
                    className="w-full rounded-xl bg-[#1F6343] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#154d34] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:py-3 sm:text-base"
                  >
                    {isLoading
                      ? "Salvando..."
                      : "Salvar alterações"}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

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