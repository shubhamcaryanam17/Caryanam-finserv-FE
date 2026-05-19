import API from "../api/api";

export async function getCustomerDashboardUsers() {
  const { data } = await API.get("/users/dashboard");
  const list = Array.isArray(data) ? data : [];
  return list.map((row) => ({
    id: row.userId,
    fullName: row.fullName ?? "—",
    email: row.email ?? "—",
    mobileNumber: row.mobileNumber ?? "",
    panNumber: row.panNumber ?? "",
    totalLoans: Number(row.totalLoans) || 0,
    activeLoans: Number(row.activeLoans) || 0,
    totalLoanAmount: Number(row.totalLoanAmount) || 0,
  }));
}

export async function updateUser(id, { fullName, email }) {
  await API.put("/users/basic", {
    id,
    fullName,
    email,
  });
}

export async function deleteUser(id) {
  await API.delete("/users/delete", { data: { id } });
}
