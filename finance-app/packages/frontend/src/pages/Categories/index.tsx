import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { graphqlRequest } from "../../services/api";
import { GET_ME } from "../../graphql/queries/user";
import { getColorClass, getCategoryIcon } from "../../utils/icons";
import { NewCategoryModal } from "../../components/NewCategoryModal";
import { EditCategoryModal } from "../../components/EditCategoryModal";
import Logo from "../../assets/Logo.png";
import editIcon from "../../assets/editar.png";
import deleteIcon from "../../assets/delete.png";
import tagIcon from "../../assets/tag.png";
import totalTransacaoIcon from "../../assets/totalTransacoes.png";

type Category = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
};

type Transaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: Category;
};

type User = {
  id: string;
  email: string;
  name: string;
};

type CategoryWithCount = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  count: number;
};

const CategoriesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [mostUsedCategory, setMostUsedCategory] = useState<{
    name: string;
    count: number;
    icon?: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithCount | null>(null);

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const fetchUser = async () => {
    try {
      const data = await graphqlRequest<{ me: User }>(GET_ME);
      setUser(data.me);
    } catch {
      console.error("Erro ao carregar usuário:");
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const query = `
        query GetCategories {
          categories {
            id
            name
            description
            icon
            color
          }
        }
      `;
      const data = await graphqlRequest<{ categories: Category[] }>(query);

      const transactionsQuery = `
        query GetTransactions {
          transactions {
            id
            amount
            type
            category {
              id
              name
            }
          }
        }
      `;
      const transactionsData = await graphqlRequest<{
        transactions: Transaction[];
      }>(transactionsQuery);

      const categoryCount = new Map<
        string,
        {
          name: string;
          count: number;
          icon?: string;
          color?: string;
          description?: string;
        }
      >();
      let totalTrans = 0;

      transactionsData.transactions.forEach((t) => {
        if (t.type === "EXPENSE") {
          totalTrans++;
          const catId = t.category.id;
          const catName = t.category.name;
          if (categoryCount.has(catId)) {
            const existing = categoryCount.get(catId)!;
            existing.count++;
          } else {
            categoryCount.set(catId, { name: catName, count: 1 });
          }
        }
      });

      setTotalTransactions(totalTrans);
      setTotalCategories(data.categories.length);

      const categoriesWithCount = data.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        count: categoryCount.get(cat.id)?.count || 0,
      }));

      categoriesWithCount.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(categoriesWithCount);

      let mostUsed = null;
      let maxCount = 0;
      categoryCount.forEach((value) => {
        if (value.count > maxCount) {
          maxCount = value.count;
          const catData = data.categories.find((c) => c.name === value.name);
          mostUsed = {
            name: value.name,
            count: value.count,
            icon: catData?.icon,
          };
        }
      });
      setMostUsedCategory(mostUsed);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      window.confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)
    ) {
      try {
        const deleteMutation = `
          mutation DeleteCategory($id: ID!) {
            deleteCategory(id: $id)
          }
        `;
        await graphqlRequest(deleteMutation, { id });
        await fetchCategories();
      } catch (error) {
        console.error("Erro ao excluir categoria:", error);
        alert("Erro ao excluir categoria. Tente novamente.");
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchUser();
    fetchCategories();
  }, []);

  if (loading) {
    return <p className="p-8">Carregando...</p>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-[Inter]">
      {/* HEADER */}
      <header className="w-full h-16 bg-white border-b border-[#E5E7EB] relative flex items-center px-8">
        <img src={Logo} alt="Financy" className="w-30" />

        <nav className="absolute left-1/2 -translate-x-1/2 flex gap-6 text-[14px]">
          <span
            className={`cursor-pointer transition-colors ${
              location.pathname === "/dashboard"
                ? "text-[#1F6343] font-semibold"
                : "text-[#6B7280] hover:text-[#1F6343]"
            }`}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </span>
          <span
            className={`cursor-pointer transition-colors ${
              location.pathname === "/transactions"
                ? "text-[#1F6343] font-semibold"
                : "text-[#6B7280] hover:text-[#1F6343]"
            }`}
            onClick={() => navigate("/transactions")}
          >
            Transações
          </span>
          <span
            className={`cursor-pointer transition-colors ${
              location.pathname === "/categories"
                ? "text-[#1F6343] font-semibold"
                : "text-[#6B7280] hover:text-[#1F6343]"
            }`}
            onClick={() => navigate("/categories")}
          >
            Categorias
          </span>
        </nav>

        <div className="ml-auto">
          <div
            className="w-10 h-10 rounded-full bg-[#1F6343] flex items-center justify-center font-semibold text-white cursor-pointer hover:bg-[#154d34] transition-colors"
            title={user?.name || "Usuário"}
          >
            {user ? getUserInitials(user.name) : "U"}
          </div>
        </div>
      </header>

      <main className="p-8">
        {/* TÍTULO E BOTÃO */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Categorias</h1>
            <p className="text-sm text-gray-500 mt-1">
              Organize suas transações por categorias
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1F6343] text-white rounded-lg hover:bg-[#154d34] transition-colors cursor-pointer"
          >
            + Nova categoria
          </button>
        </div>

        {/* CARDS DE ESTATÍSTICAS */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <img src={tagIcon} alt="Categorias" className="w-10 h-10" />
              <div className="flex-1">
                <p className="text-[32px] font-bold text-gray-800 leading-tight">
                  {totalCategories}
                </p>
                <p className="text-sm text-[#6B7280] leading-tight">
                  TOTAL DE CATEGORIAS
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <img
                src={totalTransacaoIcon}
                alt="Transações"
                className="w-10 h-10"
              />
              <div className="flex-1">
                <p className="text-[32px] font-bold text-gray-800 leading-tight">
                  {totalTransactions}
                </p>
                <p className="text-sm text-[#6B7280] leading-tight">
                  TOTAL DE TRANSAÇÕES
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              {mostUsedCategory ? (
                <img
                  src={getCategoryIcon(mostUsedCategory.name)}
                  alt={mostUsedCategory.name}
                  className="w-10 h-10"
                />
              ) : (
                <img
                  src={tagIcon}
                  alt="Nenhuma categoria"
                  className="w-10 h-10"
                />
              )}
              <div className="flex-1">
                <p className="text-[32px] font-bold text-gray-800 leading-tight">
                  {mostUsedCategory?.name || "Nenhuma"}
                </p>
                <p className="text-sm text-[#6B7280] leading-tight">
                  CATEGORIA MAIS UTILIZADA
                </p>
                {mostUsedCategory && (
                  <p className="text-sm text-gray-500 mt-1 leading-tight">
                    {mostUsedCategory.count}{" "}
                    {mostUsedCategory.count === 1 ? "item" : "itens"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* LISTA DE CATEGORIAS EM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length === 0 ? (
            <p className="text-center text-gray-500 py-12 col-span-3">
              Nenhuma categoria encontrada
            </p>
          ) : (
            categories.map((cat) => {
              const colorClass = getColorClass(cat.color || "");
              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-xl border border-[#E5E7EB] p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100">
                      <img
                        src={getCategoryIcon(cat.name)}
                        className="w-8 h-8"
                        alt={cat.name}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-800 text-base">
                          {cat.name}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingCategory(cat)}
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
                            onClick={() => handleDelete(cat.id, cat.name)}
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
                    <span className="text-sm font-medium text-gray-700">
                      {cat.count} {cat.count === 1 ? "item" : "itens"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* MODAL NOVA CATEGORIA */}
      {isModalOpen && (
        <NewCategoryModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchCategories();
          }}
        />
      )}

      {/* MODAL EDITAR CATEGORIA */}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={() => {
            fetchCategories();
          }}
        />
      )}
    </div>
  );
};

export { CategoriesPage };
