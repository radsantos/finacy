import { prisma } from "../lib/prisma.js";

type CreateCategoryData = {
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  type?: string | null;
};

type UpdateCategoryData = {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  type?: string | null;
};

export class CategoryService {
  async createCategory(userId: string, data: CreateCategoryData) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId,
        name: {
          equals: data.name.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      throw new Error("Já existe uma categoria com esse nome.");
    }

    const category = await prisma.category.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        icon: data.icon || null,
        color: data.color || null,
        type: data.type || "EXPENSE",
        userId,
      },
    });

    return {
      ...category,
      transactionCount: 0,
      totalAmount: 0,
    };
  }

  async getCategories(userId: string) {
    const categories = await prisma.category.findMany({
      where: {
        userId,
      },
      orderBy: {
        name: "asc",
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

  async getCategoryById(userId: string, id: string) {
    const category = await prisma.category.findFirst({
      where: {
        id,
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

  async updateCategory(userId: string, id: string, data: UpdateCategoryData) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingCategory) {
      throw new Error("Categoria não encontrada.");
    }

    if (data.name && data.name.trim() !== existingCategory.name) {
      const duplicatedCategory = await prisma.category.findFirst({
        where: {
          userId,
          id: {
            not: id,
          },
          name: {
            equals: data.name.trim(),
            mode: "insensitive",
          },
        },
      });

      if (duplicatedCategory) {
        throw new Error("Já existe uma categoria com esse nome.");
      }
    }

    const category = await prisma.category.update({
      where: {
        id,
      },
      data: {
        ...(data.name !== undefined && {
          name: data.name.trim(),
        }),
        ...(data.description !== undefined && {
          description: data.description?.trim() || null,
        }),
        ...(data.icon !== undefined && {
          icon: data.icon || null,
        }),
        ...(data.color !== undefined && {
          color: data.color || null,
        }),
        ...(data.type !== undefined && {
          type: data.type || "EXPENSE",
        }),
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

  async deleteCategory(userId: string, id: string): Promise<boolean> {
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error("Categoria não encontrada.");
    }

    if (category._count.transactions > 0) {
      throw new Error(
        "Não é possível excluir uma categoria que possui transações.",
      );
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return true;
  }
}
