import API from "../api/api";

export async function getReportsData(year = new Date().getFullYear()) {
  const { data } = await API.post("/dashboard/data", { year });

  return {
    approvalData: (data?.approvalVsRejection || []).map((r) => ({
      month: r.month,
      approved: Number(r.approved) || 0,
      rejected: Number(r.rejected) || 0,
    })),
    disbursementData: (data?.disbursement || []).map((r) => ({
      month: r.month,
      value: Number(r.totalAmount) || 0,
    })),
    bankData: (data?.bankDistribution || []).map((r) => ({
      name: r.bankName,
      value: Number(r.count) || 0,
    })),
    tatData: (data?.turnaroundTime || []).map((r) => ({
      name: r.bankName,
      value: Number(r.avgDays) || 0,
    })),
  };
}
