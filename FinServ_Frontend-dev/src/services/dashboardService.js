import { getLoans } from "./loanService";

export async function fetchAdminDashboard() {
  const loans = await getLoans();

  const stats = {
    total: loans.length,
    pending: loans.filter((l) => l.status === "PENDING").length,
    approved: loans.filter((l) => l.status === "APPROVED").length,
    rejected: loans.filter((l) => l.status === "REJECTED").length,
  };

  const tableRows = [...loans]
    .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)))
    .slice(0, 12);

  return { stats, tableRows };
}
