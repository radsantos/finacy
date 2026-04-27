import { useState } from "react";
import { graphqlRequest } from "../services/api";
import { iconOptions, colorOptions } from "../utils/icons";

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
      icon
      color
    }
  }
`;

type IconOption = {
  key: string;
  name: string;
  src: string;
};

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
          icon: selectedIcon.key,
          color: selectedColor.value,
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
      <div className="bg-white rounded-2xl w-140 max-w-[90%] shadow-xl max-h-[90vh] overflow-y-auto">
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

          {/* Ícone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ícone
            </label>
            <div className="grid grid-cols-8 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon.key}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-10 h-10 p-1 flex items-center justify-center rounded-lg transition-all ${
                    selectedIcon.key === icon.key
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
