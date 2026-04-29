const DEFAULT_API = "http://localhost:5000";

export function getApiBase(): string {
  const base = import.meta.env.VITE_API_URL;
  if (base && typeof base === "string" && base.trim()) {
    return base.replace(/\/$/, "");
  }
  return DEFAULT_API;
}
