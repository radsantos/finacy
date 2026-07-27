import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { readFileSync } from "fs";
import { join } from "path";
import { makeExecutableSchema } from "@graphql-tools/schema";
import dotenv from "dotenv";

dotenv.config();

import { userResolvers } from "./graphql/resolvers/user.resolver.js";
import { categoryResolvers } from "./graphql/resolvers/category.resolver.js";
import { transactionResolvers } from "./graphql/resolvers/transaction.resolver.js";
import { dashboardResolvers } from "./graphql/resolvers/dashboard.resolver.js";
import { createContext } from "./graphql/context.js";

const isDevelopment = process.env.NODE_ENV !== "production";

const userSchema = readFileSync(
  join(process.cwd(), "src/graphql/schemas/user.graphql"),
  "utf8",
);
const categorySchema = readFileSync(
  join(process.cwd(), "src/graphql/schemas/category.graphql"),
  "utf8",
);
const transactionSchema = readFileSync(
  join(process.cwd(), "src/graphql/schemas/transaction.graphql"),
  "utf8",
);

const typeDefs = `
  type Query {
    _empty: String
  }
  
  type Mutation {
    _empty: String
  }
  
  ${userSchema}
  ${categorySchema}
  ${transactionSchema}
`;

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...categoryResolvers.Query,
    ...transactionResolvers.Query,
    ...dashboardResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...transactionResolvers.Mutation,
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Security Headers
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: [
            "'self'",
            "https://financy-frontend-nu.vercel.app",
            "https://finacy-frontend-test.vercel.app",
            "https://financy-frontend-dun.vercel.app",
          ],
        },
      },
    }),
  );

  //  Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Muitas requisições. Tente novamente mais tarde.",
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/graphql", limiter);

  // Apollo Server v5
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: isDevelopment,
    status400ForVariableCoercionErrors: true,
    formatError: (formattedError) => {
      if (!isDevelopment) {
        const extensions = formattedError.extensions as Record<string, unknown>;
        const code = extensions?.code;

        const safeErrors = ["UNAUTHENTICATED", "FORBIDDEN", "BAD_USER_INPUT"];

        if (code && safeErrors.includes(code as string)) {
          return {
            message: formattedError.message,
            extensions: { code },
          };
        }

        return {
          message: "Ocorreu um erro interno. Tente novamente mais tarde.",
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        };
      }
      return formattedError;
    },
  });

  await server.start();

  const allowedOrigins = [
    "http://localhost:5173",
    "https://financy-frontend-nu.vercel.app",
    "https://finacy-frontend-test.vercel.app",
    "https://financy-frontend-dun.vercel.app",
  ];

  app.use(
    "/graphql",
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          if (isDevelopment) {
            console.log(`Blocked origin: ${origin}`);
          }
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
    express.json({ limit: "10mb" }),
    expressMiddleware(server, {
      context: async ({ req }) => await createContext({ req }),
    }),
  );

  const PORT = process.env.PORT || 4000;

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve),
  );

  if (isDevelopment) {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`✅ CORS enabled for: ${allowedOrigins.join(", ")}`);
  } else {
    console.log(`🚀 Server ready on port ${PORT}`);
  }
}

startServer().catch(console.error);
