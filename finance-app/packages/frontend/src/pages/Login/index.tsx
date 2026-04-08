import React, { useState } from 'react';
import Logo from '../../assets/Logo.png';

// --- Ícones ---
const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);

const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

const IconEyelashClosed = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 13C15.5 15.5 13.5 16.5 12 16.5C10.5 16.5 8.5 15.5 6.5 13" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 16.5V19" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15.5 15.5L17.5 17.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8.5 15.5L6.5 17.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconEyelashOpen = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 11C15.5 8.5 13.5 7.5 12 7.5C10.5 7.5 8.5 8.5 6.5 11" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 7.5V5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15.5 8.5L17.5 6.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8.5 8.5L6.5 6.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconUserPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
);

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 font-sans antialiased">
      
      <div className="mb-10">
        <img src={Logo} alt="Logo" className="w-[134px] h-[32px] object-contain" />
      </div>

      {/* Card Principal: 448px x 582px */}
      <div 
        className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm flex flex-col justify-between"
        style={{ width: '448px', height: '582px', padding: '32px', boxSizing: 'border-box' }}
      >
        
        <div className="w-full flex flex-col">
          <div className="w-full text-center flex flex-col items-center mb-8">
            <h2 className="text-[20px] font-bold text-[#111827] leading-[28px] m-0">Fazer login</h2>
            <p className="text-[16px] font-normal text-[#4B5563] leading-[24px] mt-[4px] m-0">
              Entre na sua conta para continuar
            </p>
          </div>

          <form className="w-full flex flex-col" style={{ gap: '16px' }} onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[14px] font-semibold text-[#374151]">E-mail</label>
              <div className="relative w-full">
                <span className="absolute left-[14px] top-1/2 -translate-y-1/2 flex items-center text-[#9CA3AF]">
                  <IconMail />
                </span>
                <input
                  type="email"
                  placeholder="mail@exemplo.com"
                  className="w-full pl-[44px] pr-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] focus:outline-none focus:border-[#1F6343] text-[16px] box-border"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[14px] font-semibold text-[#374151]">Senha</label>
              <div className="relative w-full">
                <span className="absolute left-[14px] top-1/2 -translate-y-1/2 flex items-center text-[#9CA3AF]">
                  <IconLock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  className="w-full pl-[44px] pr-[44px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] focus:outline-none focus:border-[#1F6343] text-[16px] box-border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[14px] top-1/2 -translate-y-1/2 flex items-center bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? <IconEyelashOpen /> : <IconEyelashClosed />}
                </button>
              </div>
            </div>

            <div className="w-full flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-[#D1D5DB]" />
                <span className="text-[14px] text-[#4B5563]">Lembrar-me</span>
              </label>
              <a href="#" className="text-[14px] font-medium text-[#1F6343] no-underline hover:text-[#164a32]">
                Recuperar senha
              </a>
            </div>

            <button
              type="submit"
              className="w-full h-[48px] mt-4 bg-[#1F6343] text-white text-[16px] font-bold rounded-[12px] flex items-center justify-center border-none cursor-pointer transition-all"
              style={{ color: '#FFFFFF' }}
            >
              Entrar
            </button>
          </form>
        </div>

        {/* Rodapé do Card: Divisória Dupla 170.5 x 1 */}
        <div className="w-full flex flex-col" style={{ gap: '16px' }}>
          
          {/* Container da Divisória: Alinhamento centralizado com as duas linhas */}
          <div className="w-full flex items-center justify-between gap-3">
            {/* Linha Esquerda: 170.5 x 1 */}
            <div className="flex-1 h-[1px] bg-[#D1D5DB]" style={{ maxWidth: '170.5px' }}></div>
            
            {/* Texto Central */}
            <span className="text-[#6B7280] text-[14px] font-medium leading-none">ou</span>
            
            {/* Linha Direita: 170.5 x 1 */}
            <div className="flex-1 h-[1px] bg-[#D1D5DB]" style={{ maxWidth: '170.5px' }}></div>
          </div>

          <div className="w-full flex flex-col items-center" style={{ gap: '12px' }}>
            <p className="text-[14px] text-[#6B7280] m-0">Ainda não tem uma conta?</p>
            <button className="w-full h-[48px] flex items-center justify-center gap-2 border border-[#D1D5DB] bg-white rounded-[12px] text-[#374151] font-bold cursor-pointer hover:bg-gray-50 transition-colors">
              <IconUserPlus />
              Criar conta
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export { LoginPage };