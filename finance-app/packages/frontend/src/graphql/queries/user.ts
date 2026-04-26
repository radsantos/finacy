export const GET_ME = `
  query GetMe {
    me {
      id
      email
      name
    }
  }
`;

export const UPDATE_USER = `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      email
      name
    }
  }
`;
