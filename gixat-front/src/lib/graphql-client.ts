import { storage } from "./storage";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "https://www.gixat.com/api/graphql";

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
  }>;
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) {
      console.warn("No refresh token available");
      return null;
    }

    console.log("Attempting to refresh access token...");

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          mutation RefreshToken($refreshToken: String!) {
            refreshToken(refreshToken: $refreshToken) {
              accessToken
              refreshToken
              user {
                id
                email
              }
            }
          }
        `,
        variables: { refreshToken },
      }),
    });

    const data = await response.json();

    if (data.data?.refreshToken?.accessToken) {
      const newAccessToken = data.data.refreshToken.accessToken;
      const newRefreshToken = data.data.refreshToken.refreshToken;
      
      storage.setAccessToken(newAccessToken);
      if (newRefreshToken) {
        storage.setRefreshToken(newRefreshToken);
      }

      console.log("Access token refreshed successfully");
      return newAccessToken;
    }
    
    console.error("Token refresh failed:", data.errors?.[0]?.message);
    // Clear auth on refresh failure
    storage.clearAuth();
    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    storage.clearAuth();
    return null;
  }
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
  retryCount: number = 0
): Promise<GraphQLResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    // Add Bearer prefix if token doesn't already have it
    headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }

  console.log("GraphQL Request Debug:", {
    endpoint: GRAPHQL_ENDPOINT,
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : "NO_TOKEN",
    authHeader: headers["Authorization"] ? `${headers["Authorization"].substring(0, 30)}...` : "NONE",
    variables,
    queryLength: query.length,
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
        responseHeaders: {
          contentType: response.headers.get("content-type"),
          contentLength: response.headers.get("content-length"),
        },
        bodyString: JSON.stringify(data),
      });
      
      // Return error data instead of throwing, to handle 400s gracefully
      if (response.status === 400 && data.errors) {
        return data;
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle Unauthorized error - try to refresh token and retry
    if (data.errors && data.errors[0]?.message === "Unauthorized" && retryCount === 0) {
      console.log("Unauthorized error received, attempting to refresh token...");
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        console.log("Token refreshed successfully, retrying request...");
        return graphqlRequest(query, variables, newToken, retryCount + 1);
      } else {
        console.error("Token refresh failed, clearing auth and returning error");
        // Don't retry further, return the error
      }
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
