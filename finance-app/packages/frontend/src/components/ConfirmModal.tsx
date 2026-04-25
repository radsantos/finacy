// components/ConfirmModal.tsx
import { useEffect } from "react";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
};

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = "Sair",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  type = "danger",
}: ConfirmModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "🚪",
          iconBg: "bg-red-100",
          iconText: "text-red-600",
          buttonBg: "bg-red-600 hover:bg-red-700",
        };
      case "warning":
        return {
          icon: "⚠️",
          iconBg: "bg-yellow-100",
          iconText: "text-yellow-600",
          buttonBg: "bg-yellow-600 hover:bg-yellow-700",
        };
      case "info":
        return {
          icon: "ℹ️",
          iconBg: "bg-blue-100",
          iconText: "text-blue-600",
          buttonBg: "bg-blue-600 hover:bg-blue-700",
        };
      default:
        return {
          icon: "🚪",
          iconBg: "bg-red-100",
          iconText: "text-red-600",
          buttonBg: "bg-red-600 hover:bg-red-700",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-[400px] shadow-xl">
        <div className="p-4 sm:p-6">
          {/* Ícone */}
          <div className="flex justify-center mb-4">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${styles.iconBg} flex items-center justify-center`}
            >
              <span className={`text-xl sm:text-2xl ${styles.iconText}`}>
                {styles.icon}
              </span>
            </div>
          </div>

          {/* Título */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 text-center mb-2">
            {title}
          </h3>

          {/* Mensagem */}
          <p className="text-xs sm:text-sm text-gray-500 text-center mb-6">
            {message}
          </p>

          {/* Botões responsivos */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onCancel}
              className="w-full sm:flex-1 py-2 sm:py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg text-sm sm:text-base order-2 sm:order-1"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`w-full sm:flex-1 py-2 sm:py-2.5 text-white font-medium rounded-lg text-sm sm:text-base order-1 sm:order-2 ${styles.buttonBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
