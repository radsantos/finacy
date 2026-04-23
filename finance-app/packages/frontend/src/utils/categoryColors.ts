// Cores para as categorias conforme Figma
export const categoryColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Receita: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  Alimentação: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Transporte: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  Mercado: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  Investimento: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  Utilidades: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  Entretenimento: {
    bg: "bg-pink-100",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  Saúde: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
  },
};

export const getCategoryColor = (categoryName: string) => {
  return (
    categoryColors[categoryName] || {
      bg: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-200",
    }
  );
};
