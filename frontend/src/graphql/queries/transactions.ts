export const GET_TRANSACTIONS = `
  query GetTransactions {
    transactions {
      id
      description
      amount
      type
      date
      category {
        id
        name
        icon
        color
      }
    }
  }
`;