export async function graphqlRequest<T = any>(
  query: string,
  variables?: any
): Promise<T> {
  const token = localStorage.getItem("token");
  
  console.log("Token sendo enviado:", token ? "✅ Tem token" : "❌ Sem token"); // 👈 Log

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
  console.log("Resposta:", json); // 👈 Log

  if (json.errors) {
    console.error("GRAPHQL ERROR:", json.errors);
    throw new Error(json.errors[0].message);
  }

  return json.data;
}