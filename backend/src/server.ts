import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
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

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  const allowedOrigins = [
    "http://localhost:5173",
    "https://financy-frontend-nu.vercel.app",
    "https://finacy-frontend-test.vercel.app",
  ];

  app.use(
    "/graphql",
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => await createContext({ req }),
    }),
  );

  const PORT = process.env.PORT || 4000;

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve),
  );
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  console.log(`✅ CORS enabled for: ${allowedOrigins.join(", ")}`);
}

startServer().catch(console.error);
