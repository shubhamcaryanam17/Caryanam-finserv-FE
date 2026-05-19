import AdminLayout from "../../layouts/AdminLayout";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/apiBase";

export default function Reports() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });

  const [loading, setLoading] = useState(true);

  // ✅ SAME AS DASHBOARD API
  const fetchData = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard`);
      const data = response.data;

      console.log("REPORT DASHBOARD DATA:", data);

      let apps = [];

      // ✅ HANDLE ARRAY RESPONSE
      if (Array.isArray(data)) {
        apps = data;
      } else {
        // ✅ HANDLE OBJECT RESPONSE
        apps =
          data.recentLoans ||
          data.loans ||
          data.data ||
          [];
      }

      setApplications(apps);

      // ✅ CALCULATE SAME AS DASHBOARD
      const total = apps.length;

      const approved = apps.filter(
        (a) => a.status === "APPROVED"
      ).length;

      const rejected = apps.filter(
        (a) => a.status === "REJECTED"
      ).length;

      const pending = apps.filter(
        (a) =>
          a.status === "UNDER_REVIEW" ||
          a.status === "PENDING" ||
          a.status === "DOCUMENTS_PENDING" ||
          a.status === "SUBMITTED_TO_BANK" ||
          a.status === "ASSIGNED_TO_BANK"
      ).length;

      setStats({ total, approved, rejected, pending });

    } catch (error) {
      console.error("Error fetching reports:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPercentage = (value) => {
    return stats.total === 0
      ? 0
      : ((value / stats.total) * 100).toFixed(1);
  };

  return (
    <AdminLayout>
      <div className="p-4">

        <h2 className="text-2xl font-semibold mb-6">
          Reports & Analytics
        </h2>

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading reports...
          </div>
        ) : (
          <>
            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

              <StatCard
                title="Total Applications"
                value={stats.total}
                color="from-blue-500 to-blue-600"
              />

              <StatCard
                title="Approved"
                value={stats.approved}
                percentage={getPercentage(stats.approved)}
                color="from-green-500 to-green-600"
              />

              <StatCard
                title="Rejected"
                value={stats.rejected}
                percentage={getPercentage(stats.rejected)}
                color="from-red-500 to-red-600"
              />

              <StatCard
                title="Pending"
                value={stats.pending}
                percentage={getPercentage(stats.pending)}
                color="from-yellow-500 to-yellow-600"
              />

            </div>

            {/* PROGRESS */}
            <div className="bg-white shadow rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">
                Application Status Overview
              </h3>

              <ProgressBar
                label="Approved"
                value={stats.approved}
                percentage={getPercentage(stats.approved)}
                color="bg-green-500"
              />

              <ProgressBar
                label="Rejected"
                value={stats.rejected}
                percentage={getPercentage(stats.rejected)}
                color="bg-red-500"
              />

              <ProgressBar
                label="Pending"
                value={stats.pending}
                percentage={getPercentage(stats.pending)}
                color="bg-yellow-500"
              />
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

/* STAT CARD */
function StatCard({ title, value, percentage, color }) {
  return (
    <div className={`bg-gradient-to-r ${color} text-white p-4 rounded-xl shadow`}>
      <p className="text-sm opacity-80">{title}</p>
      <h3 className="text-2xl font-semibold">{value}</h3>
      {percentage && (
        <p className="text-xs opacity-80">{percentage}%</p>
      )}
    </div>
  );
}

/* PROGRESS BAR */
function ProgressBar({ label, value, percentage, color }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span>
          {value} ({percentage}%)
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded h-3">
        <div
          className={`${color} h-3 rounded transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}