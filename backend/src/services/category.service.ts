import { prisma } from "../lib/prisma.js";

export class CategoryService {
  async getCategories(userId: string) {
    const categories = await prisma.category.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
        transactions: {
          select: {
            amount: true,
          },
        },
      },
    });

    return categories.map((category) => {
      const totalAmount = category.transactions.reduce(
        (total, transaction) => total + transaction.amount,
        0,
      );

      const { transactions, _count, ...categoryData } = category;

      return {
        ...categoryData,
        transactionCount: _count.transactions,
        totalAmount,
      };
    });
  }

  async getCategoryById(userId: string, categoryId: string) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
        transactions: {
          select: {
            amount: true,
          },
        },
      },
    });

    if (!category) {
      return null;
    }

    const totalAmount = category.transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0,
    );

    const { transactions, _count, ...categoryData } = category;

    return {
      ...categoryData,
      transactionCount: _count.transactions,
      totalAmount,
    };
  }
}
