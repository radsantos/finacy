import { prisma } from "../lib/prisma.js";

export class TransactionService {
  async createTransaction(userId: string, data: any) {
    const category = await prisma.category.findFirst({ where: { id: data.categoryId, userId } });
    if (!category) throw new Error('Category not found');
    return await prisma.transaction.create({ data: { ...data, userId }, include: { category: true } });
  }

  async getTransactions(userId: string) {
    return await prisma.transaction.findMany({ where: { userId }, include: { category: true }, orderBy: { date: 'desc' } });
  }

  async getTransactionById(userId: string, id: string) {
    return await prisma.transaction.findFirst({ where: { id, userId }, include: { category: true } });
  }

  async updateTransaction(userId: string, id: string, data: any) {
    const transaction = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!transaction) throw new Error('Transaction not found');
    return await prisma.transaction.update({ where: { id }, data, include: { category: true } });
  }

  async deleteTransaction(userId: string, id: string) {
    const transaction = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!transaction) throw new Error('Transaction not found');
    await prisma.transaction.delete({ where: { id } });
    return true;
  }
}