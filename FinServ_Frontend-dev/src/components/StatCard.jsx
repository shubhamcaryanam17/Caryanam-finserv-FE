// components/StatCard.jsx

export default function StatCard({ title, value, icon, color }) {
  
  // ✅ SAFE COLOR MAPPING (Tailwind fix)
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition duration-200 flex justify-between items-center">
      
      {/* LEFT CONTENT */}
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>

      {/* RIGHT ICON */}
      <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
        {icon}
      </div>

    </div>
  );
}