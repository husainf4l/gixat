import { graphqlRequest, GraphQLResponse } from "./graphql-client";
import { AuthResponse, RegisterInput, LoginInput } from "./auth.types";

export const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        type
      }
      expiresIn
    }
  }
`;

export const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        type
      }
      expiresIn
    }
  }
`;

export async function registerUser(
  input: RegisterInput
): Promise<GraphQLResponse<{ register: AuthResponse }>> {
  return graphqlRequest(REGISTER_MUTATION, { input });
}

export async function loginUser(
  input: LoginInput
): Promise<GraphQLResponse<{ login: AuthResponse }>> {
  return graphqlRequest(LOGIN_MUTATION, { input });
}
