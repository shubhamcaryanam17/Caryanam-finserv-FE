import AdminLayout from "../../layouts/AdminLayout";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/apiBase";

export default function BankReview() {
  const { id } = useParams();

  const [loan, setLoan] = useState(null);
  const [documents, setDocuments] = useState([]);

  // ✅ FETCH DATA
  const fetchData = async () => {
    try {
      // 🔹 GET ALL LOANS
      const loanRes = await axios.get(
        `${API_BASE_URL}/api/loans/dashboard`
      );

      const selectedLoan = loanRes.data.find(
        (l) => l.id === Number(id)
      );

      setLoan(selectedLoan);

      // 🔹 GET DOCUMENTS
      const docRes = await axios.post(
        `${API_BASE_URL}/api/documents/loan`,
        { id: Number(id) }
      );

      setDocuments(docRes.data || []);

    } catch (err) {
      console.error("Error fetching review data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // 🔥 PREVIEW URL
  const getPreviewUrl = (doc) => {
    if (!doc?.fileName) return null;
    return `${API_BASE_URL}/uploads/${doc.fileName}`;
  };

  return (
    <AdminLayout>
      <div className="p-4">

        {/* HEADER */}
        <h2 className="text-2xl font-semibold mb-6">
          Loan Review
        </h2>

        {/* LOAN DETAILS */}
        {loan ? (
          <div className="bg-white shadow rounded-xl p-5 mb-6">

            <h3 className="text-lg font-semibold mb-4">
              Applicant Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <p><b>Name:</b> {loan.fullName}</p>
              <p><b>Status:</b> {loan.status}</p>
              <p><b>Loan Amount:</b> ₹{loan.loanAmount}</p>
              <p><b>Tenure:</b> {loan.tenure} Months</p>

            </div>

          </div>
        ) : (
          <p className="text-gray-500">Loading loan details...</p>
        )}

        {/* DOCUMENTS */}
        <div className="bg-white shadow rounded-xl p-5">

          <h3 className="text-lg font-semibold mb-4">
            Uploaded Documents
          </h3>

          {documents.length === 0 ? (
            <p className="text-gray-500">
              No documents uploaded
            </p>
          ) : (
            <table className="w-full text-left">

              <thead className="bg-gray-100 text-sm">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">File</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-t">

                    <td className="p-3">
                      {doc.documentType}
                    </td>

                    <td className="p-3">
                      <a
                        href={getPreviewUrl(doc)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        {doc.fileName}
                      </a>
                    </td>

                    <td className="p-3">
                      {doc.status}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          )}

        </div>

      </div>
    </AdminLayout>
  );
}