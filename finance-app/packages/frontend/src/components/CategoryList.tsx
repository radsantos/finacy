import { useState, useEffect } from "react";
import { graphqlRequest } from "../services/api";
import { getIconByKey, getColorClass } from "../utils/icons";

type Category = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
};

type Transaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: Category;
};

type CategoryStats = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  total: number;
  count: number;
};

const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const CategoryList = () => {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategoriesWithStats = async () => {
    try {
      // Buscar categorias com todas as informações
      const categoriesQuery = `
        query GetCategories {
          categories {
            id
            name
            description
            icon
            color
          }
        }
      `;

      const categoriesData = await graphqlRequest<{ categories: Category[] }>(
        categoriesQuery,
      );

      const transactionsQuery = `
        query GetTransactions {
          transactions {
            id
            amount
            type
            category {
              id
              name
            }
          }
        }
      `;

      const transactionsData = await graphqlRequest<{
        transactions: Transaction[];
      }>(transactionsQuery);

      // Mapear categorias com seus dados
      const categoryMap = new Map<
        string,
        {
          name: string;
          description?: string;
          icon?: string;
          color?: string;
          total: number;
          count: number;
        }
      >();

      // Inicializar com categorias do backend
      categoriesData.categories.forEach((cat) => {
        categoryMap.set(cat.id, {
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          color: cat.color,
          total: 0,
          count: 0,
        });
      });

      // Somar transações
      transactionsData.transactions.forEach((t) => {
        if (t.type === "EXPENSE") {
          const catId = t.category.id;
          if (categoryMap.has(catId)) {
            const stats = categoryMap.get(catId)!;
            stats.total += t.amount;
            stats.count += 1;
          }
        }
      });

      const categoriesWithStats = Array.from(categoryMap.entries()).map(
        ([id, stats]) => ({
          id,
          name: stats.name,
          description: stats.description,
          icon: stats.icon,
          color: stats.color,
          total: stats.total,
          count: stats.count,
        }),
      );

      // Filtrar apenas categorias com transações e ordenar por total
      const categoriesWithTransactions = categoriesWithStats
        .filter((cat) => cat.count > 0)
        .sort((a, b) => b.total - a.total);

      setCategories(categoriesWithTransactions);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesWithStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Carregando categorias...
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma categoria com despesas ainda.
        <br />
        <span className="text-sm">
          Adicione transações para ver as estatísticas.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        // Usar a cor salva no banco de dados
        const colorClass = getColorClass(cat.color || "");
        const iconImage = getIconByKey(cat.icon || "");
        return (
          <div key={cat.id} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
              <img
                src={iconImage}
                className="w-6 h-6 object-contain"
                alt={cat.name}
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">{cat.name}</span>
                <span className="font-semibold text-gray-800">
                  R$ {formatCurrency(cat.total)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400">
                  {cat.count} {cat.count === 1 ? "item" : "itens"}
                </span>
                {/* Badge com a cor do banco de dados */}
                <span
                  className={`text-xs px-3 py-1 rounded-full ${colorClass}`}
                >
                  {cat.name}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
