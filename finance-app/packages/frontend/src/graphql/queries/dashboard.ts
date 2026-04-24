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
          icon
          color
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