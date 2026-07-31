import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { graphqlRequest } from "../services/api";

import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from "../types/transaction";

type TransactionModalMode = "create" | "edit";

type TransactionModalProps = {
  mode: TransactionModalMode;
  transaction?: Transaction;
  onClose: () => void;
  onSuccess: () => void;
};

type TransactionFormState = {
  type: TransactionType;
  description: string;
  date: string;
  amount: string;
  categoryId: string;
};

const GET_CATEGORIES = `
  query GetCategories {
    categories {
      id
      name
      color
      icon
    }
  }
`;

const CREATE_TRANSACTION = `
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      description
      amount
      type
      date
      category {
        id
        name
        color
        icon
      }
    }
  }
`;

const UPDATE_TRANSACTION = `
  mutation UpdateTransaction(
    $id: ID!
    $input: UpdateTransactionInput!
  ) {
    updateTransaction(id: $id, input: $input) {
      id
      description
      amount
      type
      date
      category {
        id
        name
        color
        icon
      }
    }
  }
`;

const getLocalDate = (): string => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeTransactionDate = (
  date?: string,
): string => {
  if (!date) {
    return getLocalDate();
  }

  if (date.includes("T")) {
    return date.split("T")[0];
  }

  if (/^\d+$/.test(date)) {
    const parsedDate = new Date(Number(date));

    if (!Number.isNaN(parsedDate.getTime())) {
      const year = parsedDate.getFullYear();
      const month = String(
        parsedDate.getMonth() + 1,
      ).padStart(2, "0");
      const day = String(parsedDate.getDate()).padStart(
        2,
        "0",
      );

      return `${year}-${month}-${day}`;
    }
  }

  return date;
};

const formatAmountInput = (
  value: number,
): string => {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const convertAmountToNumber = (
  value: string,
): number => {
  return Number(
    value.replace(/\./g, "").replace(",", "."),
  );
};

const createInitialForm = (
  transaction?: Transaction,
): TransactionFormState => {
  if (!transaction) {
    return {
      type: "EXPENSE",
      description: "",
      date: getLocalDate(),
      amount: "",
      categoryId: "",
    };
  }

  return {
    type: transaction.type,
    description: transaction.description,
    date: normalizeTransactionDate(transaction.date),
    amount: formatAmountInput(transaction.amount),
    categoryId: transaction.category?.id ?? "",
  };
};

export const TransactionModal = ({
  mode,
  transaction,
  onClose,
  onSuccess,
}: TransactionModalProps) => {
  const [form, setForm] =
    useState<TransactionFormState>(() =>
      createInitialForm(transaction),
    );

  const [categories, setCategories] = useState<
    TransactionCategory[]
  >([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [isCategoryOpen, setIsCategoryOpen] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const isEditing = mode === "edit";

  useEffect(() => {
    setForm(createInitialForm(transaction));
  }, [transaction, mode]);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async (): Promise<void> => {
      try {
        setLoadingCategories(true);

        const data = await graphqlRequest<{
          categories: TransactionCategory[];
        }>(GET_CATEGORIES);

        if (isMounted) {
          setCategories(data.categories ?? []);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar categorias:",
          error,
        );

        if (isMounted) {
          setErrorMessage(
            "Não foi possível carregar as categorias.",
          );
        }
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    };

    void fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCategory = useMemo(() => {
    return categories.find(
      (category) => category.id === form.categoryId,
    );
  }, [categories, form.categoryId]);

  const setField = <K extends keyof TransactionFormState>(
    field: K,
    value: TransactionFormState[K],
  ): void => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleAmountChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const digits = event.target.value.replace(/\D/g, "");

    if (!digits) {
      setField("amount", "");
      return;
    }

    const numericValue = Number(digits) / 100;

    setField(
      "amount",
      numericValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );
  };

  const validateForm = (): boolean => {
    setErrorMessage("");

    if (!form.description.trim()) {
      setErrorMessage("Preencha a descrição.");
      return false;
    }

    if (!form.date) {
      setErrorMessage("Informe a data.");
      return false;
    }

    if (!form.categoryId) {
      setErrorMessage("Selecione uma categoria.");
      return false;
    }

    const amountValue = convertAmountToNumber(
      form.amount,
    );

    if (
      Number.isNaN(amountValue) ||
      amountValue <= 0
    ) {
      setErrorMessage("Informe um valor válido.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const amountValue = convertAmountToNumber(
      form.amount,
    );

    const correctedDate = `${form.date}T00:00:00.000Z`;

    const input = {
      description: form.description.trim(),
      amount: amountValue,
      type: form.type,
      date: correctedDate,
      categoryId: form.categoryId,
    };

    try {
      setSubmitting(true);
      setErrorMessage("");

      if (isEditing) {
        if (!transaction?.id) {
          throw new Error(
            "Identificador da transação não informado.",
          );
        }

        await graphqlRequest(UPDATE_TRANSACTION, {
          id: transaction.id,
          input,
        });
      } else {
        await graphqlRequest(CREATE_TRANSACTION, {
          input,
        });
      }

      onSuccess();
    } catch (error) {
      console.error(
        isEditing
          ? "Erro ao atualizar transação:"
          : "Erro ao criar transação:",
        error,
      );

      setErrorMessage(
        isEditing
          ? "Não foi possível atualizar a transação."
          : "Não foi possível criar a transação.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        px-4
        py-6
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-modal-title"
    >
      <div
        className="
          max-h-[95vh]
          w-full
          max-w-130
          overflow-y-auto
          rounded-2xl
          bg-white
          shadow-xl
        "
      >
        {/* CABEÇALHO */}
        <header className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2
              id="transaction-modal-title"
              className="text-xl font-semibold text-gray-800"
            >
              {isEditing
                ? "Editar transação"
                : "Nova transação"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {isEditing
                ? "Edite os dados da sua transação"
                : "Cadastre uma nova movimentação financeira"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              text-gray-400
              transition-colors
              hover:bg-gray-100
              hover:text-gray-600
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {/* TIPO */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() =>
                setField("type", "EXPENSE")
              }
              className={`
                rounded-xl
                border
                py-3
                font-medium
                transition-colors
                ${
                  form.type === "EXPENSE"
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                }
              `}
            >
              Despesa
            </button>

            <button
              type="button"
              onClick={() =>
                setField("type", "INCOME")
              }
              className={`
                rounded-xl
                border
                py-3
                font-medium
                transition-colors
                ${
                  form.type === "INCOME"
                    ? "border-green-200 bg-green-50 text-green-600"
                    : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                }
              `}
            >
              Receita
            </button>
          </div>

          {/* DESCRIÇÃO */}
          <div>
            <label
              htmlFor="transaction-description"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Descrição
            </label>

            <input
              id="transaction-description"
              type="text"
              value={form.description}
              onChange={(event) =>
                setField(
                  "description",
                  event.target.value,
                )
              }
              placeholder="Ex.: Almoço no restaurante"
              className="
                w-full
                rounded-xl
                border
                border-gray-200
                px-4
                py-3
                outline-none
                transition
                focus:border-transparent
                focus:ring-2
                focus:ring-[#1F6343]
              "
              required
            />
          </div>

          {/* DATA E VALOR */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="transaction-date"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Data
              </label>

              <input
                id="transaction-date"
                type="date"
                value={form.date}
                onChange={(event) =>
                  setField("date", event.target.value)
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  px-4
                  py-3
                  outline-none
                  transition
                  focus:border-transparent
                  focus:ring-2
                  focus:ring-[#1F6343]
                "
                required
              />
            </div>

            <div>
              <label
                htmlFor="transaction-amount"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Valor
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  R$
                </span>

                <input
                  id="transaction-amount"
                  type="text"
                  inputMode="numeric"
                  value={form.amount}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    py-3
                    pl-11
                    pr-4
                    outline-none
                    transition
                    focus:border-transparent
                    focus:ring-2
                    focus:ring-[#1F6343]
                  "
                  required
                />
              </div>
            </div>
          </div>

          {/* CATEGORIA */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Categoria
            </label>

            {loadingCategories ? (
              <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-400">
                Carregando categorias...
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setIsCategoryOpen(
                      (currentValue) =>
                        !currentValue,
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-4
                    py-3
                    text-left
                    outline-none
                    transition
                    focus:ring-2
                    focus:ring-[#1F6343]
                  "
                >
                  <span
                    className={
                      selectedCategory
                        ? "text-gray-800"
                        : "text-gray-400"
                    }
                  >
                    {selectedCategory?.name ??
                      "Selecione uma categoria"}
                  </span>

                  <svg
                    className={`
                      h-4
                      w-4
                      text-gray-400
                      transition-transform
                      ${
                        isCategoryOpen
                          ? "rotate-180"
                          : ""
                      }
                    `}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isCategoryOpen && (
                  <div
                    className="
                      absolute
                      left-0
                      right-0
                      z-20
                      mt-1
                      max-h-48
                      overflow-y-auto
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      py-1
                      shadow-lg
                    "
                  >
                    {categories.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-gray-500">
                        Nenhuma categoria cadastrada.
                      </p>
                    ) : (
                      categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            setField(
                              "categoryId",
                              category.id,
                            );

                            setIsCategoryOpen(false);
                          }}
                          className={`
                            w-full
                            px-4
                            py-2.5
                            text-left
                            text-sm
                            transition-colors
                            hover:bg-gray-50
                            ${
                              form.categoryId ===
                              category.id
                                ? "bg-green-50 font-medium text-[#1F6343]"
                                : "text-gray-700"
                            }
                          `}
                        >
                          {category.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ERRO */}
          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {errorMessage}
            </div>
          )}

          {/* BOTÕES */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="
                flex-1
                rounded-xl
                border
                border-gray-300
                bg-white
                py-3
                font-semibold
                text-gray-700
                transition-colors
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                submitting || loadingCategories
              }
              className="
                flex-1
                rounded-xl
                bg-[#1F6343]
                py-3
                font-semibold
                text-white
                transition-colors
                hover:bg-[#154d34]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {submitting
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Criar transação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};