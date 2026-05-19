import API from "../api/api";

function mapDocStatus(status) {
  const s = typeof status === "string" ? status : status?.name ?? String(status);
  return s || "PENDING";
}

export async function fetchAdminDocumentDashboard() {
  const { data } = await API.get("/documents/dashboard");
  const rows = Array.isArray(data) ? data : [];

  return rows.map((entry) => ({
    caseNumber: entry.caseNumber,
    customerName: entry.customerName ?? "—",
    totalDocuments: Number(entry.totalDocuments) || 0,
    verifiedCount: Number(entry.verifiedCount) || 0,
    pendingCount: Number(entry.pendingCount) || 0,
    rejectedCount: Number(entry.rejectedCount) || 0,
    documents: (entry.documents || []).map((d, idx) => ({
      id: d.id ?? idx,
      name: d.documentType?.name ?? d.documentType ?? "Document",
      fileName: d.fileName,
      status: mapDocStatus(d.status),
      uploadDate: d.uploadDate,
    })),
  }));
}
