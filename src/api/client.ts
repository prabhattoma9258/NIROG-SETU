import * as SecureStore from "expo-secure-store";

const API_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.29.201:5000/graphql";

let idToken: string | null = null;
let refreshTokenValue: string | null = null;
// Token phone ki storage se ek baar padh liya ya nahi
let tokensLoaded = false;

export async function setTokens(id: string, refresh: string, uid?: string) {
  idToken = id;
  refreshTokenValue = refresh;
  tokensLoaded = true;
  await SecureStore.setItemAsync("idToken", id);
  await SecureStore.setItemAsync("refreshToken", refresh);
  if (uid) await SecureStore.setItemAsync("userId", uid);
}

// Phone ki safe storage se token wapas laata hai
export async function loadTokens() {
  idToken = await SecureStore.getItemAsync("idToken");
  refreshTokenValue = await SecureStore.getItemAsync("refreshToken");
  tokensLoaded = true;
  return !!idToken;
}

// Login ke waqt save hui user ID
export async function getStoredUserId() {
  return await SecureStore.getItemAsync("userId");
}

// Logout par chalao
export async function clearTokens() {
  idToken = null;
  refreshTokenValue = null;
  tokensLoaded = true;
  await SecureStore.deleteItemAsync("idToken");
  await SecureStore.deleteItemAsync("refreshToken");
  await SecureStore.deleteItemAsync("userId");
}

async function post(query: string, variables?: Record<string, unknown>, token?: string | null) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

// Token expire ho gaya toh naya token lo
async function tryRefresh(): Promise<boolean> {
  if (!refreshTokenValue) return false;
  try {
    const json = await post(
      `mutation($t: String!) { refreshSession(refreshToken: $t) { token refreshToken } }`,
      { t: refreshTokenValue }
    );
    const r = json?.data?.refreshSession;
    if (!r?.token) return false;
    await setTokens(r.token, r.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  // Fast Refresh ya app restart ke baad memory khaali ho toh storage se token wapas laao
  if (!tokensLoaded) await loadTokens();

  let json = await post(query, variables, idToken);

  // Token expire ho gaya toh ek baar refresh karke dobara try karo
  if (json.errors?.[0]?.message === "SESSION_EXPIRED" && (await tryRefresh())) {
    json = await post(query, variables, idToken);
  }

  if (json.errors) throw new Error(json.errors[0].message);
  return json.data as T;
}