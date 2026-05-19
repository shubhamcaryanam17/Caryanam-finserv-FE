import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { getLoggedInDisplayName } from "../../utils/displayName";
import StatCard from "../../components/StatCard";
import LoanTable from "../../components/LoanTable";

import { fetchAdminDashboard } from "../../services/dashboardService";

// ✅ ICONS
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const { user: authUser } = useAuth();

  // ✅ STATE FROM SERVICE
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });

  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const displayName = getLoggedInDisplayName(authUser);

  // ✅ FETCH DASHBOARD DATA
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const { stats: statsData, tableRows } = await fetchAdminDashboard();

        setStats(statsData);
        setApplications(tableRows);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ✅ GREETING
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <AdminLayout>
      {/* Greeting */}
      <h2 className="text-xl font-semibold mb-1">
        {getGreeting()}, {displayName}
      </h2>

      <p className="text-gray-500 mb-6">
        Here's what's happening with your loan cases today.
      </p>

      {/* Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/admin/create-loan")}
          className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-600 transition"
        >
          <PlusCircle size={18} />
          Create New Loan Case
        </button>
      </div>

      {/* ✅ STATS */}
      {loading ? (
        <p className="text-gray-500">Loading dashboard...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Applications"
            value={stats.total}
            icon={<FileText size={20} />}
            color="blue"
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<Clock size={20} />}
            color="yellow"
          />

          <StatCard
            title="Approved"
            value={stats.approved}
            icon={<CheckCircle size={20} />}
            color="green"
          />

          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={<XCircle size={20} />}
            color="red"
          />
        </div>
      )}

      {/* TABLE */}
      <div className="mt-6">
        <LoanTable data={applications} />
      </div>
    </AdminLayout>
  );
}