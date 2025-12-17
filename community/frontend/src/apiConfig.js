const DEFAULT_BACKEND = "https://community-backend-urk6.onrender.com";

const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const envBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
const envIsLocal = envBase && /localhost|127\.0\.0\.1/i.test(envBase);

// 프로덕션에서는 localhost 환경변수 값이 들어 있어도 배포 백엔드/프로덕션용 env만 사용
const API_BASE_URL = (
  envBase && !envIsLocal
    ? envBase
    : isLocalHost
      ? envBase || "http://localhost:8000"
      : DEFAULT_BACKEND
).replace(/\/$/, "");

function toAbsoluteUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}${normalized}`;
}

export { API_BASE_URL, DEFAULT_BACKEND, isLocalHost, toAbsoluteUrl };
