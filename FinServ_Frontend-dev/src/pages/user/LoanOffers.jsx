// src/pages/user/LoanOffers.jsx — view-only comparison (no selection / apply)

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { fetchBanksRaw, mapBanksToOffers } from "../../services/loanOfferService";

export default function LoanOffers() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loanAmount, setLoanAmount] = useState(500000);
  const [tenureMonths, setTenureMonths] = useState(60);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchBanksRaw();
        if (!cancelled) setBanks(data);
      } catch (e) {
        if (!cancelled) {
          setError(
            e?.response?.data?.message ||
              e?.message ||
              "Could not load bank offers."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const offers = useMemo(
    () => mapBanksToOffers(banks, loanAmount, tenureMonths),
    [banks, loanAmount, tenureMonths]
  );

  const amountNum = Number(loanAmount);
  const tenureNum = Number(tenureMonths);
  const inputsValid =
    Number.isFinite(amountNum) &&
    amountNum >= 10000 &&
    Number.isFinite(tenureNum) &&
    tenureNum >= 6;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto w-full px-1 sm:px-2">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Compare Loan Offers
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Indicative rates and EMI for comparison only. To apply for a loan, use{" "}
          <strong>Apply Loan</strong> from the menu.
        </p>

        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <label className="flex flex-col text-sm">
            <span className="text-gray-600 mb-1">Loan amount (₹)</span>
            <input
              type="number"
              min={10000}
              step={5000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 w-44 focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </label>
          <label className="flex flex-col text-sm">
            <span className="text-gray-600 mb-1">Tenure (months)</span>
            <input
              type="number"
              min={6}
              max={360}
              step={6}
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 w-36 focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </label>
          <p className="text-xs text-gray-500 max-w-md pb-1">
            EMI uses the midpoint of each bank&apos;s ROI range. Tenure is capped
            by the bank&apos;s maximum when lower than your selection.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading offers…</div>
        ) : !inputsValid ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Enter a loan amount of at least ₹10,000 and tenure of at least 6
            months.
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No bank offers yet. Ask an admin to add banks under Admin → Banks.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="p-5 rounded-xl shadow-md border border-gray-100 bg-white"
              >
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  {offer.bank}
                </h3>

                <p className="text-sm text-gray-600">
                  Interest rate:{" "}
                  <span className="font-medium text-gray-800">
                    {offer.interest}
                  </span>
                </p>

                <p className="text-sm text-gray-600">
                  EMI:{" "}
                  <span className="font-medium text-gray-800">{offer.emi}</span>
                </p>

                <p className="text-sm text-gray-600">
                  Tenure:{" "}
                  <span className="font-medium text-gray-800">
                    {offer.tenure}
                  </span>
                </p>

                <p className="text-sm text-gray-600">
                  Processing:{" "}
                  <span className="font-medium text-gray-800">
                    {offer.processingFee}
                  </span>
                </p>

                {offer.features?.length > 0 && (
                  <ul className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 list-disc list-inside">
                    {offer.features.slice(0, 5).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
