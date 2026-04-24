import { useState } from "react";
import { graphqlRequest } from "../services/api";

type Category = {
  id: string;
  name: string;
  description: string;
  count: number;
};

type EditCategoryModalProps = {
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
};

const UPDATE_CATEGORY = `
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      description
    }
  }
`;

export const EditCategoryModal = ({
  category,
  onClose,
  onSuccess,
}: EditCategoryModalProps) => {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description || "");
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
      await graphqlRequest(UPDATE_CATEGORY, {
        id: category.id,
        input: {
          name: name.trim(),
          description: description.trim() || undefined,
        },
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      alert("Erro ao atualizar categoria. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-120 max-w-[90%] shadow-xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">
            Editar categoria
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da categoria *
            </label>
            <input
              type="text"
              placeholder="Ex: Alimentação, Transporte..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F6343] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              placeholder="Descreva o propósito desta categoria"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F6343] focus:border-transparent resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#1F6343] text-white font-semibold rounded-xl hover:bg-[#154d34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {submitting ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </div>
  );
};
