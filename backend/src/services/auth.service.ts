import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";

export class AuthService {
  async register(email: string, password: string, name?: string) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("User already exists");
      }

      const passwordHash = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email,
          password: passwordHash,
          name,
        },
      });

      const token = generateToken(user.id);

      return { token, user };
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);

      if (error instanceof Error && error.message === "User already exists") {
        throw new Error("Este e-mail já está cadastrado.");
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(
          "Não foi possível acessar o banco de dados. Tente novamente mais tarde.",
        );
      }

      throw new Error(
        "Erro interno ao realizar o cadastro. Tente novamente mais tarde.",
      );
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error("Invalid credentials");
      }

      const isValid = await comparePassword(password, user.password);

      if (!isValid) {
        throw new Error("Invalid credentials");
      }

      const token = generateToken(user.id);

      return { token, user };
    } catch (error) {
      console.error("Erro ao realizar login:", error);

      if (error instanceof Error && error.message === "Invalid credentials") {
        throw new Error("E-mail ou senha inválidos.");
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(
          "Não foi possível acessar o banco de dados. Tente novamente mais tarde.",
        );
      }

      throw new Error(
        "Erro interno ao realizar o login. Tente novamente mais tarde.",
      );
    }
  }

  async getUserById(userId: string) {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error("Não foi possível acessar os dados do usuário.");
      }

      throw new Error("Erro interno ao buscar usuário.");
    }
  }
}
