import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { graphqlRequest } from "../../services/api";
import { GET_TRANSACTIONS } from "../../graphql/queries/transactions";
import { GET_DASHBOARD } from "../../graphql/queries/dashboard";

import { NewTransactionModal } from "../../components/NewTransactionModal";
import { EditTransactionModal } from "../../components/EditTransactionModal";

import {
  getIconByKey,
  getColorClass,
  getIconBgColor,
} from "../../utils/icons";

import wallet from "../../assets/wallet.png";
import receitas from "../../assets/receitas.png";
import despesas from "../../assets/despesas.png";
import editIcon from "../../assets/editar.png";
import deleteIcon from "../../assets/delete.png";

import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from "../../types/transaction";

type DashboardData = {
  balance: number;
  incomes: number;
  expenses: number;
};

type PeriodOption = {
  value: string;
  label: string;
};

const ITEMS_PER_PAGE = 10;

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(
    [],
  );

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  const [isNewModalOpen, setIsNewModalOpen] =
    useState(false);

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [deletingTransactionId, setDeletingTransactionId] =
    useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedType, setSelectedType] =
    useState<"ALL" | TransactionType>("ALL");

  const [selectedCategory, setSelectedCategory] =
    useState("ALL");

  const [selectedPeriod, setSelectedPeriod] =
    useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      const [transactionsData, dashboardData] =
        await Promise.all([
          graphqlRequest<{
            transactions: Transaction[];
          }>(GET_TRANSACTIONS),

          graphqlRequest<{
            dashboard: DashboardData;
          }>(GET_DASHBOARD),
        ]);

      setTransactions(
        transactionsData.transactions ?? [],
      );

      setDashboard(dashboardData.dashboard);
    } catch (error) {
      console.error(
        "Erro ao carregar dados das transações:",
        error,
      );

      setTransactions([]);
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedType,
    selectedCategory,
    selectedPeriod,
  ]);

  const formatDate = (
    dateString: string | number,
  ): string => {
    if (!dateString) {
      return "Data não informada";
    }

    try {
      if (
        typeof dateString === "string" &&
        dateString.includes("T")
      ) {
        const [year, month, day] = dateString
          .split("T")[0]
          .split("-");

        return `${day}/${month}/${year.slice(-2)}`;
      }

      let date: Date;

      if (typeof dateString === "number") {
        date = new Date(dateString);
      } else if (/^\d+$/.test(dateString)) {
        date = new Date(Number(dateString));
      } else {
        date = new Date(dateString);
      }

      if (Number.isNaN(date.getTime())) {
        return "Data inválida";
      }

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(
        date.getMonth() + 1,
      ).padStart(2, "0");

      const year = String(date.getFullYear()).slice(-2);

      return `${day}/${month}/${year}`;
    } catch {
      return "Data inválida";
    }
  };

  const formatCurrency = (
    value?: number | null,
  ): string => {
    return (value ?? 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getTransactionDate = (
    dateValue: string,
  ): Date | null => {
    if (!dateValue) {
      return null;
    }

    if (/^\d+$/.test(dateValue)) {
      const timestampDate = new Date(Number(dateValue));

      return Number.isNaN(timestampDate.getTime())
        ? null
        : timestampDate;
    }

    const date = new Date(dateValue);

    return Number.isNaN(date.getTime())
      ? null
      : date;
  };

  const categories = useMemo<TransactionCategory[]>(() => {
    const categoryMap = new Map<string, TransactionCategory>();

    transactions.forEach((transaction) => {
      if (transaction.category) {
        categoryMap.set(
          transaction.category.id,
          transaction.category,
        );
      }
    });

    return Array.from(categoryMap.values()).sort(
      (categoryA, categoryB) =>
        categoryA.name.localeCompare(
          categoryB.name,
          "pt-BR",
        ),
    );
  }, [transactions]);

  const periodOptions = useMemo<PeriodOption[]>(() => {
    const periodMap = new Map<string, PeriodOption>();

    transactions.forEach((transaction) => {
      const date = getTransactionDate(transaction.date);

      if (!date) {
        return;
      }

      const year = date.getFullYear();
      const month = date.getMonth();

      const value = `${year}-${String(
        month + 1,
      ).padStart(2, "0")}`;

      const label = new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
      }).format(date);

      periodMap.set(value, {
        value,
        label:
          label.charAt(0).toUpperCase() +
          label.slice(1),
      });
    });

    return Array.from(periodMap.values()).sort(
      (periodA, periodB) =>
        periodB.value.localeCompare(periodA.value),
    );
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLocaleLowerCase("pt-BR");

    return transactions
      .filter((transaction) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          transaction.description
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch);

        const matchesType =
          selectedType === "ALL" ||
          transaction.type === selectedType;

        const matchesCategory =
          selectedCategory === "ALL" ||
          transaction.category?.id ===
            selectedCategory;

        let matchesPeriod = true;

        if (selectedPeriod !== "ALL") {
          const date = getTransactionDate(
            transaction.date,
          );

          if (!date) {
            matchesPeriod = false;
          } else {
            const transactionPeriod = `${date.getFullYear()}-${String(
              date.getMonth() + 1,
            ).padStart(2, "0")}`;

            matchesPeriod =
              transactionPeriod === selectedPeriod;
          }
        }

        return (
          matchesSearch &&
          matchesType &&
          matchesCategory &&
          matchesPeriod
        );
      })
      .sort((transactionA, transactionB) => {
        const dateA = getTransactionDate(
          transactionA.date,
        );

        const dateB = getTransactionDate(
          transactionB.date,
        );

        return (
          (dateB?.getTime() ?? 0) -
          (dateA?.getTime() ?? 0)
        );
      });
  }, [
    transactions,
    searchTerm,
    selectedType,
    selectedCategory,
    selectedPeriod,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredTransactions.length /
        ITEMS_PER_PAGE,
    ),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const indexOfFirstItem =
    (safeCurrentPage - 1) * ITEMS_PER_PAGE;

  const indexOfLastItem =
    indexOfFirstItem + ITEMS_PER_PAGE;

  const currentTransactions =
    filteredTransactions.slice(
      indexOfFirstItem,
      indexOfLastItem,
    );

  const handleDelete = async (
    transaction: Transaction,
  ): Promise<void> => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a transação "${transaction.description}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTransactionId(transaction.id);

      const mutation = `
        mutation DeleteTransaction($id: ID!) {
          deleteTransaction(id: $id)
        }
      `;

      await graphqlRequest<{
        deleteTransaction: boolean;
      }>(mutation, {
        id: transaction.id,
      });

      await fetchData();
    } catch (error) {
      console.error(
        "Erro ao excluir transação:",
        error,
      );

      window.alert(
        "Não foi possível excluir a transação.",
      );
    } finally {
      setDeletingTransactionId(null);
    }
  };

  const clearFilters = (): void => {
    setSearchTerm("");
    setSelectedType("ALL");
    setSelectedCategory("ALL");
    setSelectedPeriod("ALL");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#1F6343]" />

          <p className="text-gray-500">
            Carregando transações...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* CARDS FINANCEIROS */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        <article className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
          <div className="mb-2 flex items-center gap-2">
            <img
              src={wallet}
              className="h-4 w-4 sm:h-5 sm:w-5"
              alt="Carteira"
            />

            <p className="text-xs font-medium text-[#6B7280] sm:text-sm">
              SALDO TOTAL
            </p>
          </div>

          <h2 className="wrap-break-word text-xl font-bold text-gray-800 sm:text-2xl">
            R$ {formatCurrency(dashboard?.balance)}
          </h2>
        </article>

        <article className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
          <div className="mb-2 flex items-center gap-2">
            <img
              src={receitas}
              className="h-4 w-4 sm:h-5 sm:w-5"
              alt="Receitas"
            />

            <p className="text-xs font-medium text-[#6B7280] sm:text-sm">
              RECEITAS DO MÊS
            </p>
          </div>

          <h2 className="wrap-break-word text-xl font-bold text-green-600 sm:text-2xl">
            R$ {formatCurrency(dashboard?.incomes)}
          </h2>
        </article>

        <article className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
          <div className="mb-2 flex items-center gap-2">
            <img
              src={despesas}
              className="h-4 w-4 sm:h-5 sm:w-5"
              alt="Despesas"
            />

            <p className="text-xs font-medium text-[#6B7280] sm:text-sm">
              DESPESAS DO MÊS
            </p>
          </div>

          <h2 className="wrap-break-word text-xl font-bold text-red-600 sm:text-2xl">
            R$ {formatCurrency(dashboard?.expenses)}
          </h2>
        </article>
      </section>

      {/* TÍTULO */}
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Transações
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Gerencie todas as suas transações
            financeiras
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1F6343] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#154d34] sm:w-auto"
        >
          <span aria-hidden="true">+</span>
          Nova transação
        </button>
      </section>

      {/* CARD DE FILTROS */}
      <section className="mb-7 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* BUSCA */}
          <div>
            <label
              htmlFor="transaction-search"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Buscar
            </label>

            <div className="relative">
              <svg
                aria-hidden="true"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>

              <input
                id="transaction-search"
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Buscar por descrição"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-[#1F6343] focus:ring-2 focus:ring-[#1F6343]/20"
              />
            </div>
          </div>

          {/* TIPO */}
          <div>
            <label
              htmlFor="transaction-type"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Tipo
            </label>

            <select
              id="transaction-type"
              value={selectedType}
              onChange={(event) =>
                setSelectedType(
                  event.target.value as
                    | "ALL"
                    | TransactionType,
                )
              }
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#1F6343] focus:ring-2 focus:ring-[#1F6343]/20"
            >
              <option value="ALL">Todos</option>
              <option value="INCOME">Entradas</option>
              <option value="EXPENSE">Saídas</option>
            </select>
          </div>

          {/* CATEGORIA */}
          <div>
            <label
              htmlFor="transaction-category"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Categoria
            </label>

            <select
              id="transaction-category"
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#1F6343] focus:ring-2 focus:ring-[#1F6343]/20"
            >
              <option value="ALL">Todas</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* PERÍODO */}
          <div>
            <label
              htmlFor="transaction-period"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Período
            </label>

            <select
              id="transaction-period"
              value={selectedPeriod}
              onChange={(event) =>
                setSelectedPeriod(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#1F6343] focus:ring-2 focus:ring-[#1F6343]/20"
            >
              <option value="ALL">
                Todos os períodos
              </option>

              {periodOptions.map((period) => (
                <option
                  key={period.value}
                  value={period.value}
                >
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm ||
          selectedType !== "ALL" ||
          selectedCategory !== "ALL" ||
          selectedPeriod !== "ALL") && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-[#1F6343] hover:text-[#154d34]"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      {/* TABELA */}
      <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225">
            <thead className="border-b border-gray-200 bg-white">
              <tr>
                <th className="p-5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Descrição
                </th>

                <th className="p-5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Data
                </th>

                <th className="p-5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Categoria
                </th>

                <th className="p-5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Tipo
                </th>

                <th className="p-5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Valor
                </th>

                <th className="p-5 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {currentTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center"
                  >
                    <p className="text-sm text-gray-500">
                      Nenhuma transação encontrada.
                    </p>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-3 text-sm font-medium text-[#1F6343]"
                    >
                      Limpar filtros
                    </button>
                  </td>
                </tr>
              ) : (
                currentTransactions.map(
                  (transaction) => {
                    const colorClass =
                      getColorClass(
                        transaction.category?.color ??
                          "",
                      );

                    const iconBgColor =
                      getIconBgColor(
                        transaction.category?.color ??
                          "",
                      );

                    const isDeleting =
                      deletingTransactionId ===
                      transaction.id;

                    return (
                      <tr
                        key={transaction.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        {/* DESCRIÇÃO */}
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBgColor}`}
                            >
                              <img
                                src={getIconByKey(
                                  transaction.category
                                    ?.icon ?? "",
                                )}
                                className="h-5 w-5 object-contain"
                                alt=""
                                aria-hidden="true"
                              />
                            </div>

                            <p className="font-medium text-gray-800">
                              {
                                transaction.description
                              }
                            </p>
                          </div>
                        </td>

                        {/* DATA */}
                        <td className="p-5 text-sm text-gray-500">
                          {formatDate(
                            transaction.date,
                          )}
                        </td>

                        {/* CATEGORIA */}
                        <td className="p-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}
                          >
                            {transaction.category
                              ?.name ??
                              "Sem categoria"}
                          </span>
                        </td>

                        {/* TIPO */}
                        <td className="p-5">
                          <span
                            className={`inline-flex items-center gap-2 text-sm font-medium ${
                              transaction.type ===
                              "INCOME"
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            <span
                              className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                transaction.type ===
                                "INCOME"
                                  ? "border-green-600"
                                  : "border-red-500"
                              }`}
                            >
                              {transaction.type ===
                              "INCOME"
                                ? "↑"
                                : "↓"}
                            </span>

                            {transaction.type ===
                            "INCOME"
                              ? "Entrada"
                              : "Saída"}
                          </span>
                        </td>

                        {/* VALOR */}
                        <td className="p-5 text-right">
                          <span className="whitespace-nowrap text-sm font-semibold text-gray-800">
                            {transaction.type ===
                            "INCOME"
                              ? "+"
                              : "-"}{" "}
                            R${" "}
                            {formatCurrency(
                              transaction.amount,
                            )}
                          </span>
                        </td>

                        {/* AÇÕES */}
                        <td className="p-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                void handleDelete(
                                  transaction,
                                )
                              }
                              disabled={isDeleting}
                              title="Excluir transação"
                              aria-label={`Excluir ${transaction.description}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isDeleting ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
                              ) : (
                                <img
                                  src={deleteIcon}
                                  alt=""
                                  aria-hidden="true"
                                  className="h-4 w-4 object-contain"
                                />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setEditingTransaction(
                                  transaction,
                                )
                              }
                              disabled={isDeleting}
                              title="Editar transação"
                              aria-label={`Editar ${transaction.description}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <img
                                src={editIcon}
                                alt=""
                                aria-hidden="true"
                                className="h-4 w-4 object-contain"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINAÇÃO */}
        {filteredTransactions.length > 0 && (
          <footer className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-5 py-4 sm:flex-row">
            <p className="text-sm text-gray-600">
              {indexOfFirstItem + 1} a{" "}
              {Math.min(
                indexOfLastItem,
                filteredTransactions.length,
              )}{" "}
              | {filteredTransactions.length} resultados
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1),
                  )
                }
                disabled={safeCurrentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ‹
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1,
              )
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(
                      page - safeCurrentPage,
                    ) <= 1,
                )
                .map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() =>
                      setCurrentPage(page)
                    }
                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition ${
                      safeCurrentPage === page
                        ? "bg-[#1F6343] text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(
                      totalPages,
                      page + 1,
                    ),
                  )
                }
                disabled={
                  safeCurrentPage === totalPages
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </footer>
        )}
      </section>

      {/* MODAL NOVA TRANSAÇÃO */}
      {isNewModalOpen && (
        <NewTransactionModal
          onClose={() =>
            setIsNewModalOpen(false)
          }
          onSuccess={() => {
            setIsNewModalOpen(false);
            void fetchData();
          }}
        />
      )}

      {/* MODAL EDITAR TRANSAÇÃO */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() =>
            setEditingTransaction(null)
          }
          onSuccess={() => {
            setEditingTransaction(null);
            void fetchData();
          }}
        />
      )}
    </>
  );
};

export { TransactionsPage };