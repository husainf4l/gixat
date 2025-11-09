// Apollo Client Configuration for GIXAT
// GraphQL Endpoint: https://www.gixat.com/api/graphql

export interface ApolloClientConfig {
  uri: string;
  headers?: Record<string, string>;
}

/**
 * Get Apollo Client configuration
 * Uses environment variables for the GraphQL endpoint
 */
export function getApolloClientConfig(): ApolloClientConfig {
  const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "https://www.gixat.com/api/graphql";

  return {
    uri: graphqlEndpoint,
    headers: {
      "Content-Type": "application/json",
    },
  };
}

/**
 * Get authorization headers with token
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Create GraphQL request with auth headers
 */
export async function graphqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "https://www.gixat.com/api/graphql";
  const headers = getAuthHeaders();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      throw new Error(data.errors[0]?.message || "GraphQL request failed");
    }

    return data.data as T;
  } catch (error) {
    console.error("GraphQL fetch error:", error);
    throw error;
  }
}

export default getApolloClientConfig;

