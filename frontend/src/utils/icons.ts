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

/**
 * Remove acentos, espaços e converte o valor para minúsculo.
 *
 * Exemplos:
 * "Alimentação" -> "alimentacao"
 * "Caixa Postal" -> "caixapostal"
 * "NOTA FISCAL" -> "notafiscal"
 */
export const normalizeKey = (value?: string): string => {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "");
};

/**
 * Mantida por compatibilidade com outros componentes que possam
 * estar utilizando removeAccents.
 */
export const removeAccents = (value: string): string => {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

/**
 * Mapeamento dos ícones pelo valor salvo no banco.
 */
export const iconMap: Record<string, string> = {
  alimentacao: alimentacaoIcon,
  transporte: transporteIcon,
  mercado: mercadoIcon,
  investimento: investimentoIcon,
  utilidades: utilidadesIcon,
  entretenimento: entretenimentoIcon,
  saude: saudeIcon,
  pagamento: pagamentoIcon,
  salario: pagamentoIcon,
  academia: academiaIcon,
  caixapostal: caixapostalIcon,
  educacao: educacaoIcon,
  notafiscal: notafiscalIcon,
  petshop: petshopIcon,
  presente: presenteIcon,
  residencia: residenciaIcon,
  viagem: viagemIcon,
};

/**
 * Mapeamento dos ícones pelo nome da categoria.
 */
export const categoryIconsByName: Record<string, string> = {
  alimentacao: alimentacaoIcon,
  transporte: transporteIcon,
  mercado: mercadoIcon,
  investimento: investimentoIcon,
  utilidades: utilidadesIcon,
  entretenimento: entretenimentoIcon,
  salario: pagamentoIcon,
  pagamento: pagamentoIcon,
  saude: saudeIcon,
  academia: academiaIcon,
  caixapostal: caixapostalIcon,
  educacao: educacaoIcon,
  notafiscal: notafiscalIcon,
  petshop: petshopIcon,
  presente: presenteIcon,
  residencia: residenciaIcon,
  viagem: viagemIcon,
};

/**
 * Retorna o ícone baseado no nome da categoria.
 */
export const getCategoryIcon = (categoryName?: string): string => {
  const normalizedName = normalizeKey(categoryName);

  return categoryIconsByName[normalizedName] ?? semImagemIcon;
};

/**
 * Retorna o ícone baseado na chave salva no banco.
 */
export const getIconByKey = (iconKey?: string): string => {
  const normalizedKey = normalizeKey(iconKey);

  return iconMap[normalizedKey] ?? semImagemIcon;
};

/**
 * Apelidos de cores aceitos pelo sistema.
 *
 * Permite receber cores em português ou inglês.
 */
const colorAliases: Record<string, string> = {
  green: "green",
  verde: "green",

  blue: "blue",
  azul: "blue",

  purple: "purple",
  roxo: "purple",

  pink: "pink",
  rosa: "pink",

  red: "red",
  vermelho: "red",

  orange: "orange",
  laranja: "orange",

  yellow: "yellow",
  amarelo: "yellow",

  gray: "gray",
  grey: "gray",
  cinza: "gray",
};

/**
 * Normaliza o nome da cor.
 *
 * Exemplos:
 * "Verde" -> "green"
 * "ROXO" -> "purple"
 * " azul " -> "blue"
 */
export const normalizeColor = (color?: string): string => {
  const normalizedColor = normalizeKey(color);

  return colorAliases[normalizedColor] ?? "gray";
};

/**
 * Classes completas do Tailwind para as etiquetas das categorias.
 *
 * As classes precisam estar escritas integralmente para que o Tailwind
 * consiga encontrá-las durante o processo de build.
 */
const categoryColorClasses: Record<string, string> = {
  green: "bg-green-100 text-green-700 border-green-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  red: "bg-red-100 text-red-700 border-red-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
};

/**
 * Classes para o fundo do bloco do ícone.
 */
const iconBackgroundClasses: Record<string, string> = {
  green: "bg-green-100",
  blue: "bg-blue-100",
  purple: "bg-purple-100",
  pink: "bg-pink-100",
  red: "bg-red-100",
  orange: "bg-orange-100",
  yellow: "bg-yellow-100",
  gray: "bg-gray-100",
};

/**
 * Retorna as classes da etiqueta da categoria.
 */
export const getColorClass = (color?: string): string => {
  const normalizedColor = normalizeColor(color);

  return categoryColorClasses[normalizedColor] ?? categoryColorClasses.gray;
};

/**
 * Retorna a classe de fundo do ícone.
 */
export const getIconBgColor = (color?: string): string => {
  const normalizedColor = normalizeColor(color);

  return iconBackgroundClasses[normalizedColor] ?? iconBackgroundClasses.gray;
};

/**
 * Opções de ícones apresentadas nos formulários.
 */
export const iconOptions = [
  {
    key: "alimentacao",
    name: "Alimentação",
    src: alimentacaoIcon,
  },
  {
    key: "transporte",
    name: "Transporte",
    src: transporteIcon,
  },
  {
    key: "mercado",
    name: "Mercado",
    src: mercadoIcon,
  },
  {
    key: "investimento",
    name: "Investimento",
    src: investimentoIcon,
  },
  {
    key: "utilidades",
    name: "Utilidades",
    src: utilidadesIcon,
  },
  {
    key: "entretenimento",
    name: "Entretenimento",
    src: entretenimentoIcon,
  },
  {
    key: "saude",
    name: "Saúde",
    src: saudeIcon,
  },
  {
    key: "pagamento",
    name: "Pagamento",
    src: pagamentoIcon,
  },
  {
    key: "academia",
    name: "Academia",
    src: academiaIcon,
  },
  {
    key: "caixapostal",
    name: "Caixa Postal",
    src: caixapostalIcon,
  },
  {
    key: "educacao",
    name: "Educação",
    src: educacaoIcon,
  },
  {
    key: "notafiscal",
    name: "Nota Fiscal",
    src: notafiscalIcon,
  },
  {
    key: "petshop",
    name: "Petshop",
    src: petshopIcon,
  },
  {
    key: "presente",
    name: "Presente",
    src: presenteIcon,
  },
  {
    key: "residencia",
    name: "Residência",
    src: residenciaIcon,
  },
  {
    key: "viagem",
    name: "Viagem",
    src: viagemIcon,
  },
];

/**
 * Opções de cores apresentadas nos formulários.
 */
export const colorOptions = [
  {
    name: "Verde",
    value: "green",
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    buttonBg: "bg-green-500",
  },
  {
    name: "Azul",
    value: "blue",
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    buttonBg: "bg-blue-500",
  },
  {
    name: "Roxo",
    value: "purple",
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
    buttonBg: "bg-purple-500",
  },
  {
    name: "Rosa",
    value: "pink",
    bg: "bg-pink-100",
    text: "text-pink-700",
    border: "border-pink-200",
    buttonBg: "bg-pink-500",
  },
  {
    name: "Vermelho",
    value: "red",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    buttonBg: "bg-red-500",
  },
  {
    name: "Laranja",
    value: "orange",
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
    buttonBg: "bg-orange-500",
  },
  {
    name: "Amarelo",
    value: "yellow",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-200",
    buttonBg: "bg-yellow-500",
  },
];
