import React, { useState } from "react";
import { graphqlRequest } from "../../services/api";
import { REGISTER_MUTATION } from "../../graphql/mutations/auth";
import Logo from "../../assets/Logo.png";
import { IconEyelashOpen } from "../../components/icons/EyeOpen";
import { IconEyelashClosed } from "../../components/icons/EyeClosed";
import EntrarIcon from "../../assets/entrar.svg";

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleRegister(e: React.FormEvent) {
  e.preventDefault();

  try {
    setLoading(true);

    const data = await graphqlRequest<{
      register: { token: string };
    }>(REGISTER_MUTATION, {
      input: { name, email, password },
    });

    // sucesso
    setSuccessMessage("Conta criada com sucesso!");
    setErrorMessage("");

    // limpar campos
    setName("");
    setEmail("");
    setPassword("");

    // salvar token
    localStorage.setItem("token", data.register.token);

    // redirect com delay
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);

  } catch (error: unknown) {
    if (error instanceof Error) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage("Erro ao criar conta");
    }
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4 font-[Inter]">
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
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[44px] pl-4 pr-10 border border-[#D1D5DB] rounded-[8px] text-[14px] focus:outline-none focus:border-[#1F6343]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <IconEyelashOpen /> : <IconEyelashClosed />}
              </button>
            </div>

            {/* TEXTO CORRETO */}
            <p className="text-[12px] text-[#6B7280] mt-1">
              A senha deve ter no mínimo 8 caracteres
            </p>
          </div>

          {/* BOTÃO */}
          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] bg-[#1F6343] text-white text-[16px] font-semibold rounded-[12px] mt-2 disabled:opacity-50"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>

          {/* ERRO */}
          {errorMessage && (
            <p className="text-red-500 text-sm mt-2 text-center">
              {errorMessage}
            </p>
          )}

          {/* SUCESSO */}
          {successMessage && (
            <p className="text-green-600 text-sm mt-2 text-center font-medium">
              {successMessage}
            </p>
          )}
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
