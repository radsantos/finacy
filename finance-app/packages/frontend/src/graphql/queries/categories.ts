export const GET_CATEGORIES = `
  query GetCategories {
    categories {
      id
      name
      description
    }
  }
`;

export const CREATE_CATEGORY = `
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      description
    }
  }
`;