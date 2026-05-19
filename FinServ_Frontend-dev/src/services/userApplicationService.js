// src/services/userApplicationService.js

import { fetchMyLoansFromApi } from "./userLoanApi";
import { updateApplicationStatus } from "./applicationService";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ==============================
// ✅ GET USER APPLICATIONS (API)
// ==============================
export const getUserApplications = async () => fetchMyLoansFromApi();

// ==============================
// ✅ GET USER STATS
// ==============================
export const getUserStats = async () => {
  const apps = await fetchMyLoansFromApi();

  return {
    total: apps.length,
    underReview: apps.filter(
      (a) =>
        a.status === "UNDER_REVIEW" ||
        a.status === "SUBMITTED_TO_BANK" ||
        a.status === "ASSIGNED_TO_BANK" ||
        a.status === "DOCUMENTS_PENDING" ||
        a.status === "PENDING"
    ).length,
    approved: apps.filter((a) => a.status === "APPROVED").length,
    rejected: apps.filter(
      (a) => a.status === "REJECTED" || a.status === "REJECTED_BY_ADMIN"
    ).length,
  };
};

// ==============================
// ✅ UPDATE STATUS
// ==============================
export const updateUserApplicationStatus = async (id, status) => {
  await delay(200);
  return updateApplicationStatus(id, status);
};
