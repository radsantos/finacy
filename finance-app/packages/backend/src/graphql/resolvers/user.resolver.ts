import { AuthService } from "../../services/auth.service.js";
import prisma from "../../prisma/client.js";

const authService = new AuthService();

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");
      const user = await prisma.user.findUnique({
        where: { id: context.userId },
      });
      if (!user) throw new Error("User not found");
      return user;
    },
  },
  Mutation: {
    register: async (_: any, { input }: any) => {
      return await authService.register(
        input.email,
        input.password,
        input.name,
      );
    },
    login: async (_: any, { input }: any) => {
      return await authService.login(input.email, input.password);
    },
  },
};
