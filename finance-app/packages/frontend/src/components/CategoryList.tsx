import { useState, useEffect } from "react";
import { graphqlRequest } from "../services/api";
import { getCategoryColor } from "../utils/categoryColors";

type Category = {
  id: string;
  name: string;
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

      const categoryMap = new Map<
        string,
        { name: string; total: number; count: number }
      >();

      transactionsData.transactions.forEach((t) => {
        if (t.type === "EXPENSE") {
          const catId = t.category.id;
          const catName = t.category.name;

          if (!categoryMap.has(catId)) {
            categoryMap.set(catId, { name: catName, total: 0, count: 0 });
          }
          const stats = categoryMap.get(catId)!;
          stats.total += t.amount;
          stats.count += 1;
        }
      });

      const categoriesWithStats = Array.from(categoryMap.entries()).map(
        ([id, stats]) => ({
          id,
          name: stats.name,
          total: stats.total,
          count: stats.count,
        }),
      );

      categoriesWithStats.sort((a, b) => b.total - a.total);
      setCategories(categoriesWithStats);
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
    <div className="space-y-3">
      {categories.map((cat) => {
        const colors = getCategoryColor(cat.name);
        return (
          <div key={cat.id} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-3 py-1 rounded-full ${colors.bg} ${colors.text} ${colors.border} border`}
              >
                {cat.name}
              </span>
              <span className="text-xs text-gray-400">
                {cat.count} {cat.count === 1 ? "item" : "itens"}
              </span>
            </div>
            <span className="font-semibold text-gray-800 text-sm text-right">
              R$ {formatCurrency(cat.total)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
