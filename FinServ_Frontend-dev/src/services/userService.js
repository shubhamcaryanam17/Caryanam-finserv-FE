// src/services/userService.js

import { updateApplicationStatus } from "./applicationService";
import { fetchMyLoansFromApi } from "./userLoanApi";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function isUnderReviewStatus(s) {
  return (
    s === "UNDER_REVIEW" ||
    s === "SUBMITTED_TO_BANK" ||
    s === "ASSIGNED_TO_BANK" ||
    s === "DOCUMENTS_PENDING" ||
    s === "PENDING"
  );
}

// ==============================
// ✅ GET USER APPLICATIONS (API)
// ==============================
export const getUserApplications = async () => fetchMyLoansFromApi();

// ==============================
// ✅ GET USER STATS
// ==============================
export const getUserStats = async () => {
  const apps = await fetchMyLoansFromApi();

  const total = apps.length;

  const underReview = apps.filter((a) => isUnderReviewStatus(a.status)).length;

  const approved = apps.filter((a) => a.status === "APPROVED").length;

  const rejected = apps.filter(
    (a) => a.status === "REJECTED" || a.status === "REJECTED_BY_ADMIN"
  ).length;

  return {
    total,
    underReview,
    approved,
    rejected,
  };
};

// ==============================
// ✅ UPDATE USER APPLICATION STATUS (local mock — admin/bank use API)
// ==============================
export const updateUserApplicationStatus = async (id, status) => {
  await delay(200);
  return updateApplicationStatus(id, status);
};
