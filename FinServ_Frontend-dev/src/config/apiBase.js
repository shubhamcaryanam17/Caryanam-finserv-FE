const raw = import.meta.env.VITE_API_BASE_URL;

/** Caryanam_Finserv backend origin (no trailing slash). Override via .env.development. */
export const API_BASE_URL =
  raw != null && String(raw).trim() !== ""
    ? String(raw).replace(/\/$/, "")
    : "http://localhost:8081";
