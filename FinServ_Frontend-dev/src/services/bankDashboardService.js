// 🔹 STORAGE KEY
const STORAGE_KEY = "bank_applications_data";

// 🔹 DEFAULT DATA
const defaultBankApplications = [
  {
    id: 1,
    fullName: "Rahul Sharma",
    loanType: "Home Loan",
    loanAmount: 500000,
    status: "APPROVED",
  },
  {
    id: 2,
    fullName: "Priya Verma",
    loanType: "Car Loan",
    loanAmount: 300000,
    status: "UNDER_REVIEW",
  },
];

// 🔹 LOAD
let bankApplications =
  JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultBankApplications;

// 🔹 SAVE
const saveBankApps = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bankApplications));
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ✅ GET
export const getBankApplications = async () => {
  await delay(200);
  return [...bankApplications];
};

// ✅ UPDATE STATUS (SYNC WITH MAIN)
export const updateBankApplicationStatus = async (id, status) => {
  await delay(200);

  bankApplications = bankApplications.map((app) =>
    app.id === Number(id) ? { ...app, status } : app
  );

  saveBankApps();
  return true;
};