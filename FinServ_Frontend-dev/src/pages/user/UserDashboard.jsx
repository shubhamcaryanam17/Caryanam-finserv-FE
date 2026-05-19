// // src/pages/user/UserDashboard.jsx

// import { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import AdminLayout from "../../layouts/AdminLayout";
// import { useAuth } from "../../context/AuthContext";
// import { getLoggedInDisplayName } from "../../utils/displayName";
// import StatCard from "../../components/StatCard";

// // ✅ API-backed list (POST /api/loans/search by your registered full name)
// import {
//   fetchMyLoansFromApi,
//   ensureUserProfile,
// } from "../../services/userLoanApi";

// export default function UserDashboard() {
//   const { user: authUser } = useAuth();
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const navigate = useNavigate();
//   const location = useLocation();

//   const displayName = getLoggedInDisplayName(authUser);

//   useEffect(() => {
//     let cancelled = false;

//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         await ensureUserProfile();
//         const data = await fetchMyLoansFromApi();
//         if (!cancelled) setApplications(data || []);
//       } catch (err) {
//         console.error("Error fetching applications:", err);
//         if (!cancelled) setApplications([]);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     fetchData();
//     return () => {
//       cancelled = true;
//     };
//   }, [location.key]);

//   // ✅ GREETING
//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return "Good Morning";
//     if (hour < 18) return "Good Afternoon";
//     return "Good Evening";
//   };

//   // ✅ STATS
//   const total = applications.length;
//   const underReview = applications.filter(
//     (a) =>
//       a.status === "UNDER_REVIEW" ||
//       a.status === "SUBMITTED_TO_BANK" ||
//       a.status === "ASSIGNED_TO_BANK" ||
//       a.status === "DOCUMENTS_PENDING" ||
//       a.status === "PENDING"
//   ).length;
//   const approved = applications.filter(a => a.status === "APPROVED").length;
//   const rejected = applications.filter(
//     (a) => a.status === "REJECTED" || a.status === "REJECTED_BY_ADMIN"
//   ).length;

//   // ✅ STATUS COLOR
//   const getStatusColor = (status) => {
//     switch (status) {
//       case "APPROVED":
//         return "text-green-600";
//       case "REJECTED":
//       case "REJECTED_BY_ADMIN":
//         return "text-red-600";
//       case "UNDER_REVIEW":
//         return "text-yellow-600";
//       case "PENDING":
//       case "ASSIGNED_TO_BANK":
//       case "SUBMITTED_TO_BANK":
//         return "text-blue-600";
//       case "DOCUMENTS_PENDING":
//         return "text-amber-600";
//       default:
//         return "text-gray-600";
//     }
//   };

//   // ============================
//   // ✅ ACTION HANDLERS
//   // ============================

//   const handleApplyLoan = () => {
//     navigate("/user/apply-loan");
//   };

//   const handleUploadDocs = () => {
//     navigate("/user/documents");
//   };

//   const handleRowClick = () => {
//     navigate("/user/applications");
//   };

//   return (
//     <AdminLayout>
//       <div className="max-w-6xl mx-auto w-full px-1 sm:px-2 pt-1">
//         <h2 className="text-xl font-semibold text-gray-900 mb-2">
//           {getGreeting()}, {displayName} 👋
//         </h2>

//         <p className="text-gray-500 mb-8">
//           Manage your loan journey in one place.
//         </p>

//         <div className="flex flex-wrap gap-3 mb-8">
//           <button
//             type="button"
//             onClick={handleApplyLoan}
//             className="bg-teal-500 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-teal-600 transition"
//           >
//             + Apply Loan
//           </button>

//           {/* <button
//             type="button"
//             onClick={handleUploadDocs}
//             className="bg-blue-500 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-600 transition"
//           >
//             Upload Documents
//           </button> */}
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <StatCard title="Applications" value={total} change="Active" color="blue" />
//           <StatCard title="Under Review" value={underReview} change="Processing" color="yellow" />
//           <StatCard title="Approved" value={approved} change="Success" color="green" />
//           <StatCard title="Rejected" value={rejected} change="Check reason" color="red" />
//         </div>

//         <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto mb-8">
//           <div className="p-5 sm:p-6 md:p-8">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">
//               My Loan Applications
//             </h3>

//             {loading ? (
//               <div className="text-center py-10 text-gray-500">
//                 Loading applications...
//               </div>
//             ) : applications.length === 0 ? (
//               <div className="text-gray-500 text-center py-10 px-4 leading-relaxed">
//                 No applications found. Submit one from Apply Loan — it must match the
//                 full name on your registered profile.
//               </div>
//             ) : (
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="text-gray-500 border-b border-gray-200">
//                     <th className="text-left font-medium py-3 pl-2 pr-4 sm:pl-4 align-middle">
//                       Loan ID
//                     </th>
//                     <th className="text-left font-medium py-3 px-4 align-middle">
//                       Vehicle
//                     </th>
//                     <th className="text-left font-medium py-3 px-4 align-middle">
//                       Amount
//                     </th>
//                     <th className="text-left font-medium py-3 px-4 align-middle">
//                       Status
//                     </th>
//                     <th className="text-left font-medium py-3 px-4 align-middle">
//                       Remark
//                     </th>
//                     <th className="text-left font-medium py-3 pl-4 pr-2 sm:pr-4 align-middle">
//                       Date
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {applications.map((app) => (
//                     <tr
//                       key={app.id}
//                       onClick={handleRowClick}
//                       className="border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50/80"
//                     >
//                       <td className="py-3.5 pl-2 pr-4 sm:pl-4 align-middle text-gray-800">
//                         {app.caseNumber || app.id}
//                       </td>
//                       <td className="py-3.5 px-4 align-middle text-gray-700">
//                         {app.loanType}
//                       </td>
//                       <td className="py-3.5 px-4 align-middle text-gray-800 font-medium">
//                         ₹{app.loanAmount}
//                       </td>
//                       <td
//                         className={`py-3.5 px-4 align-middle font-medium ${getStatusColor(
//                           app.status
//                         )}`}
//                       >
//                         {app.status.replaceAll("_", " ")}
//                       </td>
//                       <td className="py-3.5 px-4 align-middle text-gray-700 max-w-xs truncate" title={app.remark}>
//                         {app.remark || "-"}
//                       </td>
//                       <td className="py-3.5 pl-4 pr-2 sm:pr-4 align-middle text-gray-700">
//                         {app.submittedAt || "-"}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>

//         {/* <div className="bg-white rounded-xl shadow-md border border-gray-100">
//           <div className="p-5 sm:p-6 md:p-8"> */}
//             {/* <h3 className="text-lg font-semibold text-gray-900 mb-6">
//               Application Progress
//             </h3>

//             <div className="flex items-center justify-between text-sm flex-wrap gap-x-4 gap-y-3 pt-1">
//               <div className="text-green-600 font-medium">✔ Applied</div>
//               <div className="text-green-600 font-medium">✔ Documents Uploaded</div>
//               <div className="text-yellow-600 font-medium">⏳ Under Review</div>
//               <div className="text-gray-400">Pending Approval</div>
//               <div className="text-gray-400">Disbursed</div> */}
//             </div>
//             {/* </div>
//           </div> */}
//       {/* </div> */}
//     </AdminLayout>
//   );
// }





// src/pages/user/UserDashboard.jsx

import { useEffect, useState } from "react";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { getLoggedInDisplayName } from "../../utils/displayName";

import StatCard from "../../components/StatCard";

// ✅ API
import {
  fetchMyLoansFromApi,
  ensureUserProfile,
} from "../../services/userLoanApi";

export default function UserDashboard() {

  const { user: authUser } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const displayName =
    getLoggedInDisplayName(authUser);

  // ✅ FETCH DATA
  useEffect(() => {

    let cancelled = false;

    const fetchData = async () => {

      setLoading(true);

      try {

        await ensureUserProfile();

        const data =
          await fetchMyLoansFromApi();

        console.log("USER APPLICATIONS:", data);

        if (!cancelled) {
          setApplications(data || []);
        }

      } catch (err) {

        console.error(
          "Error fetching applications:",
          err
        );

        if (!cancelled) {
          setApplications([]);
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };

  }, [location.key]);

  // ✅ GREETING
  const getGreeting = () => {

    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";

    if (hour < 18) return "Good Afternoon";

    return "Good Evening";
  };

  // ✅ STATS
  const total = applications.length;

  const underReview = applications.filter(
    (a) =>
      a.status === "UNDER_REVIEW" ||
      a.status === "SUBMITTED_TO_BANK" ||
      a.status === "ASSIGNED_TO_BANK" ||
      a.status === "DOCUMENTS_PENDING" ||
      a.status === "PENDING"
  ).length;

  const approved = applications.filter(
    (a) => a.status === "APPROVED"
  ).length;

  const rejected = applications.filter(
    (a) =>
      a.status === "BANK_REJECTED" ||
      a.status === "REJECTED" ||
      a.status === "REJECTED_BY_ADMIN"
  ).length;

  // ✅ STATUS COLOR
  const getStatusColor = (status) => {

    switch (status) {

      case "APPROVED":
        return "text-green-600";

      case "BANK_REJECTED":
      case "REJECTED":
        return "text-red-600";

      case "REJECTED_BY_ADMIN":
        return "text-orange-600";

      case "UNDER_REVIEW":
        return "text-yellow-600";

      case "PENDING":
      case "ASSIGNED_TO_BANK":
      case "SUBMITTED_TO_BANK":
        return "text-blue-600";

      case "DOCUMENTS_PENDING":
        return "text-amber-600";

      default:
        return "text-gray-600";
    }
  };

  // ✅ STATUS TEXT
  const formatStatus = (status) => {

    if (status === "BANK_REJECTED") {
      return "Rejected By Bank";
    }

    if (status === "REJECTED_BY_ADMIN") {
      return "Rejected By Admin";
    }

    return status?.replaceAll("_", " ");
  };

  // ============================
  // ✅ ACTIONS
  // ============================

  const handleApplyLoan = () => {
    navigate("/user/apply-loan");
  };

  const handleUploadDocs = () => {
    navigate("/user/documents");
  };

  const handleRowClick = () => {
    navigate("/user/applications");
  };

  return (

    <AdminLayout>

      <div className="max-w-6xl mx-auto w-full px-1 sm:px-2 pt-1">

        {/* GREETING */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">

          {getGreeting()}, {displayName} 👋

        </h2>

        <p className="text-gray-500 mb-8">
          Manage your loan journey in one place.
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-3 mb-8">

          <button
            type="button"
            onClick={handleApplyLoan}
            className="bg-teal-500 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-teal-600 transition"
          >
            + Apply Loan
          </button>

          {/* <button
            type="button"
            onClick={handleUploadDocs}
            className="bg-blue-500 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-600 transition"
          >
            Upload Documents
          </button> */}

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <StatCard
            title="Applications"
            value={total}
            change="Active"
            color="blue"
          />

          <StatCard
            title="Under Review"
            value={underReview}
            change="Processing"
            color="yellow"
          />

          <StatCard
            title="Approved"
            value={approved}
            change="Success"
            color="green"
          />

          <StatCard
            title="Rejected"
            value={rejected}
            change="Check reason"
            color="red"
          />

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto mb-8">

          <div className="p-5 sm:p-6 md:p-8">

            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              My Loan Applications
            </h3>

            {loading ? (

              <div className="text-center py-10 text-gray-500">
                Loading applications...
              </div>

            ) : applications.length === 0 ? (

              <div className="text-gray-500 text-center py-10 px-4 leading-relaxed">

                No applications found.
                Submit one from Apply Loan.

              </div>

            ) : (

              <table className="w-full text-sm">

                {/* HEADER */}
                <thead>

                  <tr className="text-gray-500 border-b border-gray-200">

                    <th className="text-left font-medium py-3 pl-2 pr-4 sm:pl-4 align-middle">
                      Loan ID
                    </th>

                    <th className="text-left font-medium py-3 px-4 align-middle">
                      Vehicle
                    </th>

                    <th className="text-left font-medium py-3 px-4 align-middle">
                      Amount
                    </th>

                    <th className="text-left font-medium py-3 px-4 align-middle">
                      Status
                    </th>

                    <th className="text-left font-medium py-3 px-4 align-middle">
                      Remark
                    </th>

                    <th className="text-left font-medium py-3 pl-4 pr-2 sm:pr-4 align-middle">
                      Date
                    </th>

                  </tr>

                </thead>

                {/* BODY */}
                <tbody>

                  {applications.map((app) => (

                    <tr
                      key={app.id}
                      onClick={handleRowClick}
                      className="border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50/80"
                    >

                      {/* CASE */}
                      <td className="py-3.5 pl-2 pr-4 sm:pl-4 align-middle text-gray-800">

                        {app.caseNumber || app.id}

                      </td>

                      {/* VEHICLE */}
                      <td className="py-3.5 px-4 align-middle text-gray-700">

                        {app.loanType}

                      </td>

                      {/* AMOUNT */}
                      <td className="py-3.5 px-4 align-middle text-gray-800 font-medium">

                        ₹{app.loanAmount}

                      </td>

                      {/* STATUS */}
                      <td
                        className={`py-3.5 px-4 align-middle font-medium ${getStatusColor(
                          app.status
                        )}`}
                      >

                        {formatStatus(app.status)}

                      </td>

                      {/* REMARK */}
                      <td
                        className="py-3.5 px-4 align-middle text-gray-700 max-w-xs truncate"
                        title={app.remark}
                      >

                        {app.remark || "-"}

                      </td>

                      {/* DATE */}
                      <td className="py-3.5 pl-4 pr-2 sm:pr-4 align-middle text-gray-700">

                        {app.submittedAt || "-"}

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