// components/LoanTable.jsx

export default function LoanTable({ data = [] }) {

  // ✅ STATUS COLOR MAP
  const statusStyles = {
    UNDER_REVIEW: "bg-yellow-100 text-yellow-600",
    SUBMITTED_TO_BANK: "bg-yellow-100 text-yellow-600",
    ASSIGNED_TO_BANK: "bg-amber-100 text-amber-800",
    DOCUMENTS_PENDING: "bg-orange-100 text-orange-600",
    APPROVED: "bg-green-100 text-green-600",
    DISBURSED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-600",
    REJECTED_BY_ADMIN: "bg-rose-100 text-rose-700",
    PENDING: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow mt-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Loan Cases</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-3">Case ID</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={item.caseNumber || item.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 text-blue-600 font-medium">
                    {item.caseNumber || `CASE-${item.id}`}
                  </td>

                  <td>{item.fullName}</td>

                  <td>{item.loanType}</td>

                  <td>₹{item.loanAmount}</td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusStyles[item.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {String(item.status || "").replaceAll("_", " ")}
                    </span>
                  </td>

                  <td>{item.submittedAt}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-5 text-gray-400">
                  No loan cases found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}