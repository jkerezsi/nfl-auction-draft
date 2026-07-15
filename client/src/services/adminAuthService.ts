import api from "./api";

const TOKEN_KEY =
  "admin-token";


export async function login(
  pin: string
): Promise<void> {
  const response =
    await api.post(
      "/admin-auth/login",
      {
        pin
      }
    );

  sessionStorage.setItem(
    TOKEN_KEY,
    response.data.token
  );
}


export function logout() {
  sessionStorage.removeItem(
    TOKEN_KEY
  );
}


export function isLoggedIn() {
  return (
    sessionStorage.getItem(
      TOKEN_KEY
    ) !== null
  );
}


export async function validateSession() {
  const token =
    sessionStorage.getItem(
      TOKEN_KEY
    );

  if (!token) {
    return false;
  }

  try {
    const response =
      await api.get(
        "/admin-auth/session"
      );

    return (
      response.data.authenticated ===
      true
    );
  } catch {
    return false;
  }
}