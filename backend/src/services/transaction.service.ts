import { prisma } from "../lib/prisma.js";

export class TransactionService {
  async createTransaction(
    userId: string,
    data: {
      description: string;
      amount: number;
      type: string;
      date: string;
      categoryId: string;
    },
  ) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, userId },
    });
    if (!category) throw new Error("Category not found");

    const dateObj = new Date(data.date);
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date format");
    }

    const transaction = await prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        type: data.type,
        date: dateObj,
        userId,
        categoryId: data.categoryId,
      },
      include: { category: true },
    });

    return {
      ...transaction,
      date: transaction.date.toISOString(),
    };
  }

  async getTransactions(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
    });

    return transactions.map((t) => ({
      ...t,
      date: t.date.toISOString(),
    }));
  }

  async getTransactionById(userId: string, id: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (!transaction) return null;

    return {
      ...transaction,
      date: transaction.date.toISOString(),
    };
  }

  async updateTransaction(
    userId: string,
    id: string,
    data: {
      description?: string;
      amount?: number;
      type?: string;
      date?: string;
      categoryId?: string;
    },
  ) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!transaction) throw new Error("Transaction not found");

    const updateData: any = { ...data };

    if (data.date) {
      const dateObj = new Date(data.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date format");
      }
      updateData.date = dateObj;
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return {
      ...updated,
      date: updated.date.toISOString(),
    };
  }

  async deleteTransaction(userId: string, id: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!transaction) throw new Error("Transaction not found");
    await prisma.transaction.delete({ where: { id } });
    return true;
  }
}
