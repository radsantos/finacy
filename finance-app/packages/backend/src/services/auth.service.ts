import { prisma } from "../lib/prisma.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";

export class AuthService {
  async register(email: string, password: string, name?: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("User already exists");

    const passwordHash = await hashPassword(password);

    const defaultCategories = [
      { name: "Alimentação", description: "Gastos com comida e mercado" },
      { name: "Transporte", description: "Uber, ônibus, metrô, gasolina" },
      { name: "Mercado", description: "Compras de supermercado" },
      { name: "Entretenimento", description: "Cinema, shows, jogos" },
      { name: "Utilidades", description: "Contas de água, luz, internet" },
      { name: "Saúde", description: "Médico, farmácia, exames" },
      { name: "Educação", description: "Cursos, livros, material escolar" },
      { name: "Moradia", description: "Aluguel, condomínio, contas" },
    ];

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        categories: {
          create: defaultCategories,
        },
      },
      include: {
        categories: true,
      },
    });

    const token = generateToken(user.id);
    return { token, user };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) throw new Error("Invalid credentials");
    const token = generateToken(user.id);
    return { token, user };
  }

  async getUserById(userId: string) {
    return await prisma.user.findUnique({ where: { id: userId } });
  }
}
