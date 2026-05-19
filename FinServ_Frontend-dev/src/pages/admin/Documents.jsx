import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { fetchAdminDocumentDashboard } from "../../services/documentService";
import { API_BASE_URL } from "../../config/apiBase";

export default function Documents() {
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminDocumentDashboard();
        setRows(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q != null) setSearch(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        `${r.caseNumber} ${r.customerName}`.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const statusStyles = {
    VERIFIED: "bg-green-100 text-green-600",
    APPROVED: "bg-green-100 text-green-600",
    PENDING: "bg-yellow-100 text-yellow-600",
    IN_REVIEW: "bg-blue-100 text-blue-600",
    REJECTED: "bg-red-100 text-red-600",
    DISAPPROVED: "bg-red-100 text-red-600",
    NEEDS_CORRECTION: "bg-orange-100 text-orange-600",
  };

  // ✅ View handler
  const handleView = (docId) => {
    const url = `${API_BASE_URL}/api/documents/preview/${docId}`;
    window.open(url, "_blank");
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-800">Documents</h1>
        <p className="text-gray-500 mt-1">
          Documents grouped by loan case (from the server).
        </p>

        <div className="flex justify-between items-center mt-6 flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by case number or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <p className="text-gray-500 mt-6">Loading documents…</p>
        ) : null}

        <div className="mt-6 space-y-6">
          {filtered.map((app) => (
            <div key={app.caseNumber} className="bg-white p-5 rounded-2xl shadow">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-blue-600 font-semibold">{app.caseNumber}</h3>
                  <p className="text-sm text-gray-500">{app.customerName}</p>
                </div>

                <div className="text-xs text-gray-500 text-right">
                  <p>
                    {app.documents.length} files · Verified {app.verifiedCount} ·
                    Pending {app.pendingCount} · Rejected {app.rejectedCount}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {app.documents.length > 0 ? (
                  app.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="border rounded-lg p-3 hover:shadow-sm transition"
                    >
                      <p className="font-medium">{doc.name}</p>

                      <p
                        className="text-xs text-gray-400 truncate"
                        title={doc.fileName}
                      >
                        {doc.fileName}
                      </p>

                      <p className="text-xs text-gray-400">
                        {doc.uploadDate || "—"}
                      </p>

                      <span
                        className={`mt-2 inline-block px-2 py-1 text-xs rounded-full ${
                          statusStyles[doc.status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {String(doc.status || "").replaceAll("_", " ")}
                      </span>

                      {/* ✅ VIEW BUTTON ADDED */}
                      <button
                        onClick={() => handleView(doc.id)}
                        className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5 rounded-lg"
                      >
                        View
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No documents uploaded</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {!loading && filtered.length === 0 ? (
          <p className="text-center text-gray-400 mt-6">No cases found</p>
        ) : null}
      </div>
    </AdminLayout>
  );
}