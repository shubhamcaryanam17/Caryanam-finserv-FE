// src/services/applyLoanService.js — POST /api/loans/create

import {
  createLoanViaApi,
  resolveUserIdForLoan,
  fetchBanks,
} from "./userLoanApi";

function normalizeTenure(months) {
  let t = Number(months);
  if (!Number.isFinite(t) || t < 6) t = 60;
  t = Math.max(6, Math.min(360, t));
  if (t % 6 !== 0) {
    t = Math.round(t / 6) * 6;
    if (t < 6) t = 6;
    if (t > 360) t = 360;
  }
  return t;
}

/**
 * @param {object} formData — ApplyLoan form fields
 * @param {number} bankId — selected bank (optional)
 */
export const applyLoan = async (formData, bankId = null) => {
  const loanAmount = Number(formData.loanAmount);
  const downPayment = Number(formData.downPayment);

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
    throw new Error("Enter a valid loan amount.");
  }
  if (!Number.isFinite(downPayment) || downPayment <= 0) {
    throw new Error("Down payment must be greater than zero.");
  }
  if (downPayment > loanAmount) {
    throw new Error("Down payment cannot be greater than loan amount.");
  }

  const loanType =
    formData.carType === "Used" ? "AUTO_USED_CAR" : "AUTO_NEW_CAR";

  const tenure = normalizeTenure(formData.tenure);

  const bankIdNum =
    bankId != null && Number(bankId) > 0 ? Number(bankId) : null;
  const [userId, banks] = await Promise.all([
    resolveUserIdForLoan(),
    bankIdNum == null ? fetchBanks() : Promise.resolve(null),
  ]);

  if (userId == null) {
    throw new Error(
      "We could not find your account ID. Log out, log in again, or contact support if this continues."
    );
  }

  let resolvedBankId = bankIdNum;
  if (resolvedBankId == null) {
    const first = banks?.[0];
    const id = Number(first?.id);
    if (!Number.isFinite(id) || id <= 0) {
      throw new Error(
        "No partner bank is configured. Please ask an admin to add a bank, then try again."
      );
    }
    resolvedBankId = id;
  }

  const payload = {
    loanType,
    loanAmount,
    downPayment,
    tenure,
    userId,
    bankId: resolvedBankId,
  };

  return createLoanViaApi(payload);
};
