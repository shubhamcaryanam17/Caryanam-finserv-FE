// src/pages/user/UserSettings.jsx

import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout"; // ✅ CHANGED

export default function UserSettings() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  const [message, setMessage] = useState("");

  // Load user data
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Handle input
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Save
  const handleSave = () => {
    if (!user.name || !user.email || !user.mobile) {
      setMessage("⚠️ All fields are required");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));
    setMessage("✅ Profile updated successfully!");

    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Settings</h2>

        <div className="bg-white p-6 rounded-2xl shadow max-w-xl space-y-5">

          {/* Message */}
          {message && (
            <div className="text-sm text-center font-medium text-blue-600">
              {message}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-600">Email Address</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="text-sm text-gray-600">Mobile Number</label>
            <input
              type="text"
              name="mobile"
              value={user.mobile}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Button */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}