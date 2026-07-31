export type TransactionType = "INCOME" | "EXPENSE";

export type TransactionCategory = {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
};

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category: TransactionCategory | null;
};
