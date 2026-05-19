// src/services/loanOfferService.js — user Loan Offers from /api/banks/getAll

import API from "../api/api";

function parseRoiRange(roiRange) {
  const s = String(roiRange ?? "").replace(/%/g, "");
  const m = s.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (m) {
    return { min: parseFloat(m[1]), max: parseFloat(m[2]) };
  }
  const n = parseFloat(s);
  if (!Number.isNaN(n)) {
    return { min: n, max: n };
  }
  return { min: 8.5, max: 10.5 };
}

/**
 * Reducing-balance EMI (monthly), annual rate as percent.
 */
export function computeEmi(principal, annualRatePercent, months) {
  const P = Number(principal);
  const n = Math.max(1, Math.floor(Number(months)));
  const annual = Number(annualRatePercent) / 100;
  const r = annual / 12;
  if (!Number.isFinite(P) || P <= 0) return null;
  if (!Number.isFinite(r) || r <= 0) {
    return Math.round(P / n);
  }
  const pow = Math.pow(1 + r, n);
  const emi = (P * r * pow) / (pow - 1);
  return Math.round(emi);
}

function formatRupee(n) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

/**
 * Map API bank rows to offer cards. `tenureMonths` is capped by each bank's maxTenureMonths when set.
 */
export function mapBanksToOffers(banks, loanAmount, tenureMonths) {
  const principal = Number(loanAmount);
  const wantTenure = Math.max(6, Math.floor(Number(tenureMonths)) || 60);

  return (Array.isArray(banks) ? banks : []).map((b) => {
    const { min: rMin, max: rMax } = parseRoiRange(b.roiRange);
    const rateMid = (rMin + rMax) / 2;
    const cap = b.maxTenureMonths != null ? Number(b.maxTenureMonths) : wantTenure;
    const effectiveTenure = Number.isFinite(cap) && cap > 0
      ? Math.min(wantTenure, cap)
      : wantTenure;
    const emi = computeEmi(principal, rateMid, effectiveTenure);

    return {
      id: b.id,
      bank: b.bankName ?? "Bank",
      interest: b.roiRange?.trim() || `${rMin}% – ${rMax}%`,
      rateMid,
      tenure: `${effectiveTenure} months`,
      emi: formatRupee(emi),
      processingFee: b.processingDays?.trim() || "—",
      features: Array.isArray(b.features) ? b.features : [],
    };
  });
}

export async function fetchBanksRaw() {
  const { data } = await API.get("/banks/getAll");
  return Array.isArray(data) ? data : [];
}

export async function getLoanOffers(loanAmount = 500000, tenureMonths = 60) {
  const banks = await fetchBanksRaw();
  return mapBanksToOffers(banks, loanAmount, tenureMonths);
}
