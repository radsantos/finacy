import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

import { setContext } from "@apollo/client/link/context";

const API_URL =
  import.meta.env.VITE_BACKEND_URL?.trim() || "http://localhost:4000/graphql";

type GraphQLErrorItem = {
  message: string;
  extensions?: Record<string, unknown>;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLErrorItem[];
};

type GraphQLVariables = Record<string, unknown> | undefined;

const httpLink = createHttpLink({
  uri: API_URL,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      ...headers,
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),

  cache: new InMemoryCache(),

  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    },

    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },

    mutate: {
      errorPolicy: "all",
    },
  },
});

export async function graphqlRequest<T = unknown>(
  query: string,
  variables?: GraphQLVariables,
): Promise<T> {
  const token = localStorage.getItem("token");

  let response: Response;

  try {
    response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      body: JSON.stringify({
        query,
        variables,
      }),
    });
  } catch (error) {
    console.error("Erro de conexão com a API:", error);

    throw new Error(
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
    );
  }

  let result: GraphQLResponse<T>;

  try {
    result = (await response.json()) as GraphQLResponse<T>;
  } catch (error) {
    console.error("Resposta inválida da API:", error);

    throw new Error("O servidor retornou uma resposta inválida.");
  }

  if (!response.ok) {
    const message =
      result.errors?.[0]?.message || `Erro HTTP ${response.status}`;

    console.error("Erro HTTP da API:", response.status, result.errors);

    throw new Error(message);
  }

  if (result.errors?.length) {
    console.error("Erro GraphQL:", result.errors);

    throw new Error(
      result.errors[0].message || "Ocorreu um erro ao processar a solicitação.",
    );
  }

  if (result.data === undefined) {
    throw new Error("A API não retornou dados.");
  }

  return result.data;
}
