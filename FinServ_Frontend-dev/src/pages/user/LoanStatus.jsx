// // src/pages/user/LoanStatus.jsx

// import { useEffect, useState } from "react";
// import AdminLayout from "../../layouts/AdminLayout";

// // ✅ UPDATED SERVICE NAME
// import { getUserApplications } from "../../services/userApplicationService";

// export default function LoanStatus() {
//   const [applications, setApplications] = useState([]);

//   // ✅ FETCH USER-SPECIFIC DATA
//   useEffect(() => {
//     const fetchData = async () => {
//       const user = JSON.parse(localStorage.getItem("user"));

//       if (!user?.email) return;

//       const data = await getUserApplications();

//       // 🔥 FORMAT DATA (KEEP UI SAME)
//       const formatted = data.map((app, index) => ({
//         id: app.id || `LN00${index + 1}`,
//         carModel: app.loanType || "Car Loan",
//         loanAmount: app.loanAmount,
//         tenure: app.tenure || 60,
//         status: formatStatus(app.status),
//         remark: app.remark || app.adminRemark || "",
//       }));

//       setApplications(formatted);
//     };

//     fetchData();
//   }, []);

//   // ✅ FORMAT STATUS (IMPORTANT)
//   const formatStatus = (status) => {
//     if (!status) return "Pending";

//     return status
//       .toLowerCase()
//       .replaceAll("_", " ")
//       .replace(/\b\w/g, (c) => c.toUpperCase());
//   };

//   return (
//     <AdminLayout>
//       <div className="p-6">
//         <h2 className="text-2xl font-semibold mb-6">Loan Status</h2>

//         {applications.length === 0 ? (
//           <p className="text-gray-500">No applications found.</p>
//         ) : (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

//             {applications.map((app, index) => (
//               <div
//                 key={index}
//                 className="bg-white p-5 rounded-2xl shadow border hover:shadow-lg transition"
//               >
//                 {/* Header */}
//                 <div className="flex justify-between items-center mb-3">
//                   <h3 className="font-semibold text-lg">
//                     {app.carModel}
//                   </h3>
//                   <span className="text-xs text-gray-400">
//                     {app.id}
//                   </span>
//                 </div>

//                 {/* Details */}
//                 <div className="space-y-1 text-sm text-gray-600">
//                   <p>💰 Amount: ₹{app.loanAmount}</p>
//                   <p>📅 Tenure: {app.tenure} months</p>
//                 </div>

//                 {/* Status Badge */}
//                 <div className="mt-4">
//                   <span
//                     className={`px-3 py-1 text-xs font-semibold rounded-full ${
//                       app.status === "Approved"
//                         ? "bg-green-100 text-green-600"
//                         : app.status === "Rejected"
//                         ? "bg-red-100 text-red-600"
//                         : "bg-yellow-100 text-yellow-600"
//                     }`}
//                   >
//                     {app.status}
//                   </span>
//                 </div>

//                 {app.remark ? (
//                   <div className="mt-3 text-sm text-gray-600">
//                     <p className="font-medium text-gray-800">Remark</p>
//                     <p>{app.remark}</p>
//                   </div>
//                 ) : null}

//                 {/* Progress Bar */}
//                 <div className="mt-4">
//                   <div className="w-full bg-gray-200 h-2 rounded">
//                     <div
//                       className={`h-2 rounded transition-all duration-500 ${
//                         app.status === "Approved"
//                           ? "bg-green-500 w-full"
//                           : app.status === "Rejected"
//                           ? "bg-red-500 w-full"
//                           : "bg-yellow-500 w-1/2"
//                       }`}
//                     ></div>
//                   </div>
//                 </div>

//               </div>
//             ))}

//           </div>
//         )}
//       </div>
//     </AdminLayout>
//   );
// }



// src/pages/user/LoanStatus.jsx

import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getUserApplications } from "../../services/userApplicationService";

export default function LoanStatus() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const response = await getUserApplications();

      console.log("Applications => ", response);

      if (!response || !Array.isArray(response)) {
        setApplications([]);
        return;
      }

      // ✅ FULLY DYNAMIC DATA
      const formattedData = response.map((app) => ({
        id:
          app.applicationId ||
          app.loanId ||
          app.id ||
          `LOAN-${Math.floor(Math.random() * 1000000)}`,

        carModel:
          app.carModel ||
          app.vehicleName ||
          app.loanType ||
          "Car Loan",

        loanAmount: app.loanAmount || 0,

        tenure: app.tenure || 60,

        status: formatStatus(app.status),

        remark: app.remark || app.adminRemark || "",
      }));

      setApplications(formattedData);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ STATUS FORMAT
  const formatStatus = (status) => {
    if (!status) return "Pending";

    const formatted = status
      .toString()
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return formatted;
  };

  // ✅ STATUS COLOR
  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return {
          badge: "bg-green-100 text-green-700",
          progress: "bg-green-500 w-full",
        };

      case "Rejected":
        return {
          badge: "bg-red-100 text-red-700",
          progress: "bg-red-500 w-full",
        };

      case "Assigned To Bank":
        return {
          badge: "bg-blue-100 text-blue-700",
          progress: "bg-blue-500 w-3/4",
        };

      case "Under Review":
        return {
          badge: "bg-purple-100 text-purple-700",
          progress: "bg-purple-500 w-1/2",
        };

      default:
        return {
          badge: "bg-yellow-100 text-yellow-700",
          progress: "bg-yellow-500 w-1/3",
        };
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Loan Status
        </h2>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 shadow text-center">
            <p className="text-gray-500 text-lg">
              No applications found.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {applications.map((app) => {
              const styles = getStatusStyle(app.status);

              return (
                <div
                  key={app.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* HEADER */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {app.carModel}
                      </h3>
                    </div>

                    <span className="text-xs text-gray-400 font-medium">
                      {app.id}
                    </span>
                  </div>

                  {/* DETAILS */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      💰 Amount:
                      <span className="font-semibold ml-1">
                        ₹{Number(app.loanAmount).toLocaleString()}
                      </span>
                    </p>

                    <p>
                      📅 Tenure:
                      <span className="font-semibold ml-1">
                        {app.tenure} months
                      </span>
                    </p>
                  </div>

                  {/* STATUS */}
                  <div className="mt-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${styles.badge}`}
                    >
                      {app.status}
                    </span>
                  </div>

                  {/* REMARK */}
                  {app.remark && (
                    <div className="mt-4 bg-gray-50 p-3 rounded-xl border">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Remark
                      </p>

                      <p className="text-sm text-gray-600">
                        {app.remark}
                      </p>
                    </div>
                  )}

                  {/* PROGRESS BAR */}
                  <div className="mt-5">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${styles.progress}`}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}