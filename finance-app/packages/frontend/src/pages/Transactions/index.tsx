import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { graphqlRequest } from "../../services/api";
import { GET_ME } from "../../graphql/queries/user";
import { getIconByKey, getIconBgColor } from "../../utils/icons";
import { NewTransactionModal } from "../../components/NewTransactionModal";
import { EditTransactionModal } from "../../components/EditTransactionModal";
import Logo from "../../assets/Logo.png";
import searchIcon from "../../assets/search.png";
import deleteIcon from "../../assets/delete.png";
import editarIcon from "../../assets/editar.png";

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

type User = {
  id: string;
  email: string;
  name: string;
};

const TransactionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const itemsPerPage = 10;

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  const parseDate = (dateValue: string | number): Date => {
    if (typeof dateValue === "number") {
      return new Date(dateValue);
    }
    if (typeof dateValue === "string") {
      if (/^\d+$/.test(dateValue)) {
        return new Date(parseInt(dateValue));
      }
      return new Date(dateValue);
    }
    return new Date();
  };

  const getCurrentMonthYear = () => {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return { year, month, key: `${year}-${month}` };
  };

  const getAvailableMonths = () => {
    const months = new Map<string, { year: string; month: string }>();
    transactions.forEach((t) => {
      if (t.date) {
        const date = parseDate(t.date);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear().toString();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const key = `${year}-${month}`;
          if (!months.has(key)) {
            months.set(key, { year, month });
          }
        }
      }
    });
    return Array.from(months.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, { year, month }]) => ({ key, year, month }));
  };

  const getMonthDisplay = (year: string, month: string) => {
    if (!year || !month) return "Carregando...";
    const monthNum = parseInt(month);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return "Selecionar período";
    return `${monthNames[monthNum - 1]} / ${year}`;
  };

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

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

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const fetchUser = async () => {
    try {
      const data = await graphqlRequest<{ me: User }>(GET_ME);
      setUser(data.me);
    } catch {
      console.error("Erro ao carregar usuário:");
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const query = `
        query GetCategories {
          categories {
            id
            name
            color
            icon
          }
        }
      `;
      const data = await graphqlRequest<{ categories: Category[] }>(query);
      setCategories(data.categories);
    } catch {
      console.error("Erro ao carregar categorias:");
    }
  };

  const fetchTransactions = async () => {
    try {
      const query = `
        query GetTransactions {
          transactions {
            id
            description
            amount
            type
            date
            category {
              id
              name
              color
              icon
            }
          }
        }
      `;
      const data = await graphqlRequest<{ transactions: Transaction[] }>(query);
      const sorted = [...data.transactions].sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      setTransactions(sorted);
    } catch {
      console.error("Erro ao carregar transações:");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const current = getCurrentMonthYear();
    setFilterYear(current.year);
    setFilterMonth(current.month);

    fetchUser();
    fetchCategories();
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || t.type === filterType;
    const matchesCategory = filterCategory === "ALL" || t.category.id === filterCategory;

    let matchesDate = true;
    if (filterMonth && filterYear) {
      const date = parseDate(t.date);
      const transactionMonth = String(date.getMonth() + 1).padStart(2, "0");
      const transactionYear = String(date.getFullYear());
      matchesDate = transactionMonth === filterMonth && transactionYear === filterYear;
    }

    return matchesSearch && matchesType && matchesCategory && matchesDate;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        const deleteMutation = `
          mutation DeleteTransaction($id: ID!) {
            deleteTransaction(id: $id)
          }
        `;
        await graphqlRequest(deleteMutation, { id });
        await fetchTransactions();
      } catch {
        console.error("Erro ao excluir transação:");
        alert("Erro ao excluir transação. Tente novamente.");
      }
    }
  };

  const availableMonths = getAvailableMonths();

  if (loading) {
    return <p className="p-8">Carregando...</p>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-[Inter]">
      <header className="w-full h-16 bg-white border-b border-[#E5E7EB] relative flex items-center px-8">
        <img src={Logo} alt="Financy" className="w-30" />

        <nav className="absolute left-1/2 -translate-x-1/2 flex gap-6 text-[14px]">
          <span className="text-[#6B7280] cursor-pointer hover:text-[#1F6343]" onClick={() => navigate("/dashboard")}>Dashboard</span>
          <span className="text-[#1F6343] font-semibold">Transações</span>
          <span className={`cursor-pointer hover:text-[#1F6343] ${location.pathname === "/categories" ? "text-[#1F6343] font-semibold" : "text-[#6B7280]"}`} onClick={() => navigate("/categories")}>Categorias</span>
        </nav>

        <div className="ml-auto">
          <div className="w-10 h-10 rounded-full bg-[#1F6343] flex items-center justify-center font-semibold text-white cursor-pointer hover:bg-[#154d34] transition-colors" title={user?.name || "Usuário"}>
            {user ? getUserInitials(user.name) : "U"}
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Transações</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie todas as suas transações financeiras</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] py-5 px-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Buscar, Tipo, Categoria, Período e Botão */}
            <div className="flex-1 min-w-50">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <img src={searchIcon} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" alt="buscar" />
                <input type="text" placeholder="Buscar por descrição" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6343]" />
              </div>
            </div>

            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select value={filterType} onChange={(e) => { setFilterType(e.target.value as "ALL" | "INCOME" | "EXPENSE"); setCurrentPage(1); }} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6343]">
                <option value="ALL">Todos</option>
                <option value="INCOME">Receitas</option>
                <option value="EXPENSE">Despesas</option>
              </select>
            </div>

            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6343]">
                <option value="ALL">Todas</option>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>

            <div className="w-44">
              <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
              <select value={filterMonth && filterYear ? `${filterYear}-${filterMonth}` : ""} onChange={(e) => { const value = e.target.value; if (value && value.includes("-")) { const [year, month] = value.split("-"); setFilterYear(year); setFilterMonth(month); } else { setFilterYear(""); setFilterMonth(""); } setCurrentPage(1); }} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6343]">
                <option value="">Todos os períodos</option>
                {availableMonths.map(({ key, year, month }) => (<option key={key} value={key}>{getMonthDisplay(year, month)}</option>))}
              </select>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-[#1F6343] text-white rounded-lg hover:bg-[#154d34] transition-colors cursor-pointer">+ Nova transação</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">DESCRIÇÃO</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">DATA</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">CATEGORIA</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">TIPO</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-600">VALOR</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-600">AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      Nenhuma transação encontrada
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((item) => {
                    const bgColor = getIconBgColor(item.category.color || "");
                    const iconImage = getIconByKey(item.category.icon || "");
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bgColor}`}>
                              <img src={iconImage} className="w-5 h-5 object-contain" alt={item.category.name} />
                            </div>
                            <span className="text-sm text-gray-800">{item.description}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-500">{formatDate(item.date)}</td>
                        <td className="p-4">
                          <span className={`text-xs px-3 py-1 rounded-full ${bgColor}`}>
                            {item.category.name}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-3 py-1 rounded-full ${item.type === "INCOME" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {item.type === "INCOME" ? "Entrada" : "Saída"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className={`text-sm font-semibold ${item.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                            {item.type === "INCOME" ? "+ " : "- "} R$ {formatCurrency(item.amount)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Excluir">
                              <img src={deleteIcon} className="w-4 h-4" alt="excluir" />
                            </button>
                            <button onClick={() => setEditingTransaction(item)} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Editar">
                              <img src={editarIcon} className="w-5 h-5" alt="editar" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">{filteredTransactions.length} resultados</p>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">Anterior</button>
                <span className="px-3 py-1 text-sm text-gray-600">{currentPage} de {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">Próxima</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <NewTransactionModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchTransactions();
          }}
        />
      )}

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={() => {
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
};

export { TransactionsPage };