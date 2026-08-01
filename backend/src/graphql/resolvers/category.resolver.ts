import { CategoryService } from "../../services/category.service.js";

const categoryService = new CategoryService();

export const categoryResolvers = {
  Query: {
    categories: async (
      _: unknown,
      __: unknown,
      context: { userId: string },
    ) => {
      return categoryService.getCategories(context.userId);
    },

    category: async (
      _: unknown,
      { id }: { id: string },
      context: { userId: string },
    ) => {
      return categoryService.getCategoryById(context.userId, id);
    },
  },

  Mutation: {
    createCategory: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          name: string;
          description?: string;
          icon?: string;
          color?: string;
          type?: string;
        };
      },
      context: { userId: string },
    ) => {
      return categoryService.createCategory(context.userId, input);
    },

    updateCategory: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          name?: string;
          description?: string;
          icon?: string;
          color?: string;
          type?: string;
        };
      },
      context: { userId: string },
    ) => {
      return categoryService.updateCategory(context.userId, id, input);
    },

    deleteCategory: async (
      _: unknown,
      { id }: { id: string },
      context: { userId: string },
    ) => {
      return categoryService.deleteCategory(context.userId, id);
    },
  },
};
