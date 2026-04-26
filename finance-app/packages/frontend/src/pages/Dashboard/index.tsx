import { useEffect, useState } from "react";
import { graphqlRequest } from "../../services/api";
import { GET_DASHBOARD } from "../../graphql/queries/dashboard";
import { NewTransactionModal } from "../../components/NewTransactionModal";
import { CategoryList } from "../../components/CategoryList";
import { getIconByKey, getColorClass, getIconBgColor } from "../../utils/icons";
import wallet from "../../assets/wallet.png";
import receitas from "../../assets/receitas.png";
import despesas from "../../assets/despesas.png";
import chevron from "../../assets/chevron.png";

type Category = {
  id: string;
  name: string;
  color?: string;
  icon?: string;
};

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: Category;
  date: string;
};

type DashboardData = {
  balance: number;
  incomes: number;
  expenses: number;
  transactions: Transaction[];
};

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);

  const formatDate = (dateString: string | number) => {
    if (!dateString) return "Data não informada";
    try {
      if (typeof dateString === "string" && dateString.includes("T")) {
        const [year, month, day] = dateString.split("T")[0].split("-");
        return `${day}/${month}/${year.slice(-2)}`;
      }

      let date: Date;
      if (typeof dateString === "number") {
        date = new Date(dateString);
      } else if (typeof dateString === "string") {
        if (/^\d+$/.test(dateString)) {
          date = new Date(parseInt(dateString));
        } else {
          date = new Date(dateString);
        }
      } else {
        return "Data inválida";
      }

      if (isNaN(date.getTime())) return "Data inválida";

      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear().toString().slice(-2);
      return `${day}/${month}/${year}`;
    } catch {
      return "Erro na data";
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "0,00";
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await graphqlRequest<{ dashboard: DashboardData }>(
          GET_DASHBOARD,
        );
        setDashboard(data.dashboard);
        setMonthlyIncome(data.dashboard.incomes || 0);
        setMonthlyExpense(data.dashboard.expenses || 0);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F6343] mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const allTransactions = dashboard?.transactions || [];

  return (
    <>
      {/* TRÊS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-8">
        {/* Card Saldo Total */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={wallet}
              className="w-4 h-4 sm:w-5 sm:h-5"
              alt="carteira"
            />
            <p className="text-xs sm:text-sm text-[#6B7280] font-medium">
              SALDO TOTAL
            </p>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
            R$ {formatCurrency(dashboard?.balance)}
          </h2>
        </div>

        {/* Card Receitas do Mês */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={receitas}
              className="w-4 h-4 sm:w-5 sm:h-5"
              alt="receitas"
            />
            <p className="text-xs sm:text-sm text-[#6B7280] font-medium">
              RECEITAS DO MÊS
            </p>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-600 break-words">
            R$ {formatCurrency(monthlyIncome)}
          </h2>
        </div>

        {/* Card Despesas do Mês */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={despesas}
              className="w-4 h-4 sm:w-5 sm:h-5"
              alt="despesas"
            />
            <p className="text-xs sm:text-sm text-[#6B7280] font-medium">
              DESPESAS DO MÊS
            </p>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 break-words">
            R$ {formatCurrency(monthlyExpense)}
          </h2>
        </div>
      </div>

      {/* Grid principal: Transações e Categorias */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        {/* TRANSAÇÕES RECENTES */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-xs sm:text-sm font-semibold text-[#6B7280] tracking-wider">
                TRANSAÇÕES RECENTES
              </h3>
              <div className="flex items-center gap-2 text-[#1F6343] text-xs sm:text-sm cursor-pointer hover:opacity-80 transition-opacity">
                <span>Ver todas</span>
                <img
                  src={chevron}
                  className="w-2 h-2 sm:w-[6.67px] sm:h-[11.67px]"
                  alt="ver mais"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {allTransactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8 sm:py-12 text-sm">
                Nenhuma transação ainda
              </p>
            ) : (
              allTransactions.slice(0, 5).map((item) => {
                const colorClass = getColorClass(item.category?.color || "");
                const iconBgColor = getIconBgColor(item.category?.color || "");
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgColor}`}
                      >
                        <img
                          src={getIconByKey(item.category?.icon || "")}
                          className="w-5 h-5 sm:w-8 sm:h-8"
                          alt={item.category?.name}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800 text-sm truncate">
                          {item.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(item.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                      <span
                        className={`text-xs px-2 py-1 rounded-full truncate max-w-[100px] ${colorClass}`}
                      >
                        {item.category?.name || "Sem categoria"}
                      </span>
                      <span
                        className={`font-semibold text-sm whitespace-nowrap ${item.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
                      >
                        {item.type === "INCOME" ? "+ " : "- "}R${" "}
                        {formatCurrency(item.amount)}
                      </span>
                      <img
                        src={item.type === "INCOME" ? receitas : despesas}
                        className="w-4 h-4 opacity-60 flex-shrink-0"
                        alt={item.type === "INCOME" ? "receita" : "despesa"}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-gray-100 flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1F6343] text-white text-xs sm:text-sm font-medium py-2 px-4 sm:px-6 rounded-lg hover:bg-[#154d34] transition-colors w-full sm:w-auto"
            >
              + Nova transação
            </button>
          </div>
        </div>

        {/* CATEGORIAS */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-xs sm:text-sm font-semibold text-[#6B7280] tracking-wider">
                CATEGORIAS
              </h3>
              <div className="flex items-center gap-2 text-[#1F6343] text-xs sm:text-sm cursor-pointer hover:opacity-80 transition-opacity">
                <span>Gerenciar</span>
                <img
                  src={chevron}
                  className="w-2 h-2 sm:w-[6.67px] sm:h-[11.67px]"
                  alt="gerenciar"
                />
              </div>
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <CategoryList />
          </div>
        </div>
      </div>

      {/* Modal de Nova Transação */}
      {isModalOpen && (
        <NewTransactionModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </>
  );
};

export { DashboardPage };
