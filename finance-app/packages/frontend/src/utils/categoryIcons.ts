import alimentacaoIcon from "../assets/categories/alimentacao.png";
import transporteIcon from "../assets/categories/transporte.png";
import mercadoIcon from "../assets/categories/mercado.png";
import investimentoIcon from "../assets/categories/investimento.png";
import pagamentoIcon from "../assets/categories/pagamento.png";
import entretenimentoIcon from "../assets/categories/entretenimento.png";
import utilidadesIcon from "../assets/categories/utilidades.png";
import saudeIcon from "../assets/categories/saude.png";
import semImagemIcon from "../assets/categories/semImagem.png";

// Mapeamento de ícones por categoria
export const categoryIcons: Record<string, string> = {
  Alimentação: alimentacaoIcon,
  Transporte: transporteIcon,
  Mercado: mercadoIcon,
  Investimento: investimentoIcon,
  Utilidades: utilidadesIcon,
  Entretenimento: entretenimentoIcon,
  Salario: pagamentoIcon,
  Saúde: saudeIcon,
  SemImagem: semImagemIcon,
};

// Função para obter o ícone da categoria
export const getCategoryIcon = (categoryName: string) => {
  return categoryIcons[categoryName] || semImagemIcon; //caso a categoria não tenha um ícone definido, sem imagem
};
