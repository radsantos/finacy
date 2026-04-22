import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// Tipo para as variáveis da query
type GraphQLVariables = Record<string, unknown> | undefined;

export async function graphqlRequest<T = unknown>(
  query: string,
  variables?: GraphQLVariables,
): Promise<T> {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await response.json();

  if (json.errors) {
    console.error("GRAPHQL ERROR:", json.errors);
    throw new Error(json.errors[0].message);
  }

  return json.data as T;
}
