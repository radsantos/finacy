import { useState, useEffect } from "react";
import { graphqlRequest } from "../services/api";
import { GET_CATEGORIES, CREATE_CATEGORY, DELETE_CATEGORY } from "../graphql/queries/categories";

type Category = {
  id: string;
  name: string;
  description: string;
};

type CategoryManagerProps = {
  onCategoryCreated?: () => void;
};

const defaultCategories = [
  "Alimentação",
  "Transporte",
  "Mercado",
  "Entretenimento",
  "Utilidades"
];

export const CategoryManager = ({ onCategoryCreated }: CategoryManagerProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await graphqlRequest<{ categories: Category[] }>(GET_CATEGORIES);
      setCategories(data.categories);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, description: string) => {
    try {
      const data = await graphqlRequest<{ createCategory: Category }>(
        CREATE_CATEGORY,
        {
          input: {
            name,
            description,
          },
        }
      );
      console.log("Categoria criada:", data.createCategory);
      await fetchCategories();
      if (onCategoryCreated) onCategoryCreated();
      return data.createCategory;
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await graphqlRequest(DELETE_CATEGORY, { id });
      await fetchCategories();
      if (onCategoryCreated) onCategoryCreated();
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsCreating(true);
    try {
      await createCategory(newCategoryName, newCategoryDescription);
      setNewCategoryName("");
      setNewCategoryDescription("");
    } finally {
      setIsCreating(false);
    }
  };

  const createDefaultCategories = async () => {
    setIsCreating(true);
    try {
      for (const catName of defaultCategories) {
        await createCategory(catName, `Categoria: ${catName}`);
      }
      alert("Categorias padrão criadas com sucesso!");
    } catch (error) {
      console.error("Erro ao criar categorias padrão:", error);
      alert("Erro ao criar categorias padrão");
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Carregando categorias...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Botão para criar categorias padrão */}
      {categories.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-700 mb-3">Você não tem nenhuma categoria ainda.</p>
          <button
            onClick={createDefaultCategories}
            disabled={isCreating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreating ? "Criando..." : "Criar categorias padrão"}
          </button>
        </div>
      )}

      {/* Formulário para nova categoria */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Nova Categoria</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nome da categoria (ex: Alimentação)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F6343]"
            required
          />
          <input
            type="text"
            placeholder="Descrição (opcional)"
            value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F6343]"
          />
          <button
            type="submit"
            disabled={isCreating || !newCategoryName.trim()}
            className="w-full px-4 py-2 bg-[#1F6343] text-white rounded-md hover:bg-[#154d34] disabled:opacity-50"
          >
            {isCreating ? "Salvando..." : "Salvar categoria"}
          </button>
        </div>
      </form>

      {/* Lista de categorias existentes */}
      {categories.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Suas Categorias ({categories.length})</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div>
                  <span className="font-medium text-gray-800">{cat.name}</span>
                  {cat.description && (
                    <p className="text-sm text-gray-500">{cat.description}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Deseja excluir a categoria "${cat.name}"?`)) {
                      deleteCategory(cat.id);
                    }
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};