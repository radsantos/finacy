import alimentacaoIcon from "../assets/categories/alimentacao.png";
import transporteIcon from "../assets/categories/transporte.png";
import mercadoIcon from "../assets/categories/mercado.png";
import investimentoIcon from "../assets/categories/investimento.png";
import pagamentoIcon from "../assets/categories/pagamento.png";
import entretenimentoIcon from "../assets/categories/entretenimento.png";
import utilidadesIcon from "../assets/categories/utilidades.png";
import saudeIcon from "../assets/categories/saude.png";

// Mapeamento de ícones por categoria
export const categoryIcons: Record<string, string> = {
  Alimentação: alimentacaoIcon,
  Transporte: transporteIcon,
  Mercado: mercadoIcon,
  Investimento: investimentoIcon,
  Utilidades: utilidadesIcon,
  Entretenimento: entretenimentoIcon,
  Receita: pagamentoIcon,
  Pagamento: pagamentoIcon,
  Saude: saudeIcon,
};

// Função para obter o ícone da categoria
export const getCategoryIcon = (categoryName: string) => {
  return categoryIcons[categoryName] || pagamentoIcon;
};
