// 🔹 STORAGE KEYS
const APP_KEY = "applications_data";
const DOC_KEY = "documents_data";

// 🔹 DEFAULT APPLICATIONS
const defaultApplications = [
  {
    id: 1,
    fullName: "Rahul Sharma",
    loanType: "Home Loan",
    loanAmount: 500000,
    status: "APPROVED",
    submittedAt: "2024-01-10",
  },
  {
    id: 2,
    fullName: "Priya Verma",
    loanType: "Car Loan",
    loanAmount: 300000,
    status: "UNDER_REVIEW",
    submittedAt: "2024-01-12",
  },
];

// 🔹 DEFAULT DOCUMENTS
const defaultDocuments = [
  {
    id: 1,
    applicationId: 2,
    name: "Aadhar Card",
    status: "VERIFIED",
  },
  {
    id: 2,
    applicationId: 2,
    name: "PAN Card",
    status: "PENDING",
  },
];

// 🔹 LOAD (in-memory; always sync from localStorage before reads/writes)
let appData = [...defaultApplications];

let documents =
  JSON.parse(localStorage.getItem(DOC_KEY)) || defaultDocuments;

function reloadApplicationsFromStorage() {
  const raw = localStorage.getItem(APP_KEY);
  if (!raw) {
    appData = [...defaultApplications];
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    appData = Array.isArray(parsed) ? parsed : [...defaultApplications];
  } catch {
    appData = [...defaultApplications];
  }
}

reloadApplicationsFromStorage();

// 🔹 SAVE
const saveApplications = () => {
  localStorage.setItem(APP_KEY, JSON.stringify(appData));
};

const saveDocuments = () => {
  localStorage.setItem(DOC_KEY, JSON.stringify(documents));
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ==============================
// ✅ GET ALL
// ==============================
export const getApplications = async () => {
  await delay(200);
  reloadApplicationsFromStorage();
  return [...appData];
};

// ==============================
// ✅ GET ONE
// ==============================
export const getApplicationById = async (id) => {
  await delay(200);
  reloadApplicationsFromStorage();
  return appData.find((a) => a.id === Number(id));
};

// ==============================
// ✅ UPDATE STATUS
// ==============================
export const updateApplicationStatus = async (id, status) => {
  await delay(200);

  reloadApplicationsFromStorage();
  appData = appData.map((app) =>
    app.id === Number(id) ? { ...app, status } : app
  );

  saveApplications();
  return true;
};

// ==============================
// ✅ ADD APPLICATION (apply loan, etc.)
// ==============================
export const addApplication = async (application) => {
  await delay(200);
  reloadApplicationsFromStorage();
  appData = [...appData, application];
  saveApplications();
  return application;
};

// ==============================
// ✅ DOCUMENTS
// ==============================
export const getDocuments = async () => {
  await delay(200);
  return [...documents];
};

export const getDocumentsByAppId = async (id) => {
  await delay(200);
  return documents.filter((d) => d.applicationId === Number(id));
};

export const updateDocumentStatus = async (id, status) => {
  await delay(200);

  documents = documents.map((doc) =>
    doc.id === id ? { ...doc, status } : doc
  );

  saveDocuments();
  return true;
};