// src/pages/user/MyApplications.jsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getStoredUserId } from "../../services/userLoanApi";

// ✅ SERVICE
import { getUserApplications } from "../../services/userService";

export default function MyApplications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  const setSearchQuery = (value) => {
    setSearch(value);
    setSearchParams(value.trim() ? { q: value } : {}, { replace: true });
  };

  console.log("Stored User:", JSON.parse(localStorage.getItem("user")));
  console.log("Resolved User ID:", getStoredUserId());
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = getStoredUserId();

      if (!userId) {
        console.error("User ID not found");
        return;
      }

      const data = await getUserApplications();

        // 🔥 FORMAT DATA TO MATCH UI (API-backed)
        const formatted = data.map((app) => ({
          id: app.caseNumber || app.id,
          carModel: app.loanType || "-",
          amount: "₹" + app.loanAmount,
          status: formatStatus(app.status),
          remark: app.adminRemark || app.remark || "—",
          bank: app.bank || "—",
        }));

        setApplications(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // 🔥 FORMAT STATUS
  const formatStatus = (status) => {
    return status.replaceAll("_", " ");
  };

  // 🔥 STATUS COLOR
  const getStatusColor = (status) => {
    if (status === "APPROVED" || status === "Approved")
      return "text-green-500";
    if (status === "REJECTED" || status === "Rejected")
      return "text-red-500";
    if (
      status === "UNDER REVIEW" ||
      status === "Under Review" ||
      status === "PENDING"
    )
      return "text-yellow-500";

    return "text-gray-500";
  };

  const filtered = applications.filter((app) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return `${app.id} ${app.carModel} ${app.amount} ${app.status} ${app.bank}`
      .toLowerCase()
      .includes(q);
  });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto w-full px-1 sm:px-2">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          My Loan Applications
        </h2>

        <input
          type="search"
          placeholder="Search my applications…"
          className="border border-gray-200 bg-white px-4 py-2.5 rounded-lg w-full max-w-lg mb-6 shadow-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition"
          value={search}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Filter my applications"
        />

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
          <div className="p-5 sm:p-6 md:p-8">
            {applications.length === 0 ? (
              <div className="text-center text-gray-500 py-10 px-4">
                No applications found
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-gray-500 py-10 px-4">
                No applications match your search
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-200">
                    <th className="text-left font-medium py-3 pl-2 pr-4 sm:pl-4 sm:pr-4">
                      Loan ID
                    </th>
                    <th className="text-left font-medium py-3 px-4">
                      Car Model
                    </th>
                    <th className="text-left font-medium py-3 px-4">
                      Amount
                    </th>
                    <th className="text-left font-medium py-3 px-4">
                      Status
                    </th>
                    <th className="text-left font-medium py-3 px-4">
                      Remark
                    </th>
                    <th className="text-left font-medium py-3 pl-4 pr-2 sm:pl-4 sm:pr-4">
                      Bank
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((app, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/80"
                    >
                      <td className="py-3.5 pl-2 pr-4 sm:pl-4 sm:pr-4 text-gray-800">
                        {app.id}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">{app.carModel}</td>
                      <td className="py-3.5 px-4 text-gray-800 font-medium">
                        {app.amount}
                      </td>
                      <td
                        className={`py-3.5 px-4 font-medium ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 max-w-xs truncate" title={app.remark}>
                        {app.remark}
                      </td>
                      <td className="py-3.5 pl-4 pr-2 sm:pl-4 sm:pr-4 text-gray-700">
                        {app.bank}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}