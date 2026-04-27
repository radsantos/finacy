import { prisma } from "../lib/prisma.js";

export class CategoryService {
  async createCategory(
    userId: string,
    data: {
      name: string;
      description?: string;
      icon?: string;
      color?: string;
    },
  ) {
    return await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        userId,
      },
    });
  }

  async getCategories(userId: string) {
    return await prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  }

  async getCategoryById(userId: string, id: string) {
    return await prisma.category.findFirst({
      where: { id, userId },
    });
  }

  async updateCategory(
    userId: string,
    id: string,
    data: {
      name?: string;
      description?: string;
      icon?: string;
      color?: string;
    },
  ) {
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) throw new Error("Category not found");
    return await prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(userId: string, id: string) {
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) throw new Error("Category not found");
    await prisma.category.delete({ where: { id } });
    return true;
  }
}
