import { useState, useEffect } from "react";
import { graphqlRequest } from "../services/api";

type Category = {
  id: string;
  name: string;
};

type NewTransactionModalProps = {
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

const CREATE_CATEGORY = `
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
    }
  }
`;

const CREATE_TRANSACTION = `
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
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

export const NewTransactionModal = ({ onClose, onSuccess }: NewTransactionModalProps) => {
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [amount, setAmount] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Categoria padrão para Receitas
  const INCOME_CATEGORY_NAME = "Receita";
  const [incomeCategoryId, setIncomeCategoryId] = useState("");

  // Buscar categorias ao abrir o modal
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await graphqlRequest<{ categories: Category[] }>(GET_CATEGORIES);
      setCategories(data.categories || []);
      
      // Encontrar ou criar categoria para Receitas
      const incomeCat = data.categories?.find(c => c.name === INCOME_CATEGORY_NAME);
      if (incomeCat) {
        setIncomeCategoryId(incomeCat.id);
      }
      
      if (data.categories && data.categories.length > 0) {
        setSelectedCategoryId(data.categories[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  // Criar categoria de Receita se não existir
  const createIncomeCategory = async () => {
    try {
      const data = await graphqlRequest<{ createCategory: Category }>(CREATE_CATEGORY, {
        input: {
          name: INCOME_CATEGORY_NAME,
          description: "Receitas de salário e ganhos",
        },
      });
      setIncomeCategoryId(data.createCategory.id);
      await fetchCategories();
      return data.createCategory.id;
    } catch (error) {
      console.error("Erro ao criar categoria de receita:", error);
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchCategories();
      // Se for Receita e não tiver a categoria, cria
      if (type === "INCOME" && !incomeCategoryId) {
        const newId = await createIncomeCategory();
        if (newId) setIncomeCategoryId(newId);
      }
    };
    init();
  }, []);

  // Quando mudar o tipo, ajustar a categoria selecionada
  useEffect(() => {
    if (type === "INCOME" && incomeCategoryId) {
      setSelectedCategoryId(incomeCategoryId);
    } else if (type === "EXPENSE" && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0]?.id || "");
    }
  }, [type, incomeCategoryId, categories]);

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

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Digite o nome da categoria");
      return;
    }

    try {
      setIsCreatingCategory(true);
      const data = await graphqlRequest<{ createCategory: Category }>(CREATE_CATEGORY, {
        input: {
          name: newCategoryName.trim(),
          description: `Categoria: ${newCategoryName.trim()}`,
        },
      });
      
      await fetchCategories();
      setNewCategoryName("");
      setIsCategoryOpen(true);
      
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      alert("Erro ao criar categoria. Tente novamente.");
    } finally {
      setIsCreatingCategory(false);
    }
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
      
      const dateISO = new Date(date).toISOString();
      
      await graphqlRequest(CREATE_TRANSACTION, {
        input: {
          description: description.trim(),
          amount: amountValue,
          type,
          date: dateISO,
          categoryId: selectedCategoryId,
        },
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      alert("Erro ao criar transação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[520px] max-w-[90%] shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Nova transação</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Subtitle */}
        <div className="px-6 pt-2 pb-4">
          <p className="text-sm text-gray-500">Registre sua despesa ou receita</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-5">
          {/* Tipo: Despesa / Receita */}
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

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              placeholder={type === "INCOME" ? "Ex. Salário, Freelance" : "Ex. Almoço no restaurante"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F6343] focus:border-transparent"
              required
            />
          </div>

          {/* Data */}
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

          {/* Valor */}
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

          {/* Categoria - Bloqueada para Receita */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            {type === "INCOME" ? (
              // Quando é Receita, mostra a categoria fixa "Salário" desabilitada
              <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600">
                {INCOME_CATEGORY_NAME}
              </div>
            ) : loading ? (
              <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-400">
                Carregando categorias...
              </div>
            ) : categories.length === 0 ? (
              <div className="space-y-2">
                <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-center">
                  Nenhuma categoria encontrada.
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nova categoria (ex: Alimentação)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F6343] text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={isCreatingCategory || !newCategoryName.trim()}
                    className="px-4 py-2 bg-[#1F6343] text-white rounded-xl text-sm hover:bg-[#154d34] disabled:opacity-50"
                  >
                    {isCreatingCategory ? "..." : "Criar"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#1F6343]"
                >
                  <span className={selectedCategory ? "text-gray-800" : "text-gray-400"}>
                    {selectedCategory ? selectedCategory.name : "Selecione uma categoria"}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                          selectedCategoryId === cat.id ? "bg-green-50 text-[#1F6343]" : "text-gray-700"
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

          {/* Botão Salvar */}
          <button
            type="submit"
            disabled={submitting || (type === "EXPENSE" && categories.length === 0)}
            className="w-full py-3 bg-[#1F6343] text-white font-semibold rounded-xl hover:bg-[#154d34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {submitting ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </div>
  );
};