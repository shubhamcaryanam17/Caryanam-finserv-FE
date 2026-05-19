// src/mock/mockData.js

// 🔹 USERS
export const users = [
  {
    id: 1,
    fullName: "Shivam Patil",
    email: "shivam@gmail.com",
    role: "USER",
  },
  {
    id: 2,
    fullName: "Rahul Sharma",
    email: "rahul@gmail.com",
    role: "ADMIN",
  },
];

// 🔹 LOAN APPLICATIONS
export const applications = [
  {
    id: 1,
    fullName: "Shivam Patil",
    loanAmount: 50000,
    loanType: "Personal Loan",
    status: "UNDER_REVIEW",
    submittedAt: "2026-04-07",
  },
  {
    id: 2,
    fullName: "Rahul Sharma",
    loanAmount: 80000,
    loanType: "Car Loan",
    status: "APPROVED",
    submittedAt: "2026-04-06",
  },
  {
    id: 3,
    fullName: "Amit Joshi",
    loanAmount: 120000,
    loanType: "Home Loan",
    status: "REJECTED",
    submittedAt: "2026-04-05",
  },
  {
    id: 4,
    fullName: "Priya Verma",
    loanAmount: 300000,
    loanType: "Education Loan",
    status: "PENDING",
    submittedAt: "2026-04-04",
  },
];

// 🔹 DASHBOARD STATS
export const dashboardStats = {
  newApplications: 15,
  underReview: 7,
  approved: 10,
  rejected: 3,
};

// 🔹 BANK EXECUTIVES
export const bankExecutives = [
  {
    id: 1,
    name: "ICICI Bank",
  },
  {
    id: 2,
    name: "HDFC Bank",
  },
];

// 🔹 DOCUMENTS (for Review Page - future use)
export const documents = [
  {
    id: 1,
    applicationId: 1,
    name: "Aadhar Card",
    status: "VERIFIED",
  },
  {
    id: 2,
    applicationId: 1,
    name: "PAN Card",
    status: "VERIFIED",
  },
  {
    id: 3,
    applicationId: 1,
    name: "Bank Statement",
    status: "PENDING",
  },
];

// 🔹 OFFERS (for future integration)
export const offers = [
  {
    id: 1,
    applicationId: 2,
    amount: 80000,
    interest: "8.5%",
    tenure: "5 Years",
    status: "SENT",
  },
];