// pages/Transactions/index.tsx
import { useState, useEffect } from "react";
import { graphqlRequest } from "../../services/api";
import { GET_TRANSACTIONS } from "../../graphql/queries/transactions";
import { GET_DASHBOARD } from "../../graphql/queries/dashboard";
import { NewTransactionModal } from "../../components/NewTransactionModal";
import { getIconByKey, getColorClass, getIconBgColor } from "../../utils/icons";
import wallet from "../../assets/wallet.png";
import receitas from "../../assets/receitas.png";
import despesas from "../../assets/despesas.png";

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
  };
  date: string;
};

type DashboardData = {
  balance: number;
  incomes: number;
  expenses: number;
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Função de formatação de data
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
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsData, dashboardData] = await Promise.all([
          graphqlRequest<{ transactions: Transaction[] }>(GET_TRANSACTIONS),
          graphqlRequest<{ dashboard: DashboardData }>(GET_DASHBOARD),
        ]);
        setTransactions(transactionsData.transactions || []);
        setDashboard(dashboardData.dashboard);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F6343] mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando transações...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* CARDS */}
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
            R$ {formatCurrency(dashboard?.incomes)}
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
            R$ {formatCurrency(dashboard?.expenses)}
          </h2>
        </div>
      </div>

      {/* Tabela de transações */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-sm">
        {/* Header da página */}
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                Transações
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gerencie todas as suas transações financeiras
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1F6343] text-white text-sm font-medium py-2.5 px-6 rounded-lg hover:bg-[#154d34] transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nova transação
            </button>
          </div>
        </div>

        {/* Tabela de transações */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Data
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="text-right p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg
                        className="w-16 h-16 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-gray-500 text-lg">
                        Nenhuma transação encontrada
                      </p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-2 text-[#1F6343] hover:text-[#154d34] font-medium"
                      >
                        Criar primeira transação →
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                currentTransactions.map((item) => {
                  const colorClass = getColorClass(item.category?.color || "");
                  const iconBgColor = getIconBgColor(
                    item.category?.color || "",
                  );
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgColor}`}
                          >
                            <img
                              src={getIconByKey(item.category?.icon || "")}
                              className="w-5 h-5"
                              alt={item.category?.name}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">
                              {item.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {item.type === "INCOME" ? "Receita" : "Despesa"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(item.date)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full ${colorClass}`}
                        >
                          {item.category?.name || "Sem categoria"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`font-semibold text-sm ${item.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
                        >
                          {item.type === "INCOME" ? "+ " : "- "}R${" "}
                          {formatCurrency(item.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {transactions.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              Mostrando {indexOfFirstItem + 1} a{" "}
              {Math.min(indexOfLastItem, transactions.length)} de{" "}
              {transactions.length} transações
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Anterior
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        currentPage === pageNumber
                          ? "bg-[#1F6343] text-white"
                          : "border border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
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

export { TransactionsPage };
