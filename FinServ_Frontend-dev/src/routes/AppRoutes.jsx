import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// 🔐 Auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// ================= ADMIN =================
import CreateLoanCase from "../pages/admin/CreateLoanCase";
import AdminDashboard from "../pages/admin/AdminDashboard";
import LoanCases from "../pages/admin/LoanCases";
import Customers from "../pages/admin/Customers";
import Documents from "../pages/admin/Documents";
import Banks from "../pages/admin/Banks";
import Reports from "../pages/admin/Reports";
import Settings from "../pages/admin/Settings";

// 🔹 Bank Pages
import BankDashboard from "../pages/bank/BankDashboard";
import Applications from "../pages/bank/Applications";
import Review from "../pages/bank/Review";
import BankReview from "../pages/bank/BankReview";
import BankDocuments from "../pages/bank/Documents";
import Offers from "../pages/bank/Offers";
import BankReports from "../pages/bank/Reports";

// 🔴 REJECTED PAGE
import RejectedApplications from "../pages/bank/RejectedApplications";

// 🟢 APPROVED PAGE (NEW)
import ApprovedApplications from "../pages/bank/ApprovedApplications";

// 🔹 User Pages
import UserDashboard from "../pages/user/UserDashboard";
import ApplyLoan from "../pages/user/ApplyLoan";
import MyApplications from "../pages/user/MyApplications";
import MyDocuments from "../pages/user/MyDocuments";
import UserSettings from "../pages/user/UserSettings";
import LoanStatus from "../pages/user/LoanStatus";

const AppRoutes = () => {
  return (
    <Routes>

      {/* 🔐 Auth */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= ADMIN ================= */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/loan-cases" element={<ProtectedRoute role="admin"><LoanCases /></ProtectedRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoute role="admin"><Customers /></ProtectedRoute>} />
      <Route path="/admin/documents" element={<ProtectedRoute role="admin"><Documents /></ProtectedRoute>} />
      <Route path="/admin/banks" element={<ProtectedRoute role="admin"><Banks /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute role="admin"><Settings /></ProtectedRoute>} />

      {/* Create Loan */}
      <Route
        path="/admin/create-loan"
        element={
          <ProtectedRoute role="admin">
            <CreateLoanCase />
          </ProtectedRoute>
        }
      />

      {/* ================= BANK ================= */}
      <Route path="/bank/dashboard" element={<ProtectedRoute role="bank"><BankDashboard /></ProtectedRoute>} />

      {/* Applications */}
      <Route path="/bank/applications" element={<ProtectedRoute role="bank"><Applications /></ProtectedRoute>} />

      {/* Under Review */}
      <Route path="/bank/under-review" element={<ProtectedRoute role="bank"><Applications /></ProtectedRoute>} />

      {/* 🟢 APPROVED APPLICATIONS */}
      <Route
        path="/bank/approved"
        element={
          <ProtectedRoute role="bank">
            <ApprovedApplications />
          </ProtectedRoute>
        }
      />

      {/* 🔴 REJECTED APPLICATIONS */}
      <Route
        path="/bank/rejected"
        element={
          <ProtectedRoute role="bank">
            <RejectedApplications />
          </ProtectedRoute>
        }
      />

      {/* 🔍 REVIEW (COMMON FOR ALL PAGES) */}
      <Route
        path="/bank/review/:caseNumber"
        element={
          <ProtectedRoute role="bank">
            <Review />
          </ProtectedRoute>
        }
      />

      {/* 🔍 API BASED REVIEW */}
      <Route
        path="/bank/bank-review/:id"
        element={
          <ProtectedRoute role="bank">
            <BankReview />
          </ProtectedRoute>
        }
      />

      {/* Redirect */}
      <Route path="/bank/review" element={<Navigate to="/bank/applications" replace />} />

      {/* Other Bank Pages */}
      <Route path="/bank/documents" element={<ProtectedRoute role="bank"><BankDocuments /></ProtectedRoute>} />
      <Route path="/bank/offers" element={<ProtectedRoute role="bank"><Offers /></ProtectedRoute>} />
      <Route path="/bank/reports" element={<ProtectedRoute role="bank"><BankReports /></ProtectedRoute>} />

      {/* ================= USER ================= */}
      <Route path="/user/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/apply-loan" element={<ProtectedRoute role="user"><ApplyLoan /></ProtectedRoute>} />
      <Route path="/user/applications" element={<ProtectedRoute role="user"><MyApplications /></ProtectedRoute>} />
      <Route path="/user/documents" element={<ProtectedRoute role="user"><MyDocuments /></ProtectedRoute>} />
      <Route path="/user/settings" element={<ProtectedRoute role="user"><UserSettings /></ProtectedRoute>} />
      <Route path="/user/loan-status" element={<ProtectedRoute role="user"><LoanStatus /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Login />} />

    </Routes>
  );
};

export default AppRoutes;