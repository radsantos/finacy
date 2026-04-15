export type AuthPayload = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};

export type LoginResponse = {
  login: AuthPayload;
};

export type RegisterResponse = {
  register: AuthPayload;
};
