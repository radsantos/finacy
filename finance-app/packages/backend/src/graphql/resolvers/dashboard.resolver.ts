import { prisma } from "../../lib/prisma.js";

export const dashboardResolvers = {
  Query: {
    dashboard: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");

      const transactions = await prisma.transaction.findMany({
        where: { userId: context.userId },
        include: { category: true },
        orderBy: { date: "desc" },
      });

      // 🔥 CONVERTER AS DATAS PARA ISO STRING 🔥
      const transactionsWithISO = transactions.map((t) => ({
        ...t,
        date: t.date.toISOString(),
      }));

      let balance = 0;
      let incomes = 0;
      let expenses = 0;

      transactionsWithISO.forEach((t) => {
        if (t.type === "INCOME") {
          incomes += t.amount;
          balance += t.amount;
        } else {
          expenses += t.amount;
          balance -= t.amount;
        }
      });

      // Calcular estatísticas por categoria
      const categoryMap = new Map();

      for (const t of transactionsWithISO) {
        if (t.type === "EXPENSE") {
          const catName = t.category.name;
          if (!categoryMap.has(catName)) {
            categoryMap.set(catName, { total: 0, count: 0 });
          }
          const stats = categoryMap.get(catName);
          stats.total += t.amount;
          stats.count += 1;
        }
      }

      const categories = Array.from(categoryMap.entries()).map(
        ([name, stats]) => ({
          name,
          total: stats.total,
          count: stats.count,
        }),
      );

      return {
        balance,
        incomes,
        expenses,
        transactions: transactionsWithISO,
        categories,
      };
    },
  },
};
