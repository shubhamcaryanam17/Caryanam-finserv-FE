// User loan + profile helpers (backend: Caryanam_Finserv LoanController)

import API from "../api/api";

/** Decode JWT payload (no verification; same use as AuthContext). */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

/** Resolve numeric user id from common JWT / profile claim shapes. */
export function extractUserIdFromJwtPayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  const asPositiveInt = (v) => {
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  return (
    asPositiveInt(payload.userId) ??
    asPositiveInt(payload.id) ??
    asPositiveInt(payload.user_id) ??
    asPositiveInt(payload.uid) ??
    (typeof payload.sub === "string" && /^\d+$/.test(payload.sub.trim())
      ? asPositiveInt(payload.sub)
      : null)
  );
}

export function getUserIdFromToken(token) {
  return extractUserIdFromJwtPayload(decodeJwtPayload(token));
}

/**
 * Numeric user id for API calls: stored user object first, then JWT in localStorage.
 */
export function getStoredUserId() {
  let user = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch {
    user = null;
  }

  for (const key of ["userId", "id", "user_id"]) {
    const n = Number(user?.[key]);
    if (Number.isFinite(n) && n > 0) return n;
  }

  const token = localStorage.getItem("token") || user?.token;
  return getUserIdFromToken(token);
}

function normalizePhoneDigits(value) {
  const d = String(value ?? "").replace(/\D/g, "");
  if (!d) return "";
  return d.length > 10 ? d.slice(-10) : d;
}

function normalizeName(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Merges `userId` and `fullName` from GET /users/dashboard into the stored user (row matched by email).
 * Needed because login only persists email/role/token — loan search uses profile full name.
 */
export async function syncUserProfileFromDashboard() {
  let user = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch {
    return null;
  }

  const email = user?.email?.trim();
  if (!email) return null;

  try {
    const res = await API.get("/users/dashboard");
    const rows = Array.isArray(res.data) ? res.data : [];
    const match = rows.find(
      (r) =>
        r?.email &&
        String(r.email).trim().toLowerCase() === email.toLowerCase()
    );
    if (!match) return user;

    const next = { ...user };
    const id = Number(match.userId);
    if (Number.isFinite(id) && id > 0) next.userId = id;
    if (match.fullName) {
      const fn = String(match.fullName).trim();
      if (fn) {
        next.fullName = fn;
        if (!next.name || !String(next.name).trim()) {
          next.name = fn;
        }
      }
    }
    if (match.mobileNumber != null && String(match.mobileNumber).trim()) {
      next.mobileNumber = normalizePhoneDigits(match.mobileNumber);
    }
    localStorage.setItem("user", JSON.stringify(next));
    return next;
  } catch {
    return user;
  }
}

/**
 * Resolves DB user id for loan APIs when missing from storage (via dashboard row).
 */
export async function resolveUserIdForLoan() {
  const existing = getStoredUserId();
  if (existing != null) return existing;
  await syncUserProfileFromDashboard();
  return getStoredUserId();
}

/**
 * Load user profile from localStorage.
 * Returns what's available without making backend calls.
 */
export async function ensureUserProfile() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  let user;
  try {
    user = JSON.parse(raw);
  } catch {
    return null;
  }

  // Just return what we have from localStorage
  return user;
}

/** Saves 10-digit mobile from Apply Loan form so dashboard can match loans before / after profile sync. */
export function mergeFormMobileIntoStoredUser(mobile) {
  const digits = normalizePhoneDigits(mobile);
  if (digits.length < 10) return;
  let user = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch {
    user = {};
  }
  if (!user || typeof user !== "object") user = {};
  localStorage.setItem(
    "user",
    JSON.stringify({ ...user, mobileNumber: digits })
  );
}

/**
 * Loans for this user. Prefer filtering GET /loans/dashboard by mobile (stable on User);
 * name-only search can miss rows when personalDetails.fullName is null or differs from the form.
 */
export async function fetchMyLoansFromApi() {
  let user = await ensureUserProfile();
  if (!user?.fullName?.trim() || !user?.mobileNumber?.trim()) {
    await syncUserProfileFromDashboard();
    user = await ensureUserProfile();
  }

  const mobileNorm = normalizePhoneDigits(user?.mobileNumber || user?.mobile || user?.phone);
  const name = normalizeName(user?.fullName || user?.name || user?.email);
  const email = String(user?.email || "").trim().toLowerCase();

  const getLoanIdentity = (raw) => {
    const loanMobile = normalizePhoneDigits(
      raw?.mobile || raw?.mobileNumber || raw?.phone || raw?.customerMobile
    );
    const customerName = normalizeName(raw?.customerName || raw?.fullName || raw?.name);
    const customerEmail = String(
      raw?.email || raw?.customerEmail || raw?.emailAddress || ""
    )
      .trim()
      .toLowerCase();

    return { loanMobile, customerName, customerEmail };
  };

  const isLoanForCurrentUser = (raw) => {
    const { loanMobile, customerName, customerEmail } = getLoanIdentity(raw);

    const mobileMatch = mobileNorm && loanMobile && loanMobile === mobileNorm;
    const emailMatch = email && customerEmail && customerEmail === email;
    const nameMatch = name && customerName && customerName === name;

    if (mobileMatch || emailMatch) {
      return true;
    }

    if (nameMatch) {
      // If the loan also carries an email or mobile, require that those values do not contradict the logged-in user.
      if (customerEmail && email && customerEmail !== email) return false;
      if (loanMobile && mobileNorm && loanMobile !== mobileNorm) return false;
      return true;
    }

    return false;
  };

  const logLoanFilter = (source, total, matched) => {
    if (process.env.NODE_ENV === "development") {
      console.debug("fetchMyLoansFromApi", {
        source,
        mobileNorm,
        name,
        email,
        totalRows: total,
        matchedRows: matched,
      });
    }
  };

  try {
    const res = await API.get("/loans/dashboard");
    const rows = Array.isArray(res.data) ? res.data : [];
    const mine = rows.filter(isLoanForCurrentUser);
    logLoanFilter("dashboard", rows.length, mine.length);
    if (mine.length > 0) {
      return mine.map(mapDashboardRow);
    }
  } catch (e) {
    console.error("fetchMyLoansFromApi dashboard filter:", e);
  }

  if (!name) return [];

  try {
    const res = await API.post("/loans/search", {
      caseNumber: null,
      name,
    });
    const rows = Array.isArray(res.data) ? res.data : [];
    const mine = rows.filter(isLoanForCurrentUser);
    logLoanFilter("search", rows.length, mine.length);
    return mine.map(mapDashboardRow);
  } catch (e) {
    console.error("fetchMyLoansFromApi name search:", e);
    return [];
  }
}

function mapDashboardRow(raw) {
  const status = raw.status != null ? String(raw.status) : "PENDING";
  const amount = raw.amount ?? raw.loanAmount ?? 0;
  const date = raw.createdDate ?? raw.submittedAt ?? "";
  const vehicle = raw.vehicle != null ? String(raw.vehicle).trim() : "";
  const loanTypeLabel =
    vehicle ||
    (raw.loanType != null ? String(raw.loanType) : "") ||
    "Vehicle loan";

  return {
    id: raw.caseNumber || raw.id,
    caseNumber: raw.caseNumber,
    fullName: raw.customerName || raw.fullName || "",
    loanType: loanTypeLabel,
    loanAmount: amount,
    status,
    submittedAt: typeof date === "string" ? date.split("T")[0] : date,
    remark: raw.adminRemark || raw.remark || raw.notes || "",
    bank: raw.bank || "",
  };
}

/**
 * POST /api/loans/create — LoanRequestDTO
 */
export async function createLoanViaApi(payload) {
  const res = await API.post("/loans/create", payload);
  return res.data;
}

export async function fetchBanks() {
  const res = await API.get("/banks/getAll");
  return Array.isArray(res.data) ? res.data : [];
}


export async function saveUserProfileApi(payload) {
const res = await API.post("/profile/save", payload);
return res.data;
}
