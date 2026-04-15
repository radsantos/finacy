import React, { useState } from "react";
import { graphqlRequest } from "../../services/api";
import { LOGIN_MUTATION } from "../../graphql/mutations/auth";
import Logo from "../../assets/Logo.png";
import { IconEyelashOpen } from "../../components/icons/EyeOpen";
import { IconEyelashClosed } from "../../components/icons/EyeClosed";
import AdicionarIcon from "../../assets/adicionar.svg";

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);

    try {
      setLoading(true);

      const data = await graphqlRequest<{ login: { token: string } }>(
        LOGIN_MUTATION,
        { input: { email, password } },
      );

      localStorage.setItem("token", data.login.token);
      window.location.href = "/Dashboard";
    } catch {
      alert("E-mail ou senha inválidos");
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
      <div className="w-[448px] bg-white border border-[#E5E7EB] rounded-[12px] shadow-sm p-8 flex flex-col justify-between">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h2 className="text-[20px] font-semibold text-[#111827]">
            Fazer login
          </h2>
          <p className="text-[16px] text-[#4B5563] mt-1">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* EMAIL */}
          <div>
            <label className="text-[14px] font-medium text-[#374151]">
              E-mail
            </label>

            <div className="relative mt-1">
              <input
                type="email"
                placeholder="mail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[44px] pl-4 pr-4 border border-[#D1D5DB] rounded-[8px] text-[14px] focus:outline-none focus:border-[#1F6343]"
              />
            </div>
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

              {/* ÍCONE OLHO */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <IconEyelashOpen /> : <IconEyelashClosed />}
              </button>
            </div>
          </div>

          {/* AÇÕES */}
          <div className="flex items-center justify-between text-[14px] mt-1">
            <label className="flex items-center gap-2 text-[#4B5563]">
              <input type="checkbox" className="w-4 h-4 border-[#D1D5DB]" />
              Lembrar-me
            </label>

            <a href="#" className="text-[#1F6343] font-medium">
              Recuperar senha
            </a>
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] bg-[#1F6343] text-white text-[16px] font-semibold rounded-[12px] mt-2 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
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
          <p className="text-[14px] text-[#6B7280]">Ainda não tem uma conta?</p>

          <button
            onClick={() => (window.location.href = "/register")}
            className="mt-3 w-full h-[48px] border border-[#D1D5DB] rounded-[12px] text-[#374151] font-semibold hover:bg-gray-50"
          >
            <img src={AdicionarIcon} alt="Entrar" className="w-5" />
            Criar conta
          </button>
        </div>
      </div>
    </div>
  );
};

export { LoginPage };
