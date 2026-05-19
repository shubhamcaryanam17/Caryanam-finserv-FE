import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ✅ ICONS
import { BarChart3, TrendingUp, PieChart as PieIcon, Clock } from "lucide-react";

// ✅ SERVICE IMPORT
import { getReportsData } from "../../services/reportService";

// ✅ COLORS
const COLORS = ["#14b8a6", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Reports() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [approvalData, setApprovalData] = useState([]);
  const [disbursementData, setDisbursementData] = useState([]);
  const [bankData, setBankData] = useState([]);
  const [tatData, setTatData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getReportsData(year);
        setApprovalData(data.approvalData);
        setDisbursementData(data.disbursementData);
        setBankData(data.bankData);
        setTatData(data.tatData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">MIS Reports</h1>
            <p className="text-gray-500">
              Performance analytics and insights (API data)
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Year
            <input
              type="number"
              min={2020}
              max={2035}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border rounded-lg px-3 py-1.5 w-28"
            />
          </label>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading report data…</p>
        ) : null}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Approval vs Rejection */}
          <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} />
              <h2 className="font-semibold">
                Approval vs Rejection Ratio
              </h2>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={approvalData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="rejected" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Disbursement */}
          <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} />
              <h2 className="font-semibold">
                Disbursement Volume
              </h2>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={disbursementData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1f2937"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bank Distribution */}
          <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-4">
              <PieIcon size={18} />
              <h2 className="font-semibold">
                Bank-wise Distribution
              </h2>
            </div>

            <div className="flex items-center justify-center">
              <PieChart width={280} height={250}>
                <Pie
                  data={bankData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {bankData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </div>
          </div>

          {/* TAT */}
          <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} />
              <h2 className="font-semibold">
                Average Turnaround Time
              </h2>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tatData} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}