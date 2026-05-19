import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { toast } from "react-toastify";
import API from "../../api/api";
import { getBanks } from "../../services/bankService";
import { createLoan } from "../../services/loanService";

const LOAN_TYPES = [
  { value: "AUTO_NEW_CAR", label: "Auto — new car" },
  { value: "AUTO_USED_CAR", label: "Auto — used car" },
];

const MAX_LOAN = 10_00_00_000; // matches backend

function isCustomerRole(role) {
  const r = String(role ?? "").toUpperCase();
  return r === "USER";
}

export default function CreateLoanCase() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");

  const [form, setForm] = useState({
    userId: "",
    bankId: "",
    loanType: "AUTO_NEW_CAR",
    loanAmount: "",
    downPayment: "",
    tenure: "60",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingMeta(true);
        const [usersRes, bankList] = await Promise.all([
          API.get("/getAllUser"),
          getBanks(),
        ]);
        const raw = Array.isArray(usersRes.data) ? usersRes.data : [];
        const customers = raw
          .filter((row) => isCustomerRole(row.role))
          .map((row) => ({
            id: row.userId,
            fullName: row.fullName || "—",
            email: row.email || "",
            label: `${row.fullName || "User"} · ${row.email || row.userId}`,
          }));
        setUsers(customers);
        setBanks(
          bankList.map((b) => ({
            id: b.id,
            label: b.name || `Bank ${b.id}`,
          }))
        );
      } catch (e) {
        console.error(e);
        toast.error(
          e?.response?.data?.message ||
            "Could not load customers or banks. Check API and login."
        );
      } finally {
        setLoadingMeta(false);
      }
    };
    load();
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        String(u.id).includes(q)
    );
  }, [users, customerQuery]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, _form: undefined }));
  };

  const validate = () => {
    const next = {};
    const userId = Number(form.userId);
    const bankId = Number(form.bankId);
    const loanAmount = Number(form.loanAmount);
    const downPayment = Number(form.downPayment);
    const tenure = Number(form.tenure);

    if (!userId || userId <= 0) next.userId = "Select a customer.";
    if (!bankId || bankId <= 0) next.bankId = "Select a partner bank.";

    if (!loanAmount || loanAmount <= 0) {
      next.loanAmount = "Enter a loan amount greater than zero.";
    } else if (loanAmount > MAX_LOAN) {
      next.loanAmount = `Amount cannot exceed ₹${MAX_LOAN.toLocaleString("en-IN")}.`;
    }

    if (downPayment === "" || Number.isNaN(downPayment)) {
      next.downPayment = "Enter down payment.";
    } else if (downPayment <= 0) {
      next.downPayment = "Down payment must be greater than zero.";
    } else if (loanAmount > 0 && downPayment >= loanAmount) {
      next.downPayment = "Down payment must be less than the loan amount.";
    }

    if (!tenure || tenure < 6 || tenure > 360 || tenure % 6 !== 0) {
      next.tenure = "Tenure must be 6–360 months, in steps of 6.";
    }

    if (!form.loanType || !/^[A-Z_]+$/.test(form.loanType)) {
      next.loanType = "Pick a valid loan type.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Fix the highlighted fields.");
      return;
    }

    const userId = Number(form.userId);
    const bankId = Number(form.bankId);
    const loanAmount = Number(form.loanAmount);
    const downPayment = Number(form.downPayment);
    const tenure = Number(form.tenure);

    try {
      setSubmitting(true);
      const data = await createLoan({
        loanType: form.loanType,
        loanAmount,
        downPayment,
        tenure,
        userId,
        bankId,
      });

      const caseNo = data?.caseNumber;
      toast.success(
        caseNo
          ? `Loan created · Case ${caseNo}`
          : "Loan case created successfully."
      );
      setForm({
        userId: "",
        bankId: "",
        loanType: "AUTO_NEW_CAR",
        loanAmount: "",
        downPayment: "",
        tenure: "60",
      });
      setCustomerQuery("");
      setErrors({});
      if (caseNo) {
        navigate(`/admin/loan-cases?q=${encodeURIComponent(caseNo)}`);
      } else {
        navigate("/admin/loan-cases");
      }
    } catch (err) {
      console.error(err);
      const body = err?.response?.data;
      const msg =
        body?.message ||
        (typeof body === "string" ? body : null) ||
        err.message ||
        "Could not create loan";
      toast.error(typeof msg === "string" ? msg : "Could not create loan");
    } finally {
      setSubmitting(false);
    }
  };

  const financed =
    form.loanAmount && form.downPayment
      ? Number(form.loanAmount) - Number(form.downPayment)
      : null;
  const ltvOk =
    financed != null &&
    !Number.isNaN(financed) &&
    Number(form.loanAmount) > 0 &&
    financed > 0;

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold text-gray-900">
          Create loan case
        </h1>
        <p className="text-gray-500 mt-1 mb-8">
          Opens a new application for an existing customer (role: user). After
          creation, review documents on{" "}
          <span className="font-medium text-gray-700">Applications</span> and
          assign to a bank or reject.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-2xl shadow border border-gray-100 space-y-8"
        >
          {loadingMeta ? (
            <p className="text-gray-500 text-sm">Loading customers and banks…</p>
          ) : null}

          {!loadingMeta && users.length === 0 ? (
            <div className="rounded-lg bg-amber-50 text-amber-900 text-sm px-4 py-3 border border-amber-100">
              No customers found. Register users with role{" "}
              <strong>USER</strong> first.
            </div>
          ) : null}

          {!loadingMeta && banks.length === 0 ? (
            <div className="rounded-lg bg-amber-50 text-amber-900 text-sm px-4 py-3 border border-amber-100">
              No banks found. Add banks under{" "}
              <strong>Banks</strong> before creating a case.
            </div>
          ) : null}

          <section>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Customer
            </h2>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="customer-search"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Search customer
                </label>
                <input
                  id="customer-search"
                  type="search"
                  placeholder="Name, email, or user ID…"
                  disabled={loadingMeta}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={customerQuery}
                  onChange={(e) => setCustomerQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Customer <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  disabled={loadingMeta || users.length === 0}
                  className={`w-full border rounded-lg p-2.5 text-sm ${
                    errors.userId ? "border-red-400" : "border-gray-200"
                  }`}
                  value={form.userId}
                  onChange={(e) => setField("userId", e.target.value)}
                >
                  <option value="">Select customer</option>
                  {filteredCustomers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
                </select>
                {errors.userId ? (
                  <p className="text-red-600 text-xs mt-1">{errors.userId}</p>
                ) : null}
                {customerQuery && filteredCustomers.length === 0 ? (
                  <p className="text-gray-500 text-xs mt-1">No matches.</p>
                ) : null}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Bank & product
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Partner bank <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  disabled={loadingMeta || banks.length === 0}
                  className={`w-full border rounded-lg p-2.5 text-sm ${
                    errors.bankId ? "border-red-400" : "border-gray-200"
                  }`}
                  value={form.bankId}
                  onChange={(e) => setField("bankId", e.target.value)}
                >
                  <option value="">Select bank</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
                {errors.bankId ? (
                  <p className="text-red-600 text-xs mt-1">{errors.bankId}</p>
                ) : null}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Loan type
                </label>
                <select
                  className={`w-full border rounded-lg p-2.5 text-sm ${
                    errors.loanType ? "border-red-400" : "border-gray-200"
                  }`}
                  value={form.loanType}
                  onChange={(e) => setField("loanType", e.target.value)}
                >
                  {LOAN_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {errors.loanType ? (
                  <p className="text-red-600 text-xs mt-1">{errors.loanType}</p>
                ) : null}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Amounts & tenure
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Backend rules: loan amount ≤ ₹10,00,00,000; down payment &gt; 0 and
              &lt; loan amount; tenure in multiples of 6 (6–360).
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Loan amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max={MAX_LOAN}
                  step="1"
                  placeholder="e.g. 800000"
                  className={`w-full border rounded-lg p-2.5 text-sm ${
                    errors.loanAmount ? "border-red-400" : "border-gray-200"
                  }`}
                  value={form.loanAmount}
                  onChange={(e) => setField("loanAmount", e.target.value)}
                />
                {errors.loanAmount ? (
                  <p className="text-red-600 text-xs mt-1">{errors.loanAmount}</p>
                ) : null}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Down payment (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 200000"
                  className={`w-full border rounded-lg p-2.5 text-sm ${
                    errors.downPayment ? "border-red-400" : "border-gray-200"
                  }`}
                  value={form.downPayment}
                  onChange={(e) => setField("downPayment", e.target.value)}
                />
                {errors.downPayment ? (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.downPayment}
                  </p>
                ) : null}
              </div>
            </div>

            {ltvOk ? (
              <p className="text-sm text-gray-600 mt-3">
                Financed amount:{" "}
                <span className="font-medium text-gray-900">
                  ₹{financed.toLocaleString("en-IN")}
                </span>
                {" · "}
                LTV (financed / loan):{" "}
                <span className="font-medium text-gray-900">
                  {((financed / Number(form.loanAmount)) * 100).toFixed(1)}%
                </span>
              </p>
            ) : null}

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Tenure (months) <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[36, 48, 60, 72, 84].map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={loadingMeta}
                    onClick={() => setField("tenure", String(m))}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                      Number(form.tenure) === m
                        ? "bg-blue-900 text-white border-blue-900"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {m} mo
                  </button>
                ))}
              </div>
              <input
                required
                type="number"
                min="6"
                max="360"
                step="6"
                className={`w-full border rounded-lg p-2.5 text-sm max-w-xs ${
                  errors.tenure ? "border-red-400" : "border-gray-200"
                }`}
                value={form.tenure}
                onChange={(e) => setField("tenure", e.target.value)}
              />
              {errors.tenure ? (
                <p className="text-red-600 text-xs mt-1">{errors.tenure}</p>
              ) : null}
            </div>
          </section>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || loadingMeta || !users.length || !banks.length}
              className="bg-blue-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating…" : "Create loan case"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/loan-cases")}
              className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
