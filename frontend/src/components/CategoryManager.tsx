import { useState, useEffect } from "react";
import { graphqlRequest } from "../services/api";
import {
  GET_CATEGORIES,
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
} from "../graphql/queries/categories";
import { getIconByKey, getColorClass, getIconBgColor } from "../utils/icons";
import editIcon from "../assets/editar.png";
import deleteIcon from "../assets/delete.png";

type Category = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
};

type CategoryManagerProps = {
  onClose?: () => void;
  onSuccess?: () => void;
};

export const CategoryManager = ({
  onClose,
  onSuccess,
}: CategoryManagerProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#1F6343",
  });

  const fetchCategories = async () => {
    try {
      const data = await graphqlRequest<{ categories: Category[] }>(
        GET_CATEGORIES,
      );
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await graphqlRequest(CREATE_CATEGORY, {
        input: {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          color: formData.color,
        },
      });
      setIsCreating(false);
      setFormData({ name: "", description: "", icon: "", color: "#1F6343" });
      await fetchCategories();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      alert("Erro ao criar categoria. Tente novamente.");
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      await graphqlRequest(UPDATE_CATEGORY, {
        id: editingCategory.id,
        input: {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          color: formData.color,
        },
      });
      setEditingCategory(null);
      setFormData({ name: "", description: "", icon: "", color: "#1F6343" });
      await fetchCategories();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      alert("Erro ao atualizar categoria. Tente novamente.");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (
      window.confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)
    ) {
      try {
        await graphqlRequest(DELETE_CATEGORY, { id });
        await fetchCategories();
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error("Erro ao excluir categoria:", error);
        alert("Erro ao excluir categoria. Tente novamente.");
      }
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "#1F6343",
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setIsCreating(false);
    setFormData({ name: "", description: "", icon: "", color: "#1F6343" });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Carregando categorias...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Gerenciar Categorias
        </h2>
        {!isCreating && !editingCategory && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-[#1F6343] text-white rounded-lg hover:bg-[#154d34] transition-colors"
          >
            + Nova categoria
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Formulário de criação/edição */}
      {(isCreating || editingCategory) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {editingCategory ? "Editar categoria" : "Nova categoria"}
          </h3>
          <form
            onSubmit={
              editingCategory ? handleUpdateCategory : handleCreateCategory
            }
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6343]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F6343]"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-20 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1F6343] text-white rounded-lg hover:bg-[#154d34] transition-colors"
                >
                  {editingCategory ? "Salvar" : "Criar"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Lista de categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <p className="text-center text-gray-500 py-12 col-span-3">
            Nenhuma categoria encontrada
          </p>
        ) : (
          categories.map((cat) => {
            const colorClass = getColorClass(cat.color || "");
            const iconBgColor = getIconBgColor(cat.color || "");
            const iconImage = getIconByKey(cat.icon || "");
            return (
              <div
                key={cat.id}
                className="bg-white rounded-xl border border-[#E5E7EB] p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgColor}`}
                  >
                    <img src={iconImage} className="w-8 h-8" alt={cat.name} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800 text-base">
                        {cat.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <img
                            src={editIcon}
                            className="w-4 h-4"
                            alt="editar"
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <img
                            src={deleteIcon}
                            className="w-4 h-4"
                            alt="excluir"
                          />
                        </button>
                      </div>
                    </div>
                    {cat.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${colorClass}`}
                  >
                    {cat.name}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CategoryManager;
