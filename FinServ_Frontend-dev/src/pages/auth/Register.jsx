import React, { useState, useEffect } from "react";
import { getBanks } from "../../services/bankService"; 
import axios from "axios";
import { API_BASE_URL } from "../../config/apiBase";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaPhone,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();

  const [banks, setBanks] = useState([]);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    role: "",
    bankId: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ FETCH BANKS (SAME AS LOANCASES)
  useEffect(() => {
    const loadBanks = async () => {
      try {
        const list = await getBanks();
        setBanks(list);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load banks");
      }
    };
    loadBanks();
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "mobile") value = value.replace(/\D/g, "").slice(0, 10);

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        fullName: form.name,
        mobileNumber: form.mobile,
        email: form.email,
        password: form.password,
        role: form.role,
        bankId:
          form.role === "BANK_EVALUATE"
            ? Number(form.bankId)
            : null,
      };

      await axios.post(`${API_BASE_URL}/api/user/register`, payload);

      toast.success("Registration Successful ✅");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">

      {/* LEFT */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#0a2540] to-[#081f36] text-white p-16">
        <h1 className="text-4xl font-bold">Create Account</h1>
      </div>

      {/* RIGHT */}
      <div className="w-full md:w-1/2 flex justify-center items-center bg-gradient-to-br from-[#eef2f7] to-[#f9fbfd] p-6">
        <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl border border-gray-100">

          {/* HEADER */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Create Account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Start your journey with us 🚀
            </p>
          </div>

          <div className="w-full h-[1px] bg-gray-200 mb-4"></div>

          {/* ROLE */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 font-medium">
              Select Role
            </label>
            <select
              name="role"
              onChange={handleChange}
              className="w-full mt-1 bg-gray-50 border border-gray-300 focus:border-[#0b2a4a] focus:ring-2 focus:ring-[#0b2a4a]/20 rounded-xl px-3 py-3 outline-none transition"
            >
              <option value="">Choose role</option>
              <option value="USER">User</option>
              <option value="BANK_EVALUATE">Bank</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* INPUTS */}
          <Input icon={<FaUser />} name="name" placeholder="Full Name" onChange={handleChange} />
          <Input icon={<FaPhone />} name="mobile" placeholder="Mobile Number *" onChange={handleChange} />
          <Input icon={<FaEnvelope />} name="email" placeholder="Email Address" onChange={handleChange} />

          {/* BANK */}
          {form.role === "BANK_EVALUATE" && (
            <div className="mt-4">
              <label className="text-sm text-gray-600 font-medium">
                Select Bank
              </label>
              <select
                name="bankId"
                onChange={handleChange}
                className="w-full mt-1 bg-gray-50 border border-gray-300 focus:border-[#0b2a4a] focus:ring-2 focus:ring-[#0b2a4a]/20 rounded-xl px-3 py-3 outline-none transition"
              >
                <option value="">Choose bank</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* PASSWORD */}
          <div className="flex items-center bg-gray-50 border border-gray-300 focus-within:border-[#0b2a4a] focus-within:ring-2 focus-within:ring-[#0b2a4a]/20 rounded-xl px-3 py-3 mt-4 transition">
            <FaLock className="text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create Password *"
              onChange={handleChange}
              className="ml-2 w-full bg-transparent outline-none"
            />
            {showPassword ? (
              <FaEyeSlash
                className="cursor-pointer text-gray-500"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <FaEye
                className="cursor-pointer text-gray-500"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>

          {/* BUTTON */}
          <button
            disabled={!form.role}
            onClick={handleSubmit}
            className={`w-full mt-6 py-3 rounded-xl font-semibold transition
              ${form.role
                ? "bg-gradient-to-r from-[#0b2a4a] to-[#123b6b] text-white hover:scale-[1.02]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"}
            `}
          >
            {loading ? "Creating Account..." : "Create Account →"}
          </button>

          {/* FOOTER */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className="text-[#0b2a4a] font-semibold cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>

        </div>
      </div>
    </div>
  );
};

// ✅ INPUT COMPONENT
const Input = ({ icon, name, placeholder, onChange }) => (
  <div className="mt-4">
    <div className="flex items-center bg-gray-50 border border-gray-300 focus-within:border-[#0b2a4a] focus-within:ring-2 focus-within:ring-[#0b2a4a]/20 rounded-xl px-3 py-3 transition">
      {icon && <span className="text-gray-400">{icon}</span>}
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        onChange={onChange}
        className="ml-2 w-full bg-transparent outline-none text-sm"
      />
    </div>
  </div>
);

export default Register;