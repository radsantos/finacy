import Logo from "../../assets/Logo.png";
import wallet from "../../assets/wallet.png";
import receitas from "../../assets/receitas.png";
import despesas from "../../assets/despesas.png";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-[Inter]">
      
      {/* HEADER */}
      <header className="w-full h-[64px] bg-white border-b border-[#E5E7EB] relative flex items-center px-8">

  {/* LOGO (ESQUERDA) */}
  <div>
    <img src={Logo} alt="Financy" className="w-[120px]" />
  </div>

  {/* MENU CENTRAL REAL */}
  <nav className="absolute left-1/2 -translate-x-1/2 flex gap-6 text-[14px]">
    <span className="text-[#1F6343] font-semibold cursor-pointer">
      Dashboard
    </span>
    <span className="text-[#6B7280] cursor-pointer">
      Transações
    </span>
    <span className="text-[#6B7280] cursor-pointer">
      Categorias
    </span>
  </nav>

  {/* USER (DIREITA) */}
  <div className="ml-auto">
    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
      CT
    </div>
  </div>

</header>

      {/* CONTEÚDO */}
      <main className="p-8 flex flex-col gap-6">

        {/* CARDS SUPERIORES */}
        <div className="grid grid-cols-3 gap-6">

          {/* SALDO */}
          <div className="bg-white p-6 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <img src={wallet} alt="wallet" className="w-[20px]" />
              <p className="text-sm text-[#6B7280]">SALDO TOTAL</p>
            </div>
            <h2 className="text-2xl font-bold mt-2">R$ 12.847,32</h2>
          </div>

          {/* RECEITAS */}
          <div className="bg-white p-6 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <img src={receitas} alt="receitas" className="w-[20px]" />
              <p className="text-sm text-[#6B7280]">RECEITAS DO MÊS</p>
            </div>
            <h2 className="text-2xl font-bold mt-2">
              R$ 4.250,00
            </h2>
          </div>

          {/* DESPESAS */}
          <div className="bg-white p-6 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <img src={despesas} alt="despesas" className="w-[20px]" />
              <p className="text-sm text-[#6B7280]">DESPESAS DO MÊS</p>
            </div>
            <h2 className="text-2xl font-bold mt-2 ">
              R$ 2.180,45
            </h2>
          </div>

        </div>

        {/* GRID INFERIOR */}
        <div className="grid grid-cols-3 gap-6">

          {/* TRANSAÇÕES */}
          <div className="col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-6">
            
            <div className="flex justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#6B7280]">
                TRANSAÇÕES RECENTES
              </h3>
              <span className="text-[#1F6343] text-sm cursor-pointer">
                Ver todas
              </span>
            </div>

            <div className="flex flex-col gap-4">

              {[
                {
                  title: "Pagamento de Salário",
                  date: "01/12/25",
                  type: "Receita",
                  value: "+ R$ 4.250,00",
                  color: "text-green-600",
                },
                {
                  title: "Jantar no Restaurante",
                  date: "30/11/25",
                  type: "Alimentação",
                  value: "- R$ 89,50",
                  color: "text-red-600",
                },
                {
                  title: "Posto de Gasolina",
                  date: "29/11/25",
                  type: "Transporte",
                  value: "- R$ 100,00",
                  color: "text-red-600",
                },
                {
                  title: "Compras no Mercado",
                  date: "28/11/25",
                  type: "Mercado",
                  value: "- R$ 156,80",
                  color: "text-red-600",
                },
                {
                  title: "Retorno de Investimento",
                  date: "26/11/25",
                  type: "Investimento",
                  value: "+ R$ 340,25",
                  color: "text-green-600",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b pb-3 last:border-none"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <span className="text-sm text-[#6B7280]">
                      {item.date}
                    </span>
                  </div>

                  <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                    {item.type}
                  </span>

                  <span className={`font-semibold ${item.color}`}>
                    {item.value}
                  </span>
                </div>
              ))}

            </div>

            <button className="mt-4 text-[#1F6343] text-sm font-medium">
              + Nova transação
            </button>
          </div>

          {/* CATEGORIAS */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            
            <div className="flex justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#6B7280]">
                CATEGORIAS
              </h3>
              <span className="text-[#1F6343] text-sm cursor-pointer">
                Gerenciar
              </span>
            </div>

            <div className="flex flex-col gap-4">

              {[
                { name: "Alimentação", value: "R$ 542,30" },
                { name: "Transporte", value: "R$ 385,50" },
                { name: "Mercado", value: "R$ 298,75" },
                { name: "Entretenimento", value: "R$ 186,20" },
                { name: "Utilidades", value: "R$ 245,80" },
              ].map((cat, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm">{cat.name}</span>
                  <span className="font-medium">{cat.value}</span>
                </div>
              ))}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export { DashboardPage };