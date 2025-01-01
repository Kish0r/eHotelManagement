import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const TOKEN_TYPE_KEY = 'token_type';

export const TokenManager = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async getTokenType(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_TYPE_KEY);
    } catch (error) {
      console.error('Error getting token type:', error);
      return null;
    }
  },

  async getFullToken(): Promise<string | null> {
    const [token, type] = await Promise.all([
      this.getToken(),
      this.getTokenType(),
    ]);
    
    if (token && type) {
      return `${type} ${token}`;
    }
    return null;
  },

  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(TOKEN_TYPE_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },
};

// API interceptor for using the token
export const createAuthHeader = async () => {
  const token = await TokenManager.getFullToken();
  return token ? { Authorization: token } : {};
};

// // Example of how to use in API calls
// export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
//   const authHeader = await createAuthHeader();
//   return fetch(url, {
//     ...options,
//     headers: {
//       ...options.headers,
//       ...authHeader,
//     },
//   });
// };