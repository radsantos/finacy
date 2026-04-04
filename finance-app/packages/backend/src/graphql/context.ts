import { verifyToken } from "../utils/jwt";

export interface Context {
  userId?: string;
}

export const createContext = async ({ req }: any): Promise<Context> => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (token) {
    try {
      const { userId } = verifyToken(token);
      return { userId };
    } catch (error) {
      return {};
    }
  }

  return {};
};
