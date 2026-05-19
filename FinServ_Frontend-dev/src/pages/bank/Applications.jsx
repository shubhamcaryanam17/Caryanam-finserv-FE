// import AdminLayout from "../../layouts/AdminLayout";
// import { useAuth } from "../../context/AuthContext";
// import {
//   useNavigate,
//   useLocation,
//   useSearchParams,
// } from "react-router-dom";
// import { useEffect, useState } from "react";

// // ✅ USE SERVICE
// import { getLoans } from "../../services/loanService";

// export default function Applications() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [searchParams, setSearchParams] = useSearchParams();

//   const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
//   const [applications, setApplications] = useState([]);

//   const isUnderReviewPage = location.pathname.includes("under-review");

//   // ✅ normalize helper
//   const normalize = (str) =>
//     (str || "").toLowerCase().replace(/\s+/g, "").trim();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // ✅ USE SAME API AS ADMIN
//         const data = await getLoans();

//         console.log("API DATA:", data);
//         console.log("USER:", user);

//         setApplications(data || []);
//       } catch (error) {
//         console.error("Error fetching applications:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   useEffect(() => {
//     setSearch(searchParams.get("q") ?? "");
//   }, [searchParams]);

//   const setSearchQuery = (value) => {
//     setSearch(value);
//     setSearchParams(value.trim() ? { q: value } : {}, { replace: true });
//   };

//   const filteredApps = applications.filter((app) => {

//     const loanBank = normalize(app.bank);
//     const userBank = normalize(
//       user?.bankName || user?.name || user?.email?.split("@")[0]
//     );

//     // ✅ STRONG MATCHING
//     const isSameBank =
//       loanBank.includes(userBank) || userBank.includes(loanBank);

//     // ✅ VALID STATUSES
//     const isValidStatus =
//       app.status === "ASSIGNED_TO_BANK" ||
//       app.status === "APPROVED" ||
//       app.status === "SUBMITTED_TO_BANK";

//     const haystack =
//       `${app.fullName} ${app.caseNumber} ${app.mobile} ${app.loanType} ${app.bank} ${app.loanAmount}`.toLowerCase();

//     const matchesSearch =
//       !search.trim() || haystack.includes(search.toLowerCase());

//     return isSameBank && isValidStatus && matchesSearch;
//   });

//   const getStatusStyle = (status) => {
//     switch (status) {
//       case "PENDING":
//         return "bg-yellow-100 text-yellow-700";
//       case "UNDER_REVIEW":
//         return "bg-blue-100 text-blue-700";
//       case "APPROVED":
//         return "bg-green-100 text-green-700";
//       case "REJECTED":
//         return "bg-red-100 text-red-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   const formatStatus = (status) => {
//     if (status === "SUBMITTED_TO_BANK" || status === "ASSIGNED_TO_BANK") {
//       return "UNDER REVIEW";
//     }
//     return status?.replaceAll("_", " ");
//   };

//  return (
//   <AdminLayout>
//     <div className="p-6">

//       {/* HEADER */}
//       <h1 className="text-2xl font-semibold text-gray-800">
//         {isUnderReviewPage
//           ? "Under Review Applications"
//           : "Loan Applications"}
//       </h1>

//       {/* SEARCH */}
//       <div className="flex justify-between items-center mt-6 flex-wrap gap-3">
//         <input
//           type="search"
//           placeholder="Search by case number, customer, bank, mobile…"
//           value={search}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="px-4 py-2 border rounded-lg text-sm w-full max-w-xs focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       {/* TABLE */}
//       <div className="bg-white rounded-2xl shadow mt-6 p-4">

//         <h2 className="text-lg font-semibold mb-4">All cases</h2>

//         {filteredApps.length === 0 ? (
//           <p className="text-gray-500 text-center py-6">
//             No applications found
//           </p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">

//               {/* HEADER */}
//               <thead>
//                 <tr className="text-gray-500 border-b text-left">
//                   <th className="py-3">Case</th>
//                   <th>Customer</th>
//                   <th>Vehicle</th>
//                   <th>Amount</th>
//                   <th>Bank</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>

//               {/* BODY */}
//               <tbody className="text-gray-700">
//                 {filteredApps.map((app) => {

//                   const name = app.fullName;
//                   const loanType = app.loanType;
//                   const amount = app.loanAmount;
//                   const status = app.status;
//                   const caseNumber = app.caseNumber;
//                   const bank = app.bank;

//                   return (
//                     <tr
//                       key={caseNumber}
//                       className="border-b hover:bg-gray-50 transition"
//                     >
//                       <td className="py-3 text-blue-600 font-medium cursor-pointer">
//                         {caseNumber}
//                       </td>

//                       <td>{name}</td>

//                       <td>{loanType}</td>

//                       <td>₹{Number(amount).toLocaleString()}</td>

//                       <td>{bank}</td>

//                       <td>
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
//                             status
//                           )}`}
//                         >
//                           {formatStatus(status)}
//                         </span>
//                       </td>

//                       <td>
//                         <div className="flex gap-2 text-xs">

//                           <button
//                             onClick={() =>
//                               navigate(`/bank/review/${caseNumber}`)
//                             }
//                             className="px-3 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
//                           >
//                             Review
//                           </button>

//                           {status === "APPROVED" || status === "REJECTED" ? (
//                             <span className="text-gray-400">
//                               Closed
//                             </span>
//                           ) : (
//                             <span className="text-gray-400">
//                               Awaiting bank
//                             </span>
//                           )}

//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>

//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   </AdminLayout>
// );
// }



// import AdminLayout from "../../layouts/AdminLayout";
// import { useAuth } from "../../context/AuthContext";
// import {
//   useNavigate,
//   useLocation,
//   useSearchParams,
// } from "react-router-dom";
// import { useEffect, useState } from "react";

// import { getLoans } from "../../services/loanService";

// export default function Applications() {
//   const { user } = useAuth();

//   const navigate = useNavigate();
//   const location = useLocation();

//   const [searchParams, setSearchParams] = useSearchParams();

//   const [search, setSearch] = useState(
//     () => searchParams.get("q") ?? ""
//   );

//   const [applications, setApplications] = useState([]);

//   const isUnderReviewPage =
//     location.pathname.includes("under-review");

//   // SAFE NORMALIZE
//   const normalize = (str) =>
//     (str || "")
//       .toString()
//       .toLowerCase()
//       .replace(/\s+/g, "")
//       .trim();

//   // FETCH DATA
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const data = await getLoans();

//         console.log("API DATA:", data);
//         console.log("USER:", user);

//         setApplications(Array.isArray(data) ? data : []);
//       } catch (error) {
//         console.error("Error fetching applications:", error);
//       }
//     };

//     fetchData();
//   }, [user]);

//   // SEARCH SYNC
//   useEffect(() => {
//     setSearch(searchParams.get("q") ?? "");
//   }, [searchParams]);

//   const setSearchQuery = (value) => {
//     setSearch(value);

//     setSearchParams(
//       value.trim() ? { q: value } : {},
//       { replace: true }
//     );
//   };

//   // FILTER APPS
//   const filteredApps = applications.filter((app) => {
//     console.log("APP:", app);

//     const loanBank = normalize(app.bank);

//     // 🔥 FIXED: force correct bank (temporary fix)
//     const userBank = normalize("hdfc");

//     const isSameBank = loanBank === userBank;

//     const isValidStatus =
//       app.status === "ASSIGNED_TO_BANK" ||
//       app.status === "APPROVED" ||
//       app.status === "SUBMITTED_TO_BANK" ||
//       app.status === "PENDING";

//     const haystack = `
//       ${app.fullName || ""}
//       ${app.caseNumber || ""}
//       ${app.mobile || ""}
//       ${app.loanType || ""}
//       ${app.bank || ""}
//       ${app.loanAmount || ""}
//     `.toLowerCase();

//     const matchesSearch =
//       !search.trim() ||
//       haystack.includes(search.toLowerCase());

//     return isSameBank && isValidStatus && matchesSearch;
//   });

//   const getStatusStyle = (status) => {
//     switch (status) {
//       case "PENDING":
//         return "bg-yellow-100 text-yellow-700";

//       case "UNDER_REVIEW":
//       case "ASSIGNED_TO_BANK":
//       case "SUBMITTED_TO_BANK":
//         return "bg-blue-100 text-blue-700";

//       case "APPROVED":
//         return "bg-green-100 text-green-700";

//       case "REJECTED":
//         return "bg-red-100 text-red-700";

//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   const formatStatus = (status) => {
//     if (
//       status === "SUBMITTED_TO_BANK" ||
//       status === "ASSIGNED_TO_BANK"
//     ) {
//       return "UNDER REVIEW";
//     }

//     return status?.replaceAll("_", " ");
//   };

//   return (
//     <AdminLayout>
//       <div className="p-6">

//         <h1 className="text-2xl font-semibold text-gray-800">
//           {isUnderReviewPage
//             ? "Under Review Applications"
//             : "Loan Applications"}
//         </h1>

//         <div className="flex justify-between items-center mt-6 flex-wrap gap-3">
//           <input
//             type="search"
//             placeholder="Search by case number, customer, bank, mobile…"
//             value={search}
//             onChange={(e) =>
//               setSearchQuery(e.target.value)
//             }
//             className="px-4 py-2 border rounded-lg text-sm w-full max-w-xs focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="bg-white rounded-2xl shadow mt-6 p-4">

//           <h2 className="text-lg font-semibold mb-4">
//             All cases ({filteredApps.length})
//           </h2>

//           {filteredApps.length === 0 ? (
//             <p className="text-gray-500 text-center py-6">
//               No applications found
//             </p>
//           ) : (
//             <div className="overflow-x-auto">

//               <table className="w-full text-sm">

//                 <thead>
//                   <tr className="text-gray-500 border-b text-left">
//                     <th className="py-3">Case</th>
//                     <th>Customer</th>
//                     <th>Vehicle</th>
//                     <th>Amount</th>
//                     <th>Bank</th>
//                     <th>Status</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>

//                 <tbody className="text-gray-700">
//                   {filteredApps.map((app) => {
//                     const name = app.fullName;
//                     const loanType = app.loanType;
//                     const amount = app.loanAmount;
//                     const status = app.status;
//                     const caseNumber = app.caseNumber;
//                     const bank = app.bank;

//                     return (
//                       <tr
//                         key={caseNumber}
//                         className="border-b hover:bg-gray-50 transition"
//                       >
//                         <td className="py-3 text-blue-600 font-medium cursor-pointer">
//                           {caseNumber}
//                         </td>

//                         <td>{name}</td>
//                         <td>{loanType || "—"}</td>

//                         <td>
//                           ₹
//                           {Number(amount || 0).toLocaleString()}
//                         </td>

//                         <td>{bank || "—"}</td>

//                         <td>
//                           <span
//                             className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
//                               status
//                             )}`}
//                           >
//                             {formatStatus(status)}
//                           </span>
//                         </td>

//                         <td>
//                           <div className="flex gap-2 text-xs">

//                             <button
//                               onClick={() =>
//                                 navigate(
//                                   `/bank/review/${caseNumber}`
//                                 )
//                               }
//                               className="px-3 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
//                             >
//                               Review
//                             </button>

//                             {status === "APPROVED" ||
//                             status === "REJECTED" ? (
//                               <span className="text-gray-400">
//                                 Closed
//                               </span>
//                             ) : (
//                               <span className="text-gray-400">
//                                 Awaiting bank
//                               </span>
//                             )}

//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>

//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </AdminLayout>
//   );
// }
// src/pages/bank/Applications.jsx

import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import {
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";

import { useEffect, useState } from "react";
import { getLoans } from "../../services/loanService";

export default function Applications() {
  const { user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const [search, setSearch] = useState(
    () => searchParams.get("q") ?? ""
  );

  const [applications, setApplications] = useState([]);

  const isUnderReviewPage =
    location.pathname.includes("under-review");

  // ✅ SAFE NORMALIZE
  const normalize = (str) =>
    (str || "")
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "")
      .trim();

  // ✅ FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLoans();

        console.log("API DATA:", data);
        console.log("USER:", user);

        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(
          "Error fetching applications:",
          error
        );
      }
    };

    fetchData();
  }, [user]);

  // ✅ SEARCH SYNC
  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  const setSearchQuery = (value) => {
    setSearch(value);

    setSearchParams(
      value.trim() ? { q: value } : {},
      { replace: true }
    );
  };

  // ✅ FILTER APPLICATIONS
  const filteredApps = applications.filter((app) => {

    // ✅ SAFE BANK FIELD
    const loanBank = normalize(
      app.bank ||
      app.bankName ||
      app.assignedBank
    );

    // ✅ DYNAMIC USER BANK
    const userBank = normalize(
      user?.bank ||
      user?.bankName ||
      user?.name
    );

    console.log("Loan Bank:", loanBank);
    console.log("User Bank:", userBank);

    // ✅ FLEXIBLE MATCH
    const isSameBank =
      loanBank.includes(userBank) ||
      userBank.includes(loanBank);

    // ✅ UPDATED STATUS FILTER
    const isValidStatus =
      app.status === "ASSIGNED_TO_BANK" ||
      app.status === "APPROVED" ||
      app.status === "SUBMITTED_TO_BANK" ||
      app.status === "PENDING" ||
      app.status === "BANK_REJECTED" ||
      app.status === "REJECTED_BY_ADMIN";

    const haystack = `
      ${app.fullName || ""}
      ${app.caseNumber || ""}
      ${app.mobile || ""}
      ${app.loanType || ""}
      ${app.bank || ""}
      ${app.loanAmount || ""}
    `.toLowerCase();

    const matchesSearch =
      !search.trim() ||
      haystack.includes(search.toLowerCase());

    return (
      isSameBank &&
      isValidStatus &&
      matchesSearch
    );
  });

  // ✅ STATUS COLOR
  const getStatusStyle = (status) => {
    switch (status) {

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "UNDER_REVIEW":
      case "ASSIGNED_TO_BANK":
      case "SUBMITTED_TO_BANK":
        return "bg-blue-100 text-blue-700";

      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "BANK_REJECTED":
      case "REJECTED_BY_ADMIN":
      case "REJECTED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ✅ FORMAT STATUS
  const formatStatus = (status) => {

    if (
      status === "SUBMITTED_TO_BANK" ||
      status === "ASSIGNED_TO_BANK"
    ) {
      return "UNDER REVIEW";
    }

    if (status === "BANK_REJECTED") {
      return "Rejected By Bank";
    }

    if (status === "REJECTED_BY_ADMIN") {
      return "Rejected By Admin";
    }

    return status?.replaceAll("_", " ");
  };

  return (
    <AdminLayout>
      <div className="p-6">

        {/* HEADER */}
        <h1 className="text-2xl font-semibold text-gray-800">
          {isUnderReviewPage
            ? "Under Review Applications"
            : "Loan Applications"}
        </h1>

        {/* SEARCH */}
        <div className="flex justify-between items-center mt-6 flex-wrap gap-3">

          <input
            type="search"
            placeholder="Search by case number, customer, bank, mobile…"
            value={search}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="px-4 py-2 border rounded-lg text-sm w-full max-w-xs focus:ring-2 focus:ring-blue-500"
          />

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow mt-6 p-4">

          <h2 className="text-lg font-semibold mb-4">
            All cases ({filteredApps.length})
          </h2>

          {filteredApps.length === 0 ? (

            <p className="text-gray-500 text-center py-6">
              No applications found
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>
                  <tr className="text-gray-500 border-b text-left">
                    <th className="py-3">Case</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Amount</th>
                    <th>Bank</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody className="text-gray-700">

                  {filteredApps.map((app) => {

                    const name = app.fullName;
                    const loanType = app.loanType;
                    const amount = app.loanAmount;
                    const status = app.status;
                    const caseNumber = app.caseNumber;
                    const bank =
                      app.bank ||
                      app.bankName ||
                      app.assignedBank;

                    return (
                      <tr
                        key={caseNumber}
                        className="border-b hover:bg-gray-50 transition"
                      >

                        {/* CASE */}
                        <td className="py-3 text-blue-600 font-medium cursor-pointer">
                          {caseNumber}
                        </td>

                        {/* CUSTOMER */}
                        <td>{name}</td>

                        {/* VEHICLE */}
                        <td>{loanType || "—"}</td>

                        {/* AMOUNT */}
                        <td>
                          ₹
                          {Number(
                            amount || 0
                          ).toLocaleString()}
                        </td>

                        {/* BANK */}
                        <td>{bank || "—"}</td>

                        {/* STATUS */}
                        <td>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                              status
                            )}`}
                          >
                            {formatStatus(status)}
                          </span>

                        </td>

                        {/* ACTIONS */}
                        <td>

                          <div className="flex gap-2 text-xs">

                            <button
                              onClick={() =>
                                navigate(
                                  `/bank/review/${caseNumber}`
                                )
                              }
                              className="px-3 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              Review
                            </button>

                            {status === "APPROVED" ? (

                              <span className="text-green-600 font-medium">
                                Approved
                              </span>

                            ) : status === "BANK_REJECTED" ? (

                              <span className="text-red-600 font-medium">
                                Rejected By Bank
                              </span>

                            ) : status === "REJECTED_BY_ADMIN" ? (

                              <span className="text-red-600 font-medium">
                                Rejected By Admin
                              </span>

                            ) : (

                              <span className="text-gray-400">
                                Awaiting bank
                              </span>

                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}