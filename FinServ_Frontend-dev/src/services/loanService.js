import API from "../api/api";

export function mapLoanDashboardRow(row) {
  const status =
    typeof row.status === "string" ? row.status : row.status?.name ?? row.status;
  return {
    caseNumber: row.caseNumber,
    id: row.caseNumber,
    fullName: row.customerName ?? "—",
    loanType: row.vehicle?.trim() ? row.vehicle : "—",
    loanAmount: row.amount ?? 0,
    status,
    submittedAt: row.createdDate ?? "—",
    mobile: row.mobile,
    bank: row.bank,
    adminRemark: row.adminRemark ?? "",
    missingDocuments: row.missingDocuments ?? [],
  };
}

export async function getLoans() {
  const { data } = await API.get("/loans/dashboard");
  const list = Array.isArray(data) ? data : [];
  return list.map(mapLoanDashboardRow);
}

export async function getLoanById(caseNumber) {
  const loans = await getLoans();
  return loans.find((l) => l.caseNumber === caseNumber);
}

export async function createLoan(loanData) {
  const { data } = await API.post("/loans/create", loanData);
  return data;
}

export async function updateLoanStatus(caseNumber, status) {
  const cn = String(caseNumber ?? "").trim();
  if (!cn) {
    throw new Error("Missing case number");
  }

  const body = { caseNumber: cn };
  if (status === "APPROVED") {
    const { data } = await API.put("/loans/approve", body);
    return typeof data === "string" ? data : "Approved";
  }
  if (status === "REJECTED") {
    const { data } = await API.put("/loans/reject", body);
    return typeof data === "string" ? data : "Rejected";
  }
  throw new Error(`Unsupported status transition: ${status}`);
}

/** Admin: assign bank → backend status ASSIGNED_TO_BANK */
export async function adminAssignBank(caseNumber, bankId) {
  const cn = String(caseNumber ?? "").trim();
  if (!cn) throw new Error("Missing case number");
  const { data } = await API.post("/loans/assign-to-bank", {
    caseNumber: cn,
    bankId: Number(bankId),
  });
  return typeof data === "string" ? data : "Assigned";
}

/** Admin: reject with remark → REJECTED_BY_ADMIN */
export async function adminRejectCase(caseNumber, remark) {
  const cn = String(caseNumber ?? "").trim();
  if (!cn) throw new Error("Missing case number");
  const r = String(remark ?? "").trim();
  if (!r) throw new Error("Remark is required");
  const { data } = await API.post("/loans/reject-by-admin", {
    caseNumber: cn,
    remark: r,
  });
  return typeof data === "string" ? data : "Rejected";
}

export async function deleteLoan() {
  throw new Error("DELETE_LOAN_NOT_SUPPORTED");
}
