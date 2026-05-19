import AdminLayout from "../../layouts/AdminLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  getLoans,
  adminAssignBank,
  adminRejectCase,
} from "../../services/loanService";
import { getBanks } from "../../services/bankService";

const TERMINAL = new Set([
  "APPROVED",
  "REJECTED",
  "DISBURSED",
  "REJECTED_BY_ADMIN",
]);

const ADMIN_DECISION_STATUSES = new Set([
  "PENDING",
  "UNDER_REVIEW",
  "DOCUMENTS_PENDING",
]);

function canAdminDecide(app) {
  const cn = String(app.caseNumber ?? "").trim();
  if (!cn) return false;
  const st = String(app.status ?? "");
  return ADMIN_DECISION_STATUSES.has(st);
}

export default function LoanCases() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState(null);

  const [banks, setBanks] = useState([]);
  const [assignModal, setAssignModal] = useState(null);
  const [assignBankId, setAssignBankId] = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectRemark, setRejectRemark] = useState("");

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

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await getLoans();
      setApplications(data);
      setFilteredApps(data);
    } catch (err) {
      console.error("Error fetching loans:", err);
      setApplications([]);
      setFilteredApps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const list = await getBanks();
        setBanks(list);
      } catch (e) {
        console.error(e);
      }
    };
    loadBanks();
  }, []);

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  const setSearchQuery = (value) => {
    setSearch(value);
    setSearchParams(value.trim() ? { q: value } : {}, { replace: true });
  };

  useEffect(() => {
    let data = applications;

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((app) =>
        `${app.fullName} ${app.loanType} ${app.caseNumber || app.id} ${app.bank || ""} ${app.mobile || ""} ${app.loanAmount ?? ""}`
          .toLowerCase()
          .includes(q)
      );
    }

    if (statusFilter !== "ALL") {
      data = data.filter((app) => app.status === statusFilter);
    }

    setFilteredApps(data);
  }, [search, statusFilter, applications]);

  const openAssign = (app) => {
    setAssignBankId(
      banks.length ? String(banks[0].id) : ""
    );
    setAssignModal(app);
  };

  const submitAssign = async () => {
    if (!assignModal) return;
    const caseNumber = String(assignModal.caseNumber ?? "").trim();
    if (!caseNumber) {
      toast.error("Missing case number");
      return;
    }
    const bid = Number(assignBankId);
    if (!Number.isFinite(bid) || bid <= 0) {
      toast.error("Select a bank");
      return;
    }
    const key = `${caseNumber}-assign`;
    try {
      setActionKey(key);
      const msg = await adminAssignBank(caseNumber, bid);
      toast.success(typeof msg === "string" ? msg : "Assigned to bank");
      setAssignModal(null);
      await fetchLoans();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Could not assign bank";
      toast.error(msg);
    } finally {
      setActionKey(null);
    }
  };

  const submitReject = async () => {
    if (!rejectModal) return;
    const caseNumber = String(rejectModal.caseNumber ?? "").trim();
    const remark = rejectRemark.trim();
    if (!remark) {
      toast.error("Remark is required");
      return;
    }
    const key = `${caseNumber}-reject`;
    try {
      setActionKey(key);
      const msg = await adminRejectCase(caseNumber, remark);
      toast.success(typeof msg === "string" ? msg : "Case rejected");
      setRejectModal(null);
      setRejectRemark("");
      await fetchLoans();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Could not reject case";
      toast.error(msg);
    } finally {
      setActionKey(null);
    }
  };

  const goDocuments = (caseNumber) => {
    const cn = String(caseNumber ?? "").trim();
    navigate(`/admin/documents?q=${encodeURIComponent(cn)}`);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Loan applications
        </h1>
        <p className="text-gray-500 mt-1">
          Review applications, open documents, then mark eligible (assign bank)
          or not eligible (reject with remark).
        </p>

        <div className="flex flex-wrap gap-3 justify-between items-center mt-6">
          <input
            type="search"
            placeholder="Search by case number, customer, bank, mobile…"
            value={search}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm w-full max-w-xs focus:ring-2 focus:ring-blue-500"
            aria-label="Filter loan cases"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="ALL">All status</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under review</option>
            <option value="DOCUMENTS_PENDING">Documents pending</option>
            <option value="ASSIGNED_TO_BANK">Assigned to bank</option>
            <option value="SUBMITTED_TO_BANK">Submitted to bank (legacy)</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected (bank)</option>
            <option value="REJECTED_BY_ADMIN">Rejected by admin</option>
            <option value="DISBURSED">Disbursed</option>
          </select>

          <button
            type="button"
            onClick={() => navigate("/admin/create-loan")}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700"
          >
            + Create new case
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow mt-6 p-4">
          <h2 className="text-lg font-semibold mb-4">All cases</h2>

          {loading ? (
            <p className="text-gray-500">Loading…</p>
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
                    {/* <th>Admin remark</th> */}
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody className="text-gray-700">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => (
                      <tr
                        key={app.caseNumber || app.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="py-3 text-blue-600 font-medium">
                          {app.caseNumber || `CASE-${app.id}`}
                        </td>
                        <td>{app.fullName}</td>
                        <td>{app.loanType}</td>
                        <td>₹{app.loanAmount}</td>
                        <td>{app.bank || "—"}</td>
                        <td>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              statusStyles[app.status] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {String(app.status || "").replaceAll("_", " ")}
                          </span>
                        </td>
                        {/* <td className="max-w-[200px] truncate text-xs text-gray-600" title={app.adminRemark || ""}>
                          {app.status === "REJECTED_BY_ADMIN" && app.adminRemark
                            ? app.adminRemark
                            : "—"}
                        </td> */}
                        <td className="py-3">
                          <div className="flex flex-wrap gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => goDocuments(app.caseNumber)}
                              className="px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
                            >
                              Documents
                            </button>
                            {canAdminDecide(app) ? (
                              <>
                                <button
                                  type="button"
                                  disabled={
                                    actionKey === `${app.caseNumber}-assign`
                                  }
                                  onClick={() => openAssign(app)}
                                  className="px-2 py-1 rounded border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
                                >
                                  Eligible · assign bank
                                </button>
                                <button
                                  type="button"
                                  disabled={
                                    actionKey === `${app.caseNumber}-reject`
                                  }
                                  onClick={() => {
                                    setRejectRemark("");
                                    setRejectModal(app);
                                  }}
                                  className="px-2 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                                >
                                  Not eligible
                                </button>
                              </>
                            ) : (
                              <span className="text-gray-400">
                                {TERMINAL.has(app.status)
                                  ? "Closed"
                                  : "Awaiting bank"}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {assignModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Assign bank (eligible)
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Case{" "}
                <span className="font-mono text-gray-800">
                  {assignModal.caseNumber}
                </span>{" "}
                → status <strong>ASSIGNED_TO_BANK</strong>
              </p>
              <label className="block mt-4 text-sm font-medium text-gray-700">
                Bank
              </label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={assignBankId}
                onChange={(e) => setAssignBankId(e.target.value)}
              >
                {banks.length === 0 ? (
                  <option value="">No banks — add in Banks</option>
                ) : (
                  banks.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.name}
                    </option>
                  ))
                )}
              </select>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-lg border"
                  onClick={() => setAssignModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  disabled={
                    !banks.length ||
                    actionKey === `${assignModal.caseNumber}-assign`
                  }
                  onClick={submitAssign}
                >
                  {actionKey === `${assignModal.caseNumber}-assign`
                    ? "Saving…"
                    : "Assign"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {rejectModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Reject (not eligible)
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Case{" "}
                <span className="font-mono text-gray-800">
                  {rejectModal.caseNumber}
                </span>{" "}
                → <strong>REJECTED_BY_ADMIN</strong>
              </p>
              <label className="block mt-4 text-sm font-medium text-gray-700">
                Remark <span className="text-red-500">*</span>
              </label>
              <textarea
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm min-h-[100px]"
                placeholder="Reason for rejection…"
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-lg border"
                  onClick={() => {
                    setRejectModal(null);
                    setRejectRemark("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  disabled={
                    actionKey === `${rejectModal.caseNumber}-reject`
                  }
                  onClick={submitReject}
                >
                  {actionKey === `${rejectModal.caseNumber}-reject`
                    ? "Saving…"
                    : "Reject"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
