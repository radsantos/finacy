import { verifyToken } from '../utils/jwt.js';

export interface Context {
  userId?: string;  // ← Mantém para compatibilidade
  user?: {
    id: string;
  };
}

export const createContext = async ({ req }: any): Promise<Context> => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (token) {
    try {
      const { userId } = verifyToken(token);
      
      console.log("✅ Token válido, userId:", userId); // Log para debug

      return {
        userId,  // ← Adiciona userId diretamente
        user: {
          id: userId,
        },
      };
    } catch (error) {
      console.error("❌ Token inválido:", error);
      return {};
    }
  }

  console.log("⚠️ Nenhum token encontrado");
  return {};
};