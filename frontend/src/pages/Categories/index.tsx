import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { graphqlRequest } from "../../services/api";

import {
  getColorClass,
  getIconBgColor,
  getIconByKey,
} from "../../utils/icons";

import { NewCategoryModal } from "../../components/NewCategoryModal";
import { EditCategoryModal } from "../../components/EditCategoryModal";

import editIcon from "../../assets/editar.png";
import deleteIcon from "../../assets/delete.png";
import tagIcon from "../../assets/tag.png";
import totalTransacaoIcon from "../../assets/totalTransacoes.png";

type Category = {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  transactionCount?: number | null;
  totalAmount?: number | null;
};

type CategoryWithCount = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  count: number;
  totalAmount: number;
};

type MostUsedCategory = {
  name: string;
  count: number;
  icon?: string;
} | null;

const CategoriesPage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const [deletingCategoryId, setDeletingCategoryId] = useState<
    string | null
  >(null);

  const [totalCategories, setTotalCategories] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [mostUsedCategory, setMostUsedCategory] =
    useState<MostUsedCategory>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState<CategoryWithCount | null>(null);

  const fetchCategories = useCallback(async (): Promise<void> => {
    setLoading(true);

    try {
      const categoriesQuery = `
        query GetCategories {
          categories {
            id
            name
            description
            icon
            color
            transactionCount
            totalAmount
          }
        }
      `;

      const categoriesData = await graphqlRequest<{
        categories: Category[];
      }>(categoriesQuery);

      const categoriesWithCount: CategoryWithCount[] =
        (categoriesData.categories ?? []).map((category) => ({
          id: category.id,
          name: category.name,
          description: category.description ?? "",
          icon: category.icon ?? undefined,
          color: category.color ?? undefined,
          count: category.transactionCount ?? 0,
          totalAmount: category.totalAmount ?? 0,
        }));

      categoriesWithCount.sort((categoryA, categoryB) =>
        categoryA.name.localeCompare(categoryB.name, "pt-BR"),
      );

      const totalTransactionsCount = categoriesWithCount.reduce(
        (total, category) => total + category.count,
        0,
      );

      const mostUsed =
        categoriesWithCount.reduce<CategoryWithCount | null>(
          (currentMostUsed, category) => {
            if (!currentMostUsed) {
              return category;
            }

            if (category.count > currentMostUsed.count) {
              return category;
            }

            return currentMostUsed;
          },
          null,
        );

      setCategories(categoriesWithCount);
      setTotalCategories(categoriesWithCount.length);
      setTotalTransactions(totalTransactionsCount);

      if (mostUsed && mostUsed.count > 0) {
        setMostUsedCategory({
          name: mostUsed.name,
          count: mostUsed.count,
          icon: mostUsed.icon,
        });
      } else {
        setMostUsedCategory(null);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);

      setCategories([]);
      setTotalCategories(0);
      setTotalTransactions(0);
      setMostUsedCategory(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (
    categoryId: string,
    categoryName: string,
  ): Promise<void> => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a categoria "${categoryName}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingCategoryId(categoryId);

    try {
      const deleteMutation = `
        mutation DeleteCategory($id: ID!) {
          deleteCategory(id: $id)
        }
      `;

      await graphqlRequest<{ deleteCategory: boolean }>(
        deleteMutation,
        {
          id: categoryId,
        },
      );

      await fetchCategories();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);

      window.alert(
        "Não foi possível excluir a categoria. Verifique se ela possui transações vinculadas.",
      );
    } finally {
      setDeletingCategoryId(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    void fetchCategories();
  }, [fetchCategories, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-gray-500">
          Carregando categorias...
        </p>
      </div>
    );
  }

  return (
    <main>
      {/* TÍTULO E BOTÃO */}
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Categorias
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Organize suas transações por categorias
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="
            inline-flex
            cursor-pointer
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-[#1F6343]
            px-4
            py-2.5
            text-sm
            font-medium
            text-white
            transition-colors
            hover:bg-[#154d34]
            focus:outline-none
            focus:ring-2
            focus:ring-[#1F6343]
            focus:ring-offset-2
          "
        >
          <span aria-hidden="true">+</span>
          Nova categoria
        </button>
      </section>

      {/* CARDS DE ESTATÍSTICAS */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {/* TOTAL DE CATEGORIAS */}
        <article className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <img
              src={tagIcon}
              alt=""
              aria-hidden="true"
              className="h-8 w-8 object-contain sm:h-10 sm:w-10"
            />

            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold leading-tight text-gray-800 sm:text-[32px]">
                {totalCategories}
              </p>

              <p className="text-xs leading-tight text-[#6B7280] sm:text-sm">
                TOTAL DE CATEGORIAS
              </p>
            </div>
          </div>
        </article>

        {/* TOTAL DE TRANSAÇÕES */}
        <article className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <img
              src={totalTransacaoIcon}
              alt=""
              aria-hidden="true"
              className="h-8 w-8 object-contain sm:h-10 sm:w-10"
            />

            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold leading-tight text-gray-800 sm:text-[32px]">
                {totalTransactions}
              </p>

              <p className="text-xs leading-tight text-[#6B7280] sm:text-sm">
                TOTAL DE TRANSAÇÕES
              </p>
            </div>
          </div>
        </article>

        {/* CATEGORIA MAIS UTILIZADA */}
        <article className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:col-span-2 sm:p-6 lg:col-span-1">
          <div className="flex items-center gap-3">
            <img
              src={
                mostUsedCategory
                  ? getIconByKey(mostUsedCategory.icon)
                  : tagIcon
              }
              alt=""
              aria-hidden="true"
              className="h-8 w-8 shrink-0 object-contain sm:h-10 sm:w-10"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold leading-tight text-gray-800 sm:text-[32px]">
                {mostUsedCategory?.name ?? "Nenhuma"}
              </p>

              <p className="text-xs leading-tight text-[#6B7280] sm:text-sm">
                CATEGORIA MAIS UTILIZADA
              </p>

              {mostUsedCategory && (
                <p className="mt-1 text-xs leading-tight text-gray-500">
                  {mostUsedCategory.count}{" "}
                  {mostUsedCategory.count === 1
                    ? "item"
                    : "itens"}
                </p>
              )}
            </div>
          </div>
        </article>
      </section>

      {/* LISTA DE CATEGORIAS */}
      <section>
        {categories.length === 0 ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-white px-6 py-12 text-center">
            <p className="text-sm text-gray-500">
              Nenhuma categoria encontrada
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => {
              const colorClass = getColorClass(category.color);

              const iconBgColor = getIconBgColor(
                category.color,
              );

              const iconImage = getIconByKey(category.icon);

              const isDeleting =
                deletingCategoryId === category.id;

              return (
                <article
                  key={category.id}
                  className="
                    flex
                    min-h-43.75
                    flex-col
                    justify-between
                    rounded-xl
                    border
                    border-[#E5E7EB]
                    bg-white
                    p-5
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:shadow-md
                  "
                >
                  {/* CONTEÚDO SUPERIOR */}
                  <div className="flex items-start gap-4">
                    {/* ÍCONE */}
                    <div
                      className={`
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${iconBgColor}
                      `}
                    >
                      <img
                        src={iconImage}
                        alt=""
                        aria-hidden="true"
                        className="h-7 w-7 object-contain"
                      />
                    </div>

                    {/* INFORMAÇÕES */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h2
                            className="truncate text-base font-semibold text-gray-800"
                            title={category.name}
                          >
                            {category.name}
                          </h2>

                          {category.description && (
                            <p
                              className="mt-1 line-clamp-2 text-sm leading-5 text-gray-500"
                              title={category.description}
                            >
                              {category.description}
                            </p>
                          )}
                        </div>

                        {/* BOTÕES */}
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingCategory(category)
                            }
                            disabled={isDeleting}
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              transition-colors
                              hover:bg-gray-100
                              focus:outline-none
                              focus:ring-2
                              focus:ring-gray-300
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                            title={`Editar ${category.name}`}
                            aria-label={`Editar categoria ${category.name}`}
                          >
                            <img
                              src={editIcon}
                              alt=""
                              aria-hidden="true"
                              className="h-4 w-4 object-contain"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDelete(
                                category.id,
                                category.name,
                              )
                            }
                            disabled={isDeleting}
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              transition-colors
                              hover:bg-red-50
                              focus:outline-none
                              focus:ring-2
                              focus:ring-red-200
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                            title={`Excluir ${category.name}`}
                            aria-label={`Excluir categoria ${category.name}`}
                          >
                            {isDeleting ? (
                              <span
                                className="
                                  h-4
                                  w-4
                                  animate-spin
                                  rounded-full
                                  border-2
                                  border-gray-300
                                  border-t-red-500
                                "
                              />
                            ) : (
                              <img
                                src={deleteIcon}
                                alt=""
                                aria-hidden="true"
                                className="h-4 w-4 object-contain"
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RODAPÉ */}
                  <footer className="mt-5 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                    <span
                      className={`
                        inline-flex
                        max-w-[70%]
                        items-center
                        truncate
                        whitespace-nowrap
                        rounded-full
                        border
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        leading-none
                        ${colorClass}
                      `}
                      title={category.name}
                    >
                      {category.name}
                    </span>

                    <span className="shrink-0 whitespace-nowrap text-sm font-medium text-gray-700">
                      {category.count}{" "}
                      {category.count === 1
                        ? "item"
                        : "itens"}
                    </span>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL DE NOVA CATEGORIA */}
      {isModalOpen && (
        <NewCategoryModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            void fetchCategories();
          }}
        />
      )}

      {/* MODAL DE EDIÇÃO */}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={() => {
            setEditingCategory(null);
            void fetchCategories();
          }}
        />
      )}
    </main>
  );
};

export { CategoriesPage };