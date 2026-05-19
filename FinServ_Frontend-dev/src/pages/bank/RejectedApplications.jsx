// import AdminLayout from "../../layouts/AdminLayout";
// import { useNavigate } from "react-router-dom";
// import { useEffect, useState, useMemo } from "react";
// import { getLoans } from "../../services/loanService";
// import { useAuth } from "../../context/AuthContext";
// import { useSearchParams } from "react-router-dom";


// export default function RejectedApplications() {
//   const navigate = useNavigate();

//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
//   const setSearchQuery = (value) => {
//   setSearch(value);
//   setSearchParams(value.trim() ? { q: value } : {}, { replace: true });
// };
//   const normalize = (str) =>
//   (str || "").toLowerCase().replace(/\s+/g, "").trim();
//     // ✅ FETCH FROM DASHBOARD
//     const { user } = useAuth();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const data = await getLoans();
//         setApplications(data || []);
//       } catch (error) {
//         console.error("Error fetching rejected applications:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//     // ✅ FILTER REJECTED + SEARCH
//   const filteredApps = useMemo(() => {
//     return applications.filter((app) => {

//       // ✅ BANK MATCH
//       const loanBank = normalize(app.bank);
//       const userBank = normalize(
//         user?.bankName || user?.name || user?.email?.split("@")[0]
//       );

//       const isSameBank =
//         loanBank.includes(userBank) || userBank.includes(loanBank);

//       // ✅ ONLY REJECTED
//       const status = app?.status;

//       const isRejected =
//         status === "REJECTED" ||
//         status === "REJECTED_BY_ADMIN";

//       // ✅ SEARCH
//       const haystack =
//         `${app.fullName} ${app.caseNumber} ${app.mobile} ${app.loanType} ${app.bank} ${app.loanAmount}`.toLowerCase();

//       const matchesSearch =
//         !search.trim() || haystack.includes(search.toLowerCase());

//       return isSameBank && isRejected && matchesSearch;
//     });
//   }, [applications, search, user]);


//   // ✅ STATUS STYLE
//       const getStatusStyle = (status) => {
//       switch (status) {
//         case "REJECTED":
//         case "REJECTED_BY_ADMIN":
//           return "bg-red-100 text-red-700";
//         default:
//           return "bg-gray-100 text-gray-700";
//       }
//     };

//   return (
//     <AdminLayout>
//       <div className="p-6">

//         {/* HEADER */}
//         <div className="flex justify-between items-center flex-wrap gap-3">
//           <h1 className="text-2xl font-semibold text-gray-800">
//             Rejected Applications
//           </h1>

//           <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
//             {filteredApps.length} Total
//           </span>
//         </div>

//         {/* SEARCH */}
//         <div className="mt-6">
//           <input
//             type="search"
//             placeholder="Search by case number, customer, loan…"
//             value={search}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="px-4 py-2 border rounded-lg text-sm w-full max-w-xs focus:ring-2 focus:ring-red-500"
//           />
//         </div>

//         {/* TABLE */}
//         <div className="bg-white rounded-2xl shadow mt-6 p-4">

//           <h2 className="text-lg font-semibold mb-4">
//             Rejected Cases
//           </h2>

//           {loading ? (
//             <p className="text-gray-500 text-center py-6">
//               Loading applications...
//             </p>
//           ) : filteredApps.length === 0 ? (
//             <p className="text-gray-500 text-center py-6">
//               No rejected applications found
//             </p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">

//                 {/* HEADER */}
//                 <thead>
//                   <tr className="text-gray-500 border-b text-left">
//                     <th className="py-3">Case</th>
//                     <th>Customer</th>
//                     <th>Loan Type</th>
//                     <th>Amount</th>
//                     <th>Status</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>

//                 {/* BODY */}
//                 <tbody className="text-gray-700">
//                   {filteredApps.map((app) => {
//                    const name = app.fullName;
//                     const loanType = app.loanType;
//                     const amount = app.loanAmount;
//                     const caseNumber = app.caseNumber;

//                     return (
//                       <tr
//                         key={caseNumber}
//                         className="border-b hover:bg-gray-50 transition"
//                       >
//                         <td className="py-3 text-red-600 font-medium cursor-pointer">
//                           {caseNumber}
//                         </td>

//                         <td>{name}</td>

//                         <td>{loanType}</td>

//                         <td>₹{Number(amount).toLocaleString()}</td>

//                         <td>
//                           <span
//                             className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(app.status)}`}
//                           >
//                             {app.status?.replaceAll("_", " ")}
//                           </span>
//                         </td>

//                         <td>
//                           <button
//                             onClick={() =>
//                               navigate(`/bank/review/${caseNumber}`)
//                             }
//                             className="px-3 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50"
//                           >
//                             View
//                           </button>
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



import AdminLayout from "../../layouts/AdminLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { getLoans } from "../../services/loanService";
import { useAuth } from "../../context/AuthContext";

export default function RejectedApplications() {

  const navigate = useNavigate();

  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] =
    useSearchParams();

  const [search, setSearch] = useState(
    () => searchParams.get("q") ?? ""
  );

  // ✅ SEARCH QUERY
  const setSearchQuery = (value) => {

    setSearch(value);

    setSearchParams(
      value.trim() ? { q: value } : {},
      { replace: true }
    );
  };

  // ✅ NORMALIZE
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

        console.log("Rejected API DATA:", data);

        setApplications(
          Array.isArray(data) ? data : []
        );

      } catch (error) {

        console.error(
          "Error fetching rejected applications:",
          error
        );

      } finally {

        setLoading(false);
      }
    };

    fetchData();

  }, []);

  // ✅ FILTER DATA
  const filteredApps = useMemo(() => {

    return applications.filter((app) => {

      // ✅ BANK MATCH
      const loanBank = normalize(app.bank);

      const userBank = normalize(
        user?.bankName ||
        user?.name ||
        user?.email?.split("@")[0]
      );

      const isSameBank =
        loanBank.includes(userBank) ||
        userBank.includes(loanBank);

      // ✅ REJECTED STATUS
      const status = app?.status;

      const isRejected =
        status === "BANK_REJECTED" ||
        status === "REJECTED_BY_ADMIN" ||
        status === "REJECTED";

      // ✅ SEARCH
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
        isRejected &&
        matchesSearch
      );
    });

  }, [applications, search, user]);

  // ✅ STATUS STYLE
  const getStatusStyle = (status) => {

    switch (status) {

      case "BANK_REJECTED":
      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "REJECTED_BY_ADMIN":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ✅ FORMAT STATUS
  const formatStatus = (status) => {

    if (status === "BANK_REJECTED") {
      return "Rejected By Bank";
    }

    if (status === "REJECTED_BY_ADMIN") {
      return "Rejected By Admin";
    }

    if (status === "REJECTED") {
      return "Rejected";
    }

    return status?.replaceAll("_", " ");
  };

  return (
    <AdminLayout>

      <div className="p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center flex-wrap gap-3">

          <h1 className="text-2xl font-semibold text-gray-800">
            Rejected Applications
          </h1>

          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
            {filteredApps.length} Total
          </span>

        </div>

        {/* SEARCH */}
        <div className="mt-6">

          <input
            type="search"
            placeholder="Search by case number, customer, loan..."
            value={search}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="px-4 py-2 border rounded-lg text-sm w-full max-w-xs focus:ring-2 focus:ring-red-500"
          />

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow mt-6 p-4">

          <h2 className="text-lg font-semibold mb-4">
            Rejected Cases
          </h2>

          {loading ? (

            <p className="text-gray-500 text-center py-6">
              Loading applications...
            </p>

          ) : filteredApps.length === 0 ? (

            <p className="text-gray-500 text-center py-6">
              No rejected applications found
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                {/* HEADER */}
                <thead>

                  <tr className="text-gray-500 border-b text-left">

                    <th className="py-3">
                      Case
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      Loan Type
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Bank
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                {/* BODY */}
                <tbody className="text-gray-700">

                  {filteredApps.map((app) => {

                    const name = app.fullName;
                    const loanType = app.loanType;
                    const amount = app.loanAmount;
                    const caseNumber = app.caseNumber;
                    const bank = app.bank;

                    return (

                      <tr
                        key={caseNumber}
                        className="border-b hover:bg-gray-50 transition"
                      >

                        {/* CASE */}
                        <td className="py-3 text-red-600 font-medium cursor-pointer">
                          {caseNumber}
                        </td>

                        {/* CUSTOMER */}
                        <td>
                          {name}
                        </td>

                        {/* LOAN */}
                        <td>
                          {loanType || "—"}
                        </td>

                        {/* AMOUNT */}
                        <td>
                          ₹
                          {Number(
                            amount || 0
                          ).toLocaleString()}
                        </td>

                        {/* BANK */}
                        <td>
                          {bank || "—"}
                        </td>

                        {/* STATUS */}
                        <td>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                              app.status
                            )}`}
                          >
                            {formatStatus(app.status)}
                          </span>

                        </td>

                        {/* ACTION */}
                        <td>

                          <button
                            onClick={() =>
                              navigate(
                                `/bank/review/${caseNumber}`
                              )
                            }
                            className="px-3 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50"
                          >
                            View
                          </button>

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