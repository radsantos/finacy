import React, { useState } from "react";
import { graphqlRequest } from "../../services/api";
import { REGISTER_MUTATION } from "../../graphql/mutations/auth";
import { useToast } from "../../hooks/useToast";
import { Toast } from "../../components/Toast";
import Logo from "../../assets/Logo.png";
import { IconEyelashOpen } from "../../components/icons/EyeOpen";
import { IconEyelashClosed } from "../../components/icons/EyeClosed";
import EntrarIcon from "../../assets/entrar.svg";

const RegisterPage: React.FC = () => {
  const { toast, showToast, hideToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validatePassword = (pass: string) => {
    if (pass.length < 8) {
      setPasswordError("A senha deve ter no mínimo 8 caracteres");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (pass: string, confirm: string) => {
    if (confirm && pass !== confirm) {
      setConfirmPasswordError("As senhas não coincidem");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
    if (confirmPassword) {
      validateConfirmPassword(newPassword, confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    validateConfirmPassword(password, newConfirmPassword);
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    // Validações antes de enviar
    if (!validatePassword(password)) {
      showToast("A senha deve ter no mínimo 8 caracteres", "error");
      return;
    }

    if (!validateConfirmPassword(password, confirmPassword)) {
      showToast("As senhas não coincidem", "error");
      return;
    }

    try {
      setLoading(true);

      const data = await graphqlRequest<{
        register: { token: string };
      }>(REGISTER_MUTATION, {
        input: { name, email, password },
      });

      // salvar token
      localStorage.setItem("token", data.register.token);

      showToast("Conta criada com sucesso!", "success");

      // redirect com delay
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("Erro ao criar conta", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4 font-[Inter]">
      {toast.isOpen && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* LOGO */}
      <div className="mb-10">
        <img src={Logo} alt="Financy" className="w-[134px]" />
      </div>

      {/* CARD */}
      <div className="w-[448px] min-h-[620px] bg-white border border-[#E5E7EB] rounded-[12px] shadow-sm p-8 flex flex-col justify-between">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h2 className="text-[20px] font-semibold text-[#111827]">
            Criar conta
          </h2>
          <p className="text-[16px] text-[#4B5563] mt-1">
            Comece a controlar suas finanças ainda hoje
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* NOME */}
          <div>
            <label className="text-[14px] font-medium text-[#374151]">
              Nome completo
            </label>
            <input
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-[44px] mt-1 px-4 border border-[#D1D5DB] rounded-[8px] text-[14px] focus:outline-none focus:border-[#1F6343]"
              required
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-[14px] font-medium text-[#374151]">
              E-mail
            </label>
            <input
              type="email"
              placeholder="mail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[44px] mt-1 px-4 border border-[#D1D5DB] rounded-[8px] text-[14px] focus:outline-none focus:border-[#1F6343]"
              required
            />
          </div>

          {/* SENHA */}
          <div>
            <label className="text-[14px] font-medium text-[#374151]">
              Senha
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={handlePasswordChange}
                className="w-full h-[44px] pl-4 pr-10 border border-[#D1D5DB] rounded-[8px] text-[14px] focus:outline-none focus:border-[#1F6343]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <IconEyelashOpen /> : <IconEyelashClosed />}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
            {!passwordError && (
              <p className="text-[12px] text-[#6B7280] mt-1">
                A senha deve ter no mínimo 8 caracteres
              </p>
            )}
          </div>

          {/* CONFIRMAR SENHA */}
          <div>
            <label className="text-[14px] font-medium text-[#374151]">
              Confirmar senha
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="w-full h-[44px] pl-4 pr-10 border border-[#D1D5DB] rounded-[8px] text-[14px] focus:outline-none focus:border-[#1F6343]"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <IconEyelashOpen />
                ) : (
                  <IconEyelashClosed />
                )}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="text-red-500 text-xs mt-1">
                {confirmPasswordError}
              </p>
            )}
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading || !!passwordError || !!confirmPasswordError}
            className="w-full h-[48px] bg-[#1F6343] text-white text-[16px] font-semibold rounded-[12px] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        {/* DIVISOR */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-[1px] bg-[#D1D5DB]" />
          <span className="text-[14px] text-[#6B7280]">ou</span>
          <div className="flex-1 h-[1px] bg-[#D1D5DB]" />
        </div>

        {/* FOOTER */}
        <div className="text-center">
          <p className="text-[14px] text-[#6B7280]">Já tem uma conta?</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-3 w-full h-[48px] border border-[#D1D5DB] rounded-[12px] text-[#374151] font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <img src={EntrarIcon} alt="Entrar" className="w-5" />
            Fazer login
          </button>
        </div>
      </div>
    </div>
  );
};

export { RegisterPage };
