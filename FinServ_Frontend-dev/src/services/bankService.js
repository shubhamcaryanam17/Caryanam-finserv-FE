import API from "../api/api";

function mapBank(b) {
  return {
    id: b.id,
    name: b.bankName,
    roi: b.roiRange,
    processing: b.processingDays,
    ltv: b.maxLtv != null ? `${b.maxLtv}%` : "",
    tenure: b.maxTenureMonths != null ? `${b.maxTenureMonths} mo` : "",
    features: b.features || [],
    casesThisMonth: b.casesThisMonth ?? 0,
  };
}

function parseRoi(formRoi) {
  const s = String(formRoi ?? "").replace(/%/g, "");
  const m = s.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (m) return { min: parseFloat(m[1]), max: parseFloat(m[2]) };
  const n = parseFloat(s);
  if (!Number.isNaN(n)) return { min: n, max: n };
  return { min: 8.5, max: 10.5 };
}

function parseLtv(ltvStr) {
  const n = parseInt(String(ltvStr ?? "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 85;
}

function parseTenure(tStr) {
  const n = parseInt(String(tStr ?? "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 60;
}

export async function getBanks() {
  const { data } = await API.get("/banks/getAll");
  return (Array.isArray(data) ? data : []).map(mapBank);
}

export async function addBank(form) {
  const { min, max } = parseRoi(form.roi);
  const feats = Array.isArray(form.features)
    ? form.features.map((f) => String(f).trim()).filter(Boolean)
    : [];

  const body = {
    bankName: String(form.name || "").trim(),
    roiMin: min,
    roiMax: max,
    processingDays: String(form.processing || "3-5 Days").trim(),
    maxLtv: parseLtv(form.ltv),
    maxTenureMonths: parseTenure(form.tenure),
  };

  if (feats.length > 0) {
    body.features = feats;
  }

  const { data } = await API.post("/banks/add", body);
  return mapBank(data);
}

export async function updateBank(id, form) {
  const { min, max } = parseRoi(form.roi);
  const { data } = await API.put("/banks/roi", {
    id,
    roiMin: min,
    roiMax: max,
  });
  return mapBank(data);
}

export async function deleteBank() {
  throw new Error("Bank delete is not supported by the API.");
}
