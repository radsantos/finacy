import { CategoryService } from "../../services/category.service";

const categoryService = new CategoryService();

export const categoryResolvers = {
  Query: {
    categories: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");
      return await categoryService.getCategories(context.userId);
    },
    category: async (_: any, { id }: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");
      return await categoryService.getCategoryById(context.userId, id);
    },
  },
  Mutation: {
    createCategory: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");
      return await categoryService.createCategory(context.userId, input);
    },
    updateCategory: async (_: any, { id, input }: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");
      return await categoryService.updateCategory(context.userId, id, input);
    },
    deleteCategory: async (_: any, { id }: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");
      return await categoryService.deleteCategory(context.userId, id);
    },
  },
};
