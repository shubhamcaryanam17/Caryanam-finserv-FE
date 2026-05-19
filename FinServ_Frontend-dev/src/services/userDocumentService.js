// src/services/userDocumentService.js

const STORAGE_KEY = "user_documents";

// 🔹 delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ==============================
// ✅ GET USER DOCUMENTS
// ==============================
export const getUserDocuments = async () => {
  await delay(200);

  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  return data || {};
};

// ==============================
// ✅ SAVE USER DOCUMENT
// ==============================
export const saveUserDocument = async (name, file) => {
  await delay(200);

  const existing =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

  const updated = {
    ...existing,
    [name]: {
      name: file.name,
      uploadedAt: new Date().toISOString(),
    },
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return updated;
};