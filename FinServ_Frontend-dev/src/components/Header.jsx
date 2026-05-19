import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function searchPathForRole(role) {
  switch (role) {
    case "admin":
      return "/admin/loan-cases";
    case "bank":
      return "/bank/applications";
    case "user":
      return "/user/applications";
    default:
      return null;
  }
}

const PATHS_WITH_QUERY_SYNC = [
  "/admin/loan-cases",
  "/bank/applications",
  "/bank/under-review",
  "/user/applications",
];

function shouldSyncSearchFromUrl(pathname) {
  return PATHS_WITH_QUERY_SYNC.some((p) => pathname.startsWith(p));
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [headerSearch, setHeaderSearch] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!shouldSyncSearchFromUrl(location.pathname)) return;
    const q = new URLSearchParams(location.search).get("q") ?? "";
    setHeaderSearch(q);
  }, [location.pathname, location.search]);

  const runSearch = () => {
    const path = searchPathForRole(user?.role);
    if (!path) {
      return;
    }
    const trimmed = headerSearch.trim();
    navigate(
      trimmed ? `${path}?q=${encodeURIComponent(trimmed)}` : path,
      { replace: false }
    );
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch();
    }
  };

  const displayName = user?.name || user?.email || "User";

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="flex items-center gap-4 flex-1 justify-end max-w-2xl">
        <div className="flex flex-1 max-w-md gap-2">
          <input
            type="search"
            placeholder="Search cases… (press Enter)"
            className="border px-3 py-2 rounded-lg flex-1 min-w-0"
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Search cases"
          />
          <button
            type="button"
            onClick={runSearch}
            className="px-3 py-2 rounded-lg bg-blue-900 text-white text-sm hover:bg-blue-950 shrink-0"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 bg-blue-900 text-white flex items-center justify-center rounded-full">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || "Role"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
