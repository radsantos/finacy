import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { graphqlRequest } from "../../services/api";
import { GET_DASHBOARD } from "../../graphql/queries/dashboard";
import { GET_ME } from "../../graphql/queries/user";
import { NewTransactionModal } from "../../components/NewTransactionModal";
import { CategoryList } from "../../components/CategoryList";
import { getCategoryColor } from "../../utils/categoryColors";
import { getCategoryIcon } from "../../utils/categoryIcons";
import Logo from "../../assets/Logo.png";
import wallet from "../../assets/wallet.png";
import receitas from "../../assets/receitas.png";
import despesas from "../../assets/despesas.png";
import chevron from "../../assets/chevron.png";

type Category = {
  id: string;
  name: string;
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

type User = {
  id: string;
  email: string;
  name: string;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const formatDate = (dateString: string | number) => {
    if (!dateString) return "Data não informada";

    try {
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

      if (isNaN(date.getTime())) {
        return "Data inválida";
      }

      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear().toString().slice(-2);

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
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

  const fetchUser = async () => {
    try {
      const data = await graphqlRequest<{ me: User }>(GET_ME);
      setUser(data.me);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      if (error instanceof Error && error.message === "Not authenticated") {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

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
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 50));
      await Promise.all([fetchDashboard(), fetchUser()]);
      setLoading(false);
    };

    loadData();
  }, [refreshKey]);

  if (loading) {
    return <p className="p-8">Carregando...</p>;
  }

  const allTransactions = dashboard?.transactions || [];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-[Inter]">
      {/* HEADER */}
      <header className="w-full h-[64px] bg-white border-b border-[#E5E7EB] relative flex items-center px-8">
        <img src={Logo} alt="Financy" className="w-[120px]" />

        <nav className="absolute left-1/2 -translate-x-1/2 flex gap-6 text-[14px]">
          <span className="text-[#1F6343] font-semibold">Dashboard</span>
          <span className="text-[#6B7280] cursor-pointer">Transações</span>
          <span className="text-[#6B7280] cursor-pointer">Categorias</span>
        </nav>

        <div className="ml-auto">
          <div
            className="w-10 h-10 rounded-full bg-[#1F6343] flex items-center justify-center font-semibold text-white cursor-pointer hover:bg-[#154d34] transition-colors"
            title={user?.name || "Usuário"}
          >
            {user ? getUserInitials(user.name) : "U"}
          </div>
        </div>
      </header>

      <main className="p-8">
        {/* TRÊS CARDS */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-2">
              <img src={wallet} className="w-[20px]" alt="carteira" />
              <p className="text-sm text-[#6B7280]">SALDO TOTAL</p>
            </div>
            <h2 className="text-2xl font-bold">
              R$ {formatCurrency(dashboard?.balance)}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-2">
              <img src={receitas} className="w-[20px]" alt="receitas" />
              <p className="text-sm text-[#6B7280]">RECEITAS DO MÊS</p>
            </div>
            <h2 className="text-2xl font-bold text-green-600">
              R$ {formatCurrency(monthlyIncome)}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-2">
              <img src={despesas} className="w-[20px]" alt="despesas" />
              <p className="text-sm text-[#6B7280]">DESPESAS DO MÊS</p>
            </div>
            <h2 className="text-2xl font-bold text-red-600">
              R$ {formatCurrency(monthlyExpense)}
            </h2>
          </div>
        </div>

        {/* Grid principal: Transações e Categorias */}
        <div className="grid grid-cols-3 gap-6">
          {/* TRANSAÇÕES */}
          <div className="col-span-2 bg-white rounded-xl border border-[#E5E7EB]">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-[#6B7280]">
                  TRANSAÇÕES RECENTES
                </h3>
                <div className="flex items-center gap-2 text-[#1F6343] text-sm cursor-pointer hover:opacity-80">
                  <span>Ver todas</span>
                  <img
                    src={chevron}
                    className="w-[6.67px] h-[11.67px]"
                    alt="ver mais"
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {allTransactions.length === 0 ? (
                <p className="text-center text-gray-500 py-12">
                  Nenhuma transação ainda
                </p>
              ) : (
                allTransactions.map((item) => {
                  const colors = getCategoryColor(item.category.name);
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-100">
                          <img
                            src={getCategoryIcon(item.category.name)}
                            className="w-8 h-8"
                            alt={item.category.name}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {item.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(item.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}
                        >
                          {item.category.name}
                        </span>
                        <span className="font-semibold text-gray-800 text-sm">
                          {item.type === "INCOME" ? "+ " : "- "} R${" "}
                          {formatCurrency(item.amount)}
                        </span>
                        <img
                          src={item.type === "INCOME" ? receitas : despesas}
                          className="w-4 h-4 opacity-60"
                          alt={item.type === "INCOME" ? "receita" : "despesa"}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full text-center text-[#1F6343] text-sm font-medium py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                + Nova transação
              </button>
            </div>
          </div>

          {/* CATEGORIAS */}
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-[#6B7280]">
                  CATEGORIAS
                </h3>
                <div className="flex items-center gap-2 text-[#1F6343] text-sm cursor-pointer hover:opacity-80">
                  <span>Gerenciar</span>
                  <img
                    src={chevron}
                    className="w-[6.67px] h-[11.67px]"
                    alt="gerenciar"
                  />
                </div>
              </div>
            </div>
            <div className="p-4">
              <CategoryList />
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <NewTransactionModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchDashboard();
            setRefreshKey((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
};

export { DashboardPage };
