import { useEffect, useState } from "react";
import { graphqlRequest } from "../services/api";

type Category = {
  id: string;
  name: string;
  color?: string | null;
  transactionCount: number;
  totalAmount: number;
};

const DEFAULT_CATEGORY_COLOR = "#6B7280";

/**
 * Permite trabalhar com cores salvas como:
 * "#22C55E"
 * "green"
 * "verde"
 * "GREEN"
 */
const CATEGORY_COLOR_MAP: Record<string, string> = {
  green: "#22C55E",
  verde: "#22C55E",

  emerald: "#10B981",
  esmeralda: "#10B981",

  blue: "#3B82F6",
  azul: "#3B82F6",

  purple: "#8B5CF6",
  roxo: "#8B5CF6",

  violet: "#7C3AED",
  violeta: "#7C3AED",

  red: "#EF4444",
  vermelho: "#EF4444",

  orange: "#F97316",
  laranja: "#F97316",

  yellow: "#EAB308",
  amarelo: "#EAB308",

  pink: "#EC4899",
  rosa: "#EC4899",

  cyan: "#06B6D4",
  ciano: "#06B6D4",

  teal: "#14B8A6",

  gray: "#6B7280",
  grey: "#6B7280",
  cinza: "#6B7280",
};

const isHexColor = (color: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

const normalizeCategoryColor = (
  color?: string | null,
): string => {
  if (!color) {
    return DEFAULT_CATEGORY_COLOR;
  }

  const normalizedColor = color.trim();

  if (isHexColor(normalizedColor)) {
    return normalizedColor;
  }

  const colorKey = normalizedColor.toLowerCase();

  return CATEGORY_COLOR_MAP[colorKey] ?? DEFAULT_CATEGORY_COLOR;
};

const hexToRgba = (
  hexColor: string,
  opacity: number,
): string => {
  const normalizedHex = hexColor.replace("#", "");

  const red = Number.parseInt(normalizedHex.substring(0, 2), 16);
  const green = Number.parseInt(normalizedHex.substring(2, 4), 16);
  const blue = Number.parseInt(normalizedHex.substring(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
};

const formatCurrency = (value?: number): string => {
  return (value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchCategories = async (): Promise<Category[]> => {
    const query = `
      query GetCategories {
        categories {
          id
          name
          color
          transactionCount
          totalAmount
        }
      }
    `;

    const data = await graphqlRequest<{
      categories: Category[];
    }>(query);

    return data.categories ?? [];
  };

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await fetchCategories();

        console.log(
          "Categorias recebidas:",
          JSON.stringify(data, null, 2),
        );

        if (isMounted) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);

        if (isMounted) {
          setErrorMessage(
            "Não foi possível carregar as categorias.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <p className="py-4 text-center text-sm text-gray-500">
        Carregando categorias...
      </p>
    );
  }

  if (errorMessage) {
    return (
      <p className="py-4 text-center text-sm text-red-500">
        {errorMessage}
      </p>
    );
  }

  if (categories.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-500">
        Nenhuma categoria cadastrada.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const categoryColor = normalizeCategoryColor(
          category.color,
        );

        const transactionCount =
          category.transactionCount ?? 0;

        const itemLabel =
          transactionCount === 1 ? "item" : "itens";

        return (
          <div
            key={category.id}
            className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4"
          >
            <div className="min-w-0">
              <span
                className="inline-flex max-w-full rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  color: categoryColor,
                  backgroundColor: hexToRgba(
                    categoryColor,
                    0.14,
                  ),
                }}
              >
                <span className="truncate">
                  {category.name}
                </span>
              </span>
            </div>

            <span className="whitespace-nowrap text-xs text-[#4B5563]">
              {transactionCount} {itemLabel}
            </span>

            <span className="whitespace-nowrap text-xs font-semibold text-[#1F2937]">
              {formatCurrency(category.totalAmount)}
            </span>
          </div>
        );
      })}
    </div>
  );
};