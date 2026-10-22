import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.29.201:5000/graphql";

let idToken: string | null = null;
let refreshTokenValue: string | null = null;
// Token phone ki storage se ek baar padh liya ya nahi
let tokensLoaded = false;

// Web par SecureStore kaam nahi karta, isliye wahan localStorage use hoga.
// Phone par pehle jaisa SecureStore hi chalega.
const storage = {
  async set(key: string, value: string) {
    if (Platform.OS === "web") {
      try { localStorage.setItem(key, value); } catch {}
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async get(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    return await SecureStore.getItemAsync(key);
  },
  async remove(key: string) {
    if (Platform.OS === "web") {
      try { localStorage.removeItem(key); } catch {}
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export async function setTokens(id: string, refresh: string, uid?: string) {
  idToken = id;
  refreshTokenValue = refresh;
  tokensLoaded = true;
  await storage.set("idToken", id);
  await storage.set("refreshToken", refresh);
  if (uid) await storage.set("userId", uid);
}

// Safe storage se token wapas laata hai
export async function loadTokens() {
  idToken = await storage.get("idToken");
  refreshTokenValue = await storage.get("refreshToken");
  tokensLoaded = true;
  return !!idToken;
}

// Login ke waqt save hui user ID
export async function getStoredUserId() {
  return await storage.get("userId");
}

// Logout par chalao
export async function clearTokens() {
  idToken = null;
  refreshTokenValue = null;
  tokensLoaded = true;
  await storage.remove("idToken");
  await storage.remove("refreshToken");
  await storage.remove("userId");
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