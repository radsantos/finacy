import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret-key-change-in-production";

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): { userId: string } => {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
    userId: string;
  };
  return { userId: decoded.userId };
};
