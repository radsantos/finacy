// CategoryList.tsx
import { useState, useEffect } from "react";
import { graphqlRequest } from "../services/api";

type Category = {
  id: string;
  name: string;
  count: number;
};

export const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Função que apenas retorna os dados (não chama setState)
  const fetchCategories = async (): Promise<Category[]> => {
    const query = `
      query GetCategories {
        categories {
          id
          name
        }
      }
    `;
    const data = await graphqlRequest<{ categories: Category[] }>(query);
    return data.categories || [];
  };

  // ✅ Effect controlado sem cascata
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchCategories();
        if (isMounted) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <p>Carregando categorias...</p>;
  }

  return (
    <div>
      {categories.map((cat) => (
        <div key={cat.id}>
          <span>{cat.name}</span>
          <span>{cat.count} itens</span>
        </div>
      ))}
    </div>
  );
};
