import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors, { type CorsOptions } from "cors";
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

const environmentOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  ...environmentOrigins,
]);

const vercelPreviewPattern =
  /^https:\/\/finacy-frontend(?:-[a-z0-9-]+)*-rogerio-almeida-dos-santos-projects\.vercel\.app$/i;

const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) {
    return true;
  }

  return allowedOrigins.has(origin) || vercelPreviewPattern.test(origin);
};

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    console.warn(`🚫 Origem bloqueada pelo CORS: ${origin}`);

    callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization", "Apollo-Require-Preflight"],

  exposedHeaders: ["Content-Length"],

  maxAge: 86400,
  optionsSuccessStatus: 204,
};

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

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

async function startServer(): Promise<void> {
  const app = express();
  const httpServer = http.createServer(app);

  app.get("/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
      service: "finacy-backend",
      environment: process.env.NODE_ENV ?? "development",
      timestamp: new Date().toISOString(),
    });
  });

  /*
   * O CORS precisa ser registrado antes do Apollo,
   * do rate limit e da rota /graphql.
   */
  app.use(cors(corsOptions));

  app.options("/graphql", cors(corsOptions));

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,

      crossOriginResourcePolicy: {
        policy: "cross-origin",
      },

      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],

          scriptSrc: ["'self'", "'unsafe-inline'"],

          styleSrc: ["'self'", "'unsafe-inline'"],

          imgSrc: ["'self'", "data:", "https:"],

          connectSrc: [
            "'self'",
            ...Array.from(allowedOrigins),
            "https://*.vercel.app",
          ],
        },
      },
    }),
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,

    message: {
      error: "Muitas requisições. Tente novamente mais tarde.",
    },

    standardHeaders: true,
    legacyHeaders: false,
  });

  const server = new ApolloServer({
    schema,

    plugins: [
      ApolloServerPluginDrainHttpServer({
        httpServer,
      }),
    ],

    introspection: isDevelopment,

    status400ForVariableCoercionErrors: true,

    formatError: (formattedError) => {
      if (isDevelopment) {
        return formattedError;
      }

      const extensions = formattedError.extensions as Record<string, unknown>;

      const code = extensions?.code;

      const safeErrors = ["UNAUTHENTICATED", "FORBIDDEN", "BAD_USER_INPUT"];

      if (typeof code === "string" && safeErrors.includes(code)) {
        return {
          message: formattedError.message,
          extensions: {
            code,
          },
        };
      }

      console.error("Erro interno GraphQL:", formattedError);

      return {
        message: "Ocorreu um erro interno. Tente novamente mais tarde.",

        extensions: {
          code: "INTERNAL_SERVER_ERROR",
        },
      };
    },
  });

  await server.start();

  app.use(
    "/graphql",

    limiter,

    express.json({
      limit: "10mb",
    }),

    expressMiddleware(server, {
      context: async ({ req }) => createContext({ req }),
    }),
  );

  const port = Number(process.env.PORT ?? 4000);

  /*
   * 0.0.0.0 é importante em ambientes como Render e Docker.
   */
  await new Promise<void>((resolve) => {
    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
      },
      resolve,
    );
  });

  console.log(`🚀 Servidor iniciado na porta ${port}`);

  console.log(`✅ GraphQL disponível em /graphql`);

  console.log(`✅ Health check disponível em /health`);

  console.log("✅ Origens CORS configuradas:", Array.from(allowedOrigins));
}

startServer().catch((error) => {
  console.error("❌ Falha ao iniciar o servidor:", error);

  process.exit(1);
});
