import { useState, useEffect } from "react";
import { graphqlRequest } from "../services/api";

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
  date: string; // ← apenas string, não string | number
};

type EditTransactionModalProps = {
  transaction: Transaction;
  onClose: () => void;
  onSuccess: () => void;
};

const GET_CATEGORIES = `
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

const UPDATE_TRANSACTION = `
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
      id
      description
      amount
      type
      date
      category {
        id
        name
      }
    }
  }
`;

export const EditTransactionModal = ({
  transaction,
  onClose,
  onSuccess,
}: EditTransactionModalProps) => {
  const [type, setType] = useState<"EXPENSE" | "INCOME">(transaction.type);
  const [description, setDescription] = useState(transaction.description);
  const [date, setDate] = useState(() => {
    // Garantir que a data seja string
    if (typeof transaction.date === "string") {
      return transaction.date.split("T")[0];
    }
    return new Date(transaction.date).toISOString().split("T")[0];
  });
  const [amount, setAmount] = useState(() => {
    return transaction.amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    transaction.category.id,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await graphqlRequest<{ categories: Category[] }>(
          GET_CATEGORIES,
        );
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const formatAmount = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9]/g, "")) / 100;
    if (isNaN(num)) return "0,00";
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatAmount(rawValue);
    setAmount(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert("Por favor, preencha a descrição");
      return;
    }

    if (!selectedCategoryId) {
      alert("Por favor, selecione uma categoria");
      return;
    }

    const amountValue = parseFloat(amount.replace(/\./g, "").replace(",", "."));

    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Por favor, insira um valor válido");
      return;
    }

    try {
      setSubmitting(true);

      const [year, month, day] = date.split("-");
      const correctedDate = `${year}-${month}-${day}T00:00:00.000Z`;

      await graphqlRequest(UPDATE_TRANSACTION, {
        id: transaction.id,
        input: {
          description: description.trim(),
          amount: amountValue,
          type,
          date: correctedDate,
          categoryId: selectedCategoryId,
        },
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      alert("Erro ao atualizar transação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-130 max-w-[90%] shadow-xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">
            Editar transação
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pt-2 pb-4">
          <p className="text-sm text-gray-500">
            Edite os dados da sua transação
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-5">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                type === "EXPENSE"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType("INCOME")}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                type === "INCOME"
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              Receita
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              placeholder="Ex. Almoço no restaurante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F6343] focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F6343] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <input
                  type="text"
                  placeholder="0,00"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F6343] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            {loading ? (
              <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-400">
                Carregando categorias...
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#1F6343]"
                >
                  <span
                    className={
                      selectedCategory ? "text-gray-800" : "text-gray-400"
                    }
                  >
                    {selectedCategory
                      ? selectedCategory.name
                      : "Selecione uma categoria"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isCategoryOpen && (
                  <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                          selectedCategoryId === cat.id
                            ? "bg-green-50 text-[#1F6343]"
                            : "text-gray-700"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#1F6343] text-white font-semibold rounded-xl hover:bg-[#154d34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {submitting ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </div>
  );
};
