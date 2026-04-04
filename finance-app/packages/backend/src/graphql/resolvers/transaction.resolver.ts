import { TransactionService } from "../../services/transaction.service";

const transactionService = new TransactionService();

export const transactionResolvers = {
  Query: {
    transactions: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");
      return await transactionService.getTransactions(context.userId);
    },
    transaction: async (_: any, { id }: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");
      return await transactionService.getTransactionById(context.userId, id);
    },
  },
  Mutation: {
    createTransaction: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");
      return await transactionService.createTransaction(context.userId, {
        ...input,
        date: new Date(input.date),
        amount: parseFloat(input.amount),
      });
    },
    updateTransaction: async (_: any, { id, input }: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");
      const updateData = { ...input };
      if (input.date) updateData.date = new Date(input.date);
      if (input.amount) updateData.amount = parseFloat(input.amount);
      return await transactionService.updateTransaction(
        context.userId,
        id,
        updateData,
      );
    },
    deleteTransaction: async (_: any, { id }: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");
      return await transactionService.deleteTransaction(context.userId, id);
    },
  },
};
