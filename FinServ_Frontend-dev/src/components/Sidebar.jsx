import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Folder,
  Landmark,
  BarChart,
  Settings,
  CreditCard,
  ClipboardCheck,
  XCircle,
  CheckCircle, // 🟢 NEW
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user?.role) {
      setRole(user.role.toLowerCase());
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        try {
          const parsed = JSON.parse(storedUser);
          setRole(parsed?.role?.toLowerCase() || "");
        } catch {
          setRole("");
        }
      }
    }
  }, [user]);

  const menuConfig = {
    admin: [
      { icon: <LayoutDashboard size={20} />, text: "Dashboard", to: "/admin/dashboard" },
      { icon: <FileText size={20} />, text: "Applications", to: "/admin/loan-cases" },
      { icon: <Users size={20} />, text: "Customers", to: "/admin/customers" },
      { icon: <Folder size={20} />, text: "Documents", to: "/admin/documents" },
      { icon: <Landmark size={20} />, text: "Banks", to: "/admin/banks" },
      { icon: <BarChart size={20} />, text: "Reports", to: "/admin/reports" },
      { icon: <Settings size={20} />, text: "Settings", to: "/admin/settings" },
    ],

    // 🔥 UPDATED BANK MENU
    bank_evaluate: [
      { icon: <LayoutDashboard size={20} />, text: "Dashboard", to: "/bank/dashboard" },
      { icon: <FileText size={20} />, text: "Loan Applications", to: "/bank/applications" },

      // 🟢 APPROVED (ABOVE REJECTED)
      { icon: <CheckCircle size={20} />, text: "Approved Applications", to: "/bank/approved" },

      // 🔴 REJECTED
      { icon: <XCircle size={20} />, text: "Rejected Applications", to: "/bank/rejected" },

      { icon: <Folder size={20} />, text: "Documents", to: "/bank/documents" },
      // { icon: <BarChart size={20} />, text: "Reports", to: "/bank/reports" },
    ],

    user: [
      { icon: <LayoutDashboard size={20} />, text: "Dashboard", to: "/user/dashboard" },
      { icon: <FileText size={20} />, text: "Apply Loan", to: "/user/apply-loan" },
      { icon: <ClipboardCheck size={20} />, text: "My Applications", to: "/user/applications" },
      // { icon: <Folder size={20} />, text: "My Documents", to: "/user/documents" },
      { icon: <BarChart size={20} />, text: "Loan Status", to: "/user/loan-status" },
      { icon: <Settings size={20} />, text: "Settings", to: "/user/settings" },
    ],
  };

  const menus = menuConfig[role] || [];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="w-64 h-full bg-[#0B1E36] text-white flex flex-col">

      {/* Logo */}
      <div className="p-5 text-xl font-bold border-b border-gray-700">
        Caryanam
        <div className="text-sm text-gray-400 capitalize">
          {role || "guest"} Panel
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 p-3 space-y-2">
        {menus.length > 0 ? (
          menus.map((item, index) => (
            <MenuItem key={index} {...item} />
          ))
        ) : (
          <p className="text-gray-400 text-sm px-3">
            No menu available
          </p>
        )}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full bg-gray-800 p-2 rounded hover:bg-gray-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function MenuItem({ icon, text, to }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 p-3 rounded transition ${
          isActive
            ? "bg-[#112E52] text-white"
            : "text-gray-300 hover:bg-[#112E52] hover:text-white"
        }`
      }
    >
      {icon}
      <span>{text}</span>
    </NavLink>
  );
}