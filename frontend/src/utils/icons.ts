// Importar todas as imagens de ícones
import alimentacaoIcon from "../assets/categories/alimentacao.png";
import transporteIcon from "../assets/categories/transporte.png";
import mercadoIcon from "../assets/categories/mercado.png";
import investimentoIcon from "../assets/categories/investimento.png";
import utilidadesIcon from "../assets/categories/utilidades.png";
import entretenimentoIcon from "../assets/categories/entretenimento.png";
import saudeIcon from "../assets/categories/saude.png";
import pagamentoIcon from "../assets/categories/pagamento.png";
import academiaIcon from "../assets/categories/academia.png";
import caixapostalIcon from "../assets/categories/caixapostal.png";
import educacaoIcon from "../assets/categories/educacao.png";
import notafiscalIcon from "../assets/categories/notafisca.png";
import petshopIcon from "../assets/categories/petshop.png";
import presenteIcon from "../assets/categories/presente.png";
import residenciaIcon from "../assets/categories/residencia.png";
import viagemIcon from "../assets/categories/viagem.png";
import semImagemIcon from "../assets/categories/semImagem.png";

// Função para remover acentos
export const removeAccents = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// Mapeamento de ícones por chave (sem acento)
export const iconMap: Record<string, string> = {
  alimentacao: alimentacaoIcon,
  transporte: transporteIcon,
  mercado: mercadoIcon,
  investimento: investimentoIcon,
  utilidades: utilidadesIcon,
  entretenimento: entretenimentoIcon,
  saude: saudeIcon,
  pagamento: pagamentoIcon,
  academia: academiaIcon,
  caixapostal: caixapostalIcon,
  educacao: educacaoIcon,
  notafiscal: notafiscalIcon,
  petshop: petshopIcon,
  presente: presenteIcon,
  residencia: residenciaIcon,
  viagem: viagemIcon,
};

// Mapeamento de ícones por nome da categoria (sem acento)
export const categoryIconsByName: Record<string, string> = {
  Alimentacao: alimentacaoIcon,
  Transporte: transporteIcon,
  Mercado: mercadoIcon,
  Investimento: investimentoIcon,
  Utilidades: utilidadesIcon,
  Entretenimento: entretenimentoIcon,
  Salario: pagamentoIcon,
  Saude: saudeIcon,
  Academia: academiaIcon,
  CaixaPostal: caixapostalIcon,
  Educacao: educacaoIcon,
  NotaFiscal: notafiscalIcon,
  Petshop: petshopIcon,
  Presente: presenteIcon,
  Residencia: residenciaIcon,
  Viagem: viagemIcon,
};

// Função para obter ícone por nome da categoria (com ou sem acento)
export const getCategoryIcon = (categoryName: string) => {
  const normalized = removeAccents(categoryName);
  return categoryIconsByName[normalized] || semImagemIcon;
};

// Função para obter ícone por chave
export const getIconByKey = (iconKey: string) => {
  if (!iconKey) return semImagemIcon;
  const normalized = removeAccents(iconKey);
  return iconMap[normalized] || semImagemIcon;
};

// Função para obter classe de cor baseada no valor do banco
export const getColorClass = (color: string) => {
  if (!color) return "bg-gray-100 text-gray-600 border-gray-200";
  
  const colorLower = color.toLowerCase();
  
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-700 border-green-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    pink: "bg-pink-100 text-pink-700 border-pink-200",
    red: "bg-red-100 text-red-700 border-red-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    // Suporte para português
    verde: "bg-green-100 text-green-700 border-green-200",
    azul: "bg-blue-100 text-blue-700 border-blue-200",
    roxo: "bg-purple-100 text-purple-700 border-purple-200",
    rosa: "bg-pink-100 text-pink-700 border-pink-200",
    vermelho: "bg-red-100 text-red-700 border-red-200",
    laranja: "bg-orange-100 text-orange-700 border-orange-200",
    amarelo: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };
  
  return colorMap[colorLower] || "bg-gray-100 text-gray-600 border-gray-200";
};

// Função para obter a classe de fundo do ícone
export const getIconBgColor = (color: string) => {
  if (!color) return "bg-gray-100";
  
  const colorLower = color.toLowerCase();
  
  const colorMap: Record<string, string> = {
    green: "bg-green-100",
    blue: "bg-blue-100",
    purple: "bg-purple-100",
    pink: "bg-pink-100",
    red: "bg-red-100",
    orange: "bg-orange-100",
    yellow: "bg-yellow-100",
  };
  
  return colorMap[colorLower] || "bg-gray-100";
};

// Opções de ícones para o modal
export const iconOptions = [
  { key: "alimentacao", name: "Alimentação", src: alimentacaoIcon },
  { key: "transporte", name: "Transporte", src: transporteIcon },
  { key: "mercado", name: "Mercado", src: mercadoIcon },
  { key: "investimento", name: "Investimento", src: investimentoIcon },
  { key: "utilidades", name: "Utilidades", src: utilidadesIcon },
  { key: "entretenimento", name: "Entretenimento", src: entretenimentoIcon },
  { key: "saude", name: "Saúde", src: saudeIcon },
  { key: "pagamento", name: "Pagamento", src: pagamentoIcon },
  { key: "academia", name: "Academia", src: academiaIcon },
  { key: "caixapostal", name: "Caixa Postal", src: caixapostalIcon },
  { key: "educacao", name: "Educação", src: educacaoIcon },
  { key: "notafiscal", name: "Nota Fiscal", src: notafiscalIcon },
  { key: "petshop", name: "Petshop", src: petshopIcon },
  { key: "presente", name: "Presente", src: presenteIcon },
  { key: "residencia", name: "Residência", src: residenciaIcon },
  { key: "viagem", name: "Viagem", src: viagemIcon },
];

// Opções de cores
export const colorOptions = [
  { name: "Verde", value: "green", bg: "bg-green-100", text: "text-green-700", border: "border-green-200", buttonBg: "bg-green-500" },
  { name: "Azul", value: "blue", bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", buttonBg: "bg-blue-500" },
  { name: "Roxo", value: "purple", bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", buttonBg: "bg-purple-500" },
  { name: "Rosa", value: "pink", bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200", buttonBg: "bg-pink-500" },
  { name: "Vermelho", value: "red", bg: "bg-red-100", text: "text-red-700", border: "border-red-200", buttonBg: "bg-red-500" },
  { name: "Laranja", value: "orange", bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", buttonBg: "bg-orange-500" },
  { name: "Amarelo", value: "yellow", bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", buttonBg: "bg-yellow-500" },
];