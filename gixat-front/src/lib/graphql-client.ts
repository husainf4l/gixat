const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "https://www.gixat.com/api/graphql";

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
  }>;
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string
): Promise<GraphQLResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log("GraphQL Request Debug:", {
    endpoint: GRAPHQL_ENDPOINT,
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : "NO_TOKEN",
    queryLength: query.length,
    query: query,
    variables,
  });

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const data = await response.json();

    console.log("GraphQL Response Debug:", {
      status: response.status,
      ok: response.ok,
      dataLength: JSON.stringify(data).length,
      hasErrors: !!data.errors,
    });

    if (!response.ok) {
      const errorMessage = data.errors?.[0]?.message || data.errors?.[0] || "Unknown error";
      console.error("GraphQL HTTP Error:", {
        status: response.status,
        statusText: response.statusText,
        body: data,
        errorMessage,
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      data.errors.forEach((err: any) => {
        console.error("  - Full Error:", JSON.stringify(err, null, 2));
        console.error("  - Message:", err.message);
        console.error("  - Path:", err.path);
        console.error("  - Locations:", err.locations);
        console.error("  - Extensions:", err.extensions);
      });
    }

    return data;
  } catch (error) {
    console.error("GraphQL request error:", error);
    throw error;
  }
}
