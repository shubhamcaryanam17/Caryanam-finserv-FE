import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/StatCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getLoggedInDisplayName } from "../../utils/displayName";
import { getLoans } from "../../services/loanService";

export default function BankDashboard() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const displayName = getLoggedInDisplayName(authUser);

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    newApplications: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);

  // ✅ FETCH DATA FROM BACKEND
  const fetchData = async () => {
  setLoading(true);

  try {
    const apps = await getLoans();   

    console.log("Loans API:", apps); 

    setApplications(apps);           

    const newApps = apps.length;

    const underReview = apps.filter(
      (a) =>
        a.status === "UNDER_REVIEW" ||
        a.status === "PENDING" ||
        a.status === "DOCUMENTS_PENDING"
    ).length;

    const approved = apps.filter(
      (a) => a.status === "APPROVED"
    ).length;

    const rejected = apps.filter(
      (a) => a.status === "REJECTED"
    ).length;

    setStats({
      newApplications: newApps,
      underReview,
      approved,
      rejected,
    });

  } catch (error) {
    console.error("Error fetching loans:", error);
  }

  setLoading(false);
};

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-700";
      case "PENDING":
      case "DOCUMENTS_PENDING":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatStatus = (status) => status?.replaceAll("_", " ");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">
            {getGreeting()}, {displayName} 👋
          </h2>
          <p className="text-gray-500">
            Bank executive dashboard — manage loan applications and approvals
          </p>
        </div>

        <button
          onClick={fetchData}
          className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300 text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard title="New Applications" value={stats.newApplications} color="blue" />
            <StatCard title="Under Review" value={stats.underReview} color="yellow" />
            <StatCard title="Approved" value={stats.approved} color="green" />
            <StatCard title="Rejected" value={stats.rejected} color="red" />
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-5">⚡ Quick Access</h3>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/bank/applications")}
                className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600"
              >
                Applications
              </button>

              <button
                onClick={() => navigate("/bank/reports")}
                className="bg-purple-500 text-white px-5 py-2 rounded-lg hover:bg-purple-600"
              >
                Reports
              </button>
            </div>
          </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-5">
          📄 Recent Loan Cases
        </h3>

        {applications.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            No applications available
          </div>
        ) : (
          <table className="w-full border-collapse">
            
            {/* HEADER */}
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="p-3">Case ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {applications.slice(0, 5).map((app) => (
                <tr
                  key={app.caseNumber}
                  className="border-b hover:bg-gray-50 transition"
                >
                  
                  {/* Case ID (Clickable style) */}
                  <td className="p-3 text-blue-600 font-medium cursor-pointer">
                    {app.caseNumber}
                  </td>

                  {/* Customer */}
                  <td className="p-3">
                    {app.fullName || "—"}
                  </td>

                  {/* Vehicle */}
                  <td className="p-3">
                    {app.loanType || "—"}
                  </td>

                  {/* Amount */}
                  <td className="p-3 font-medium">
                    ₹{app.loanAmount}
                  </td>

                  {/* Status */}
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {formatStatus(app.status)}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="p-3 text-gray-600">
                    {app.createdAt
                      ? app.createdAt.split("T")[0]
                      : "—"}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
        </>
      )}
    </AdminLayout>
  );
}