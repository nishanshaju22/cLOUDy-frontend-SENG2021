export function setAuth(authData) {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth", JSON.stringify(authData));
}

export function getAuth() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth");
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth");
}

export function isLoggedIn() {
  const auth = getAuth();
  return !!auth?.user && !!auth?.seller;
}