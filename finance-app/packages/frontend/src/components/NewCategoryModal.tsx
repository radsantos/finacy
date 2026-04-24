import { useState } from "react";
import { graphqlRequest } from "../services/api";

// Importar imagens PNG
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

type NewCategoryModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

const CREATE_CATEGORY = `
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      description
    }
  }
`;

// Opções de ícones com imagens PNG
type IconOption = {
  src: string;
  name: string;
};

const iconOptions: IconOption[] = [
  { src: alimentacaoIcon, name: "Alimentação" },
  { src: transporteIcon, name: "Transporte" },
  { src: mercadoIcon, name: "Mercado" },
  { src: investimentoIcon, name: "Investimento" },
  { src: utilidadesIcon, name: "Utilidades" },
  { src: entretenimentoIcon, name: "Entretenimento" },
  { src: saudeIcon, name: "Saúde" },
  { src: pagamentoIcon, name: "Pagamento" },
  { src: academiaIcon, name: "Academia" },
  { src: caixapostalIcon, name: "Caixa Postal" },
  { src: educacaoIcon, name: "Educação" },
  { src: notafiscalIcon, name: "Nota Fiscal" },
  { src: petshopIcon, name: "Petshop" },
  { src: presenteIcon, name: "Presente" },
  { src: residenciaIcon, name: "Residência" },
  { src: viagemIcon, name: "Viagem" },
];

// Opções de cores
const colorOptions = [
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

export const NewCategoryModal = ({
  onClose,
  onSuccess,
}: NewCategoryModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconOption>(iconOptions[0]);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Por favor, preencha o nome da categoria");
      return;
    }

    if (name.length > 50) {
      alert("O nome da categoria deve ter no máximo 50 caracteres");
      return;
    }

    try {
      setSubmitting(true);
      await graphqlRequest(CREATE_CATEGORY, {
        input: {
          name: name.trim(),
          description: description.trim() || undefined,
        },
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      alert("Erro ao criar categoria. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[560px] max-w-[90%] shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header com ícone de fechar */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Nova categoria
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Organize suas transações com categorias
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              placeholder="Ex. Alimentação"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6343] focus:border-transparent"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              placeholder="Descrição da categoria"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6343] focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">Opcional</p>
          </div>

          {/* Ícone - sem cor verde no ícone selecionado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ícone
            </label>
            <div className="grid grid-cols-8 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-10 h-10 p-1 flex items-center justify-center rounded-lg transition-all ${
                    selectedIcon.name === icon.name
                      ? "ring-2 ring-[#1F6343] ring-offset-2 bg-gray-100"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <img
                    src={icon.src}
                    alt={icon.name}
                    className="w-6 h-6 object-contain"
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Opcional</p>
          </div>

          {/* Cor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor
            </label>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg transition-all ${color.buttonBg} ${
                    selectedColor.value === color.value
                      ? "ring-2 ring-offset-2 ring-gray-400"
                      : ""
                  }`}
                  title={color.name}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Opcional</p>
          </div>

          {/* Botão Salvar */}
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full py-3 bg-[#1F6343] text-white font-semibold rounded-lg hover:bg-[#154d34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </div>
  );
};
