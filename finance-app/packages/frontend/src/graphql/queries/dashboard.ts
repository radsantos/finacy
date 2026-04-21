export const GET_DASHBOARD = `
  query {
    dashboard {
      balance
      incomes
      expenses
      transactions {
        id
        description
        amount
        type
        date
        category {
          id
          name
        }
      }
      categories {
        name
        total
        count
      }
    }
  }
`;