import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "../../layouts/AdminLayout";
import API from "../../api/api";
import { getStoredUserId } from "../../services/userLoanApi";
// import { applyLoan } from "../../services/applyLoanService";
import { createLoanViaApi } from "../../services/userLoanApi";
import { saveUserProfileApi } from "../../services/userLoanApi";
import {
  syncUserProfileFromDashboard,
  mergeFormMobileIntoStoredUser,
} from "../../services/userLoanApi";

export default function ApplyLoan() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loanId, setLoanId] = useState(null);
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  const userId = getStoredUserId();

    useEffect(() => {
      if (!userId) {
        toast.error("User not found. Please login again.");
        navigate("/login");
      }
    }, [userId, navigate]);
  
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    mobile: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    pan: "",
    aadhaar: "",

    
    employmentType: "",
    income: "",           
    company: "",
    experience: "",

    businessName: "",     
    businessType: "",     
    annualIncome: "",     

    // LOAN
    vehicleType: "",
    carMake: "",
    carModel: "",
    variant: "",
    dealerName: "",
    dealerLocation: "",
    exShowroomPrice: "",
    onRoadPrice: "",
    downPayment: "",
    loanAmount: "",
    tenure: "",
    });

    useEffect(() => {
    async function loadUserData() {
      try {
        const res = await API.get("/users/dashboard");

        console.log("FULL RESPONSE:", res);
        console.log("DATA:", res.data);

        const users = Array.isArray(res.data) ? res.data : res.data?.data || [];

        const loggedUser = JSON.parse(localStorage.getItem("user"));
        const email = loggedUser?.email;

        if (!email) {
          console.error("No email found in localStorage");
          return;
        }

        const currentUser = users.find(
          (u) =>
            u.email &&
            u.email.toLowerCase() === email.toLowerCase()
        );

        console.log("MATCHED USER:", currentUser);

        if (currentUser) {
          setForm((prev) => ({
            ...prev,
            fullName: currentUser.fullName || currentUser.name || "User",
            mobile: currentUser.mobileNumber || currentUser.mobile || "",
            email: currentUser.email || "",
          }));
        } else {
          console.warn("User not found in dashboard API");
        }

      } catch (err) {
        console.error("User fetch error:", err);
      }
    }

    loadUserData();
  }, []);

  const [documents, setDocuments] = useState({});
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1);

  const handleChange = (e) => {
    let value = e.target.value;
    const name = e.target.name;

    // 🔹 VALIDATIONS
    if (name === "mobile") {
    value = value.replace(/\D/g, "").slice(0, 10);
    }
    if (name === "aadhaar") {
    value = value.replace(/\D/g, "").slice(0, 12);
    }
    if (name === "pan") {
    value = value.toUpperCase().slice(0, 10);
    }

  
    if (name === "employmentType") {


    if (value === "Salaried") {
      setForm(prev => ({
        ...prev,
        employmentType: value,

        // clear self-employed fields
        businessName: "",
        businessType: "",
        annualIncome: ""
      }));
      return;
    }

    if (value === "Self-Employed") {
      setForm(prev => ({
        ...prev,
        employmentType: value,

        // clear salaried fields
        company: "",
        experience: "",
        income: ""
      }));
      return;
    }


    }

    setForm(prev => ({
    ...prev,
    [name]: value
    }));
    };



  const handleFileChange = (e) => {
    setDocuments({ ...documents, [e.target.name]: e.target.files[0] });
  };
  

  // ✅ VALIDATION
  const validate = () => {
    let newErrors = {};

    if (!form.fullName) newErrors.fullName = "Full Name is required";
    if (!form.mobile) newErrors.mobile = "Mobile is required";
    if (!form.loanAmount) newErrors.loanAmount = "Loan Amount is required";
    if (!form.downPayment) newErrors.downPayment = "Down payment is required";
    if (!form.tenure) newErrors.tenure = "Tenure is required (6–360, steps of 6)";
    if (!form.vehicleType) newErrors.vehicleType = "Select vehicle type";
    if (!form.carMake) newErrors.carMake = "Car make required";
    if (!form.carModel) newErrors.carModel = "Model required";
    if (!form.exShowroomPrice) newErrors.exShowroomPrice = "Price required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadSingleDocument = async (loanId, type, file) => {
    const formData = new FormData();
    formData.append("loanId", loanId);
    formData.append("type", type);
    formData.append("file", file);
    return API.post("/documents/upload", formData);
  };
      const handleSubmit = async (e) => {
      e.preventDefault();

      // ✅ IMPORTANT: loan must already exist
      if (!loanId) {
        toast.error("Loan not created yet");
        return;
      }

      try {
        setSubmitting(true);

        const uploadSafe = async (type, file) => {
          try {
            await uploadSingleDocument(loanId, type, file);
          } catch (error) {
            console.error(`${type} upload failed`, error);
          }
        };

        const uploadPromises = [];

        if (documents?.aadhaarDoc) {
          uploadPromises.push(uploadSafe("AADHAAR", documents.aadhaarDoc));
        }

        if (documents?.panDoc) {
          uploadPromises.push(uploadSafe("PAN", documents.panDoc));
        }

        if (documents?.salarySlips) {
          uploadPromises.push(uploadSafe("SALARY_SLIP", documents.salarySlips));
        }

        if (documents?.bankStatements) {
          uploadPromises.push(uploadSafe("BANK_STATEMENT", documents.bankStatements));
        }

        await Promise.all(uploadPromises);

        mergeFormMobileIntoStoredUser(form.mobile);
        await syncUserProfileFromDashboard();

        toast.success("Application completed");

        navigate("/user/dashboard", { replace: true });

      } catch (err) {
        console.error(err);
        toast.error("Upload failed");
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <AdminLayout>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">

        {/* Top Row */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Case Number</p>
            <p className="text-teal-600 font-semibold">
              AUTO-2024-3446
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">Step {step} of 4</p>
            <p className="font-semibold">
              {["Customer Info", "Loan Details", "Vehicle Details", "Documents"][step - 1]}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
          <div
            className="bg-teal-600 h-2 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        {/* Steps */}
        <div className="flex justify-between text-center text-sm">
          {["Customer Info", "Loan Details", "Vehicle Details", "Documents"].map((label, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full 
                ${step === i + 1 ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {i + 1}
              </div>
              <span className="mt-2 text-xs">{label}</span>
            </div>
          ))}
        </div>

      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">

        {/* CUSTOMER INFO WITH TABS */}
    {step === 1 && (
      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-xl font-semibold">Customer Information</h2>
        <p className="text-gray-500 mb-4">
          Enter customer's personal and employment details
        </p>

        {/* TABS */}
        <div className="flex bg-gray-100 rounded-xl mb-6">
          {["Personal Details", "Employment", "Address"].map((tab, i) => (
            <button
              key={i}
              onClick={() => setSubStep(i + 1)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all 
                  ${subStep === i + 1 
                    ? "bg-white shadow text-teal-700 font-semibold" 
                    : "text-gray-500 hover:text-black"}`}
            >
              {tab}
            </button>
          ))}
        </div>

    {/* TAB 1: PERSONAL */}
        {subStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              label="Full Name"
              name="fullName"
              value={form.fullName}
              readOnly
            />
            <div>
              <label className="text-sm text-gray-600">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob || ""}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <Input label="PAN Number" name="pan" value={form.pan} onChange={handleChange} />
            <Input label="Aadhaar Number" name="aadhaar" value={form.aadhaar} onChange={handleChange} maxLength={12} />

            <Input
              label="Mobile Number"
              type="tel"
              name="mobile"
              value={form.mobile}
              readOnly
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              readOnly
              />

          </div>
        )}

        {/* TAB 2: EMPLOYMENT */}
        {subStep === 2 && (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


          {/* Employment Type */}
          <Select
            label="Employment Type"
            name="employmentType"
            value={form.employmentType}
            options={["Salaried", "Self-Employed"]}
            onChange={handleChange}
          />

          {/* ================= SALARIED ================= */}
          {form.employmentType === "Salaried" && (
            <>
              <Input
                label="Monthly Salary"
                type="number"
                name="income"
                value={form.income}
                onChange={handleChange}
              />

              <Input
                label="Company Name"
                name="company"
                value={form.company || ""}
                onChange={handleChange}
              />

              <Input
                label="Work Experience (Years)"
                type="number"
                name="experience"
                value={form.experience || ""}
                onChange={handleChange}
              />
            </>
          )}

          {/* ================= SELF EMPLOYED ================= */}
          {form.employmentType === "Self-Employed" && (
            <>
              <Input
                label="Business Name"
                name="businessName"
                value={form.businessName || ""}
                onChange={handleChange}
              />

              <Input
                label="Business Type"
                name="businessType"
                value={form.businessType || ""}
                onChange={handleChange}
              />

              <Input
                label="Annual Income"
                type="number"
                name="annualIncome"
                value={form.annualIncome || ""}
                onChange={handleChange}
              />
            </>
          )}


            </div>
          )}

        {/* TAB 3: ADDRESS */}
        {subStep === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input label="Address Line 1" name="address1" value={form.address1 || ""} onChange={handleChange} />
            <Input label="Address Line 2" name="address2" value={form.address2 || ""} onChange={handleChange} />

            <Input label="City" name="city" value={form.city || ""} onChange={handleChange} />
            <Select
              label="State"
              name="state"
              value={form.state}
              options={["MAHARASHTRA", "DELHI", "KARNATAKA"]}
              onChange={handleChange}
              />

            <Input label="PIN Code" name="pincode" value={form.pincode || ""} onChange={handleChange} />

          </div>
        )}

      </div>
    )}


        {/* LOAN DETAILS */}
        {step === 2 && (
        <div className="bg-white rounded-2xl shadow p-6">
          
          <h2 className="text-xl font-semibold mb-1">Loan Details</h2>
          <p className="text-gray-500 mb-6">Enter the basic loan information</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Loan Type */}
            <div>
              <label className="text-sm text-gray-600">Loan Type</label>
              <select
                name="vehicleType"
                value={form.vehicleType}
                onChange={handleChange}
                className="w-full mt-2 p-3 border rounded-xl focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select</option>
                <option value="AUTO_NEW_CAR">Auto Loan - New Car</option>

{/* <option value="AUTO_REFINANCE">Auto Loan - Refinance</option> */}

                <option value="AUTO_USED_CAR">Auto Loan - Used Car</option>
              </select>
            </div>

            {/* Requested Amount */}
            <div>
              <label className="text-sm text-gray-600">Requested Amount</label>
              <input
                type="number"
                name="loanAmount"
                value={form.loanAmount}
                onChange={handleChange}
                placeholder="₹ 10,00,000"
                className="w-full mt-2 p-3 border rounded-xl"
              />
            </div>

            {/* Tenure */}
            <div>
              <label className="text-sm text-gray-600">Tenure (Months)</label>
              <select
                name="tenure"
                value={form.tenure}
                onChange={handleChange}
                className="w-full mt-2 p-3 border rounded-xl"
              >
                <option value="">Select</option>
                {[12, 24, 36, 48, 60, 72].map((t) => (
                  <option key={t} value={t}>{t} Months</option>
                ))}
              </select>
            </div>

            {/* Down Payment */}
            <div>
              <label className="text-sm text-gray-600">Down Payment</label>
              <input
                type="number"
                name="downPayment"
                value={form.downPayment}
                onChange={handleChange}
                placeholder="₹ 2,00,000"
                className="w-full mt-2 p-3 border rounded-xl"
              />
            </div>

          </div>
            
        </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl shadow p-6 space-y-6">

            <div>
              <h2 className="text-xl font-semibold">Vehicle Details</h2>
              <p className="text-gray-500">
                Enter the vehicle and dealer information
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Car Make */}
              <Select
                label="Car Make"
                name="carMake"
                value={form.carMake}
                options={["Maruti", "Hyundai", "Tata", "Honda", "Mahindra"]}
                onChange={handleChange}
              />

              {/* Model */}
              <Input
                label="Model"
                name="carModel"
                value={form.carModel}
                onChange={handleChange}
                placeholder="Select model"
              />

              {/* Variant */}
              <Input
                label="Variant"
                name="variant"
                value={form.variant}
                onChange={handleChange}
                placeholder="e.g., ZXi+ Petrol AT"
              />

              {/* Dealer Name */}
              <Input
                label="Dealer Name"
                name="dealerName"
                value={form.dealerName}
                onChange={handleChange}
                placeholder="Premium Auto Dealers"
              />

              {/* Dealer Location */}
              <Input
                label="Dealer Location"
                name="dealerLocation"
                value={form.dealerLocation}
                onChange={handleChange}
                placeholder="Andheri West, Mumbai"
              />

              {/* Ex-Showroom Price */}
              <Input
                label="Ex-Showroom Price"
                name="exShowroomPrice"
                value={form.exShowroomPrice}
                onChange={handleChange}
                placeholder="₹ 12,50,000"
              />

              {/* On Road Price */}
              <Input
                label="On-Road Price"
                name="onRoadPrice"
                value={form.onRoadPrice}
                onChange={handleChange}
                placeholder="₹ 14,75,000"
              />

            </div>

            {/* LTV Section */}
            <div className="bg-gray-50 rounded-xl p-4 border">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600">
                  Loan-to-Value (LTV) Ratio
                </p>
                <p className="text-green-600 font-semibold">
                  Recommended ≤ 90%
                </p>
              </div>

              <h3 className="text-2xl font-bold text-gray-800">85%</h3>

              <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                <div className="bg-teal-600 h-2 rounded-full w-[85%]"></div>
              </div>
            </div>

          </div>
        )}


        {/* DOCUMENTS */}
        {step === 4 && (
        <div>
            <h3 className="font-semibold mb-3 text-lg text-gray-800">
              Upload Documents
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Aadhaar */}
              <div className="border rounded-xl p-4 bg-white shadow-sm">
                <FileInput label="Aadhaar Card" name="aadhaarDoc" onChange={handleFileChange} />

                {documents?.aadhaarDoc && (
                  <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <span className="text-xs truncate w-[65%]">
                      {documents.aadhaarDoc.name}
                    </span>

                    <div className="flex gap-2">
                      {/* View */}
                      <button
                        type="button"
                        onClick={() =>
                          window.open(URL.createObjectURL(documents.aadhaarDoc), "_blank")
                        }
                        className="text-blue-500 text-xs"
                      >
                        View
                      </button>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() =>
                          setDocuments((prev) => ({ ...prev, aadhaarDoc: null }))
                        }
                        className="text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* PAN */}
              <div className="border rounded-xl p-4 bg-white shadow-sm">
                <FileInput label="PAN Card" name="panDoc" onChange={handleFileChange} />

                {documents?.panDoc && (
                  <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <span className="text-xs truncate w-[65%]">
                      {documents.panDoc.name}
                    </span>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          window.open(URL.createObjectURL(documents.panDoc), "_blank")
                        }
                        className="text-blue-500 text-xs"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDocuments((prev) => ({ ...prev, panDoc: null }))
                        }
                        className="text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Salary Slips */}
              <div className="border rounded-xl p-4 bg-white shadow-sm">
                <FileInput label="Salary Slips" name="salarySlips" onChange={handleFileChange} />

                {documents?.salarySlips && (
                  <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <span className="text-xs truncate w-[65%]">
                      {documents.salarySlips.name}
                    </span>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          window.open(URL.createObjectURL(documents.salarySlips), "_blank")
                        }
                        className="text-blue-500 text-xs"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDocuments((prev) => ({ ...prev, salarySlips: null }))
                        }
                        className="text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bank Statements */}
              <div className="border rounded-xl p-4 bg-white shadow-sm">
                <FileInput label="Bank Statements" name="bankStatements" onChange={handleFileChange} />

                {documents?.bankStatements && (
                  <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <span className="text-xs truncate w-[65%]">
                      {documents.bankStatements.name}
                    </span>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          window.open(URL.createObjectURL(documents.bankStatements), "_blank")
                        }
                        className="text-blue-500 text-xs"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDocuments((prev) => ({ ...prev, bankStatements: null }))
                        }
                        className="text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
          )}

        {/* <div className="flex justify-between mt-6">

  {step > 1 && (
    <button
      type="button"
      onClick={() => setStep(step - 1)}
      className="px-6 py-2 border rounded-xl"
    >
      ← Previous
    </button>
  )}

  {step < 4 ? (
    <button
      type="button"
      onClick={async () => {

          // STEP 1
          if (step === 1) {
              if (subStep < 3) {
              setSubStep(subStep + 1);
              return;
              }

             if (!form.fullName || !form.mobile) {
            toast.error("Fill required fields");
            return;
            }

            
            if (!form.employmentType) {
            toast.error("Select employment type");
            return;
            }

            if (form.employmentType === "Salaried" && !form.company) {
            toast.error("Enter company name");
            return;
            }

            if (form.employmentType === "Self-Employed" && !form.businessName) {
            toast.error("Enter business name");
            return;
            }

            if (form.employmentType === "Salaried" && !form.income) {
            toast.error("Enter monthly salary");
            return;
            }

            if (form.employmentType === "Self-Employed" && !form.annualIncome) {
            toast.error("Enter annual income");
            return;
            }

            if (!form.dob) {
              toast.error("Select date of birth");
              return;
            }
            if (!form.pan) {
            toast.error("Enter PAN number");
            return;
            }

            if (!form.aadhaar) {
            toast.error("Enter Aadhaar number");
            return;
            }
            if (form.aadhaar.length !== 12) {
            toast.error("Aadhaar must be 12 digits");
            return;
            }
            if (!panRegex.test(form.pan)) {
            toast.error("Invalid PAN format (ABCDE1234F)");
            return;
            }


              try {
              // ✅ SAVE PROFILE DATA FIRST
              await saveUserProfileApi({
              userId: getStoredUserId(),

              
                // PERSONAL
                fullName: form.fullName,
                dateOfBirth: form.dob,

                panNumber: form.pan,
                aadhaarNumber: form.aadhaar,
                mobileNumber: form.mobile,
                email: form.email,

                // EMPLOYMENT
                employmentType:
                form.employmentType === "Self-Employed"
                ? "SELF_EMPLOYED"
                : "SALARIED",

                // SALARIED
                companyName: form.employmentType === "Salaried" ? form.company : null,
                workExperience: form.employmentType === "Salaried" ? Number(form.experience) : null,
                monthlySalary: form.employmentType === "Salaried" ? Number(form.income) : null,

                // SELF EMPLOYED
                businessName: form.employmentType === "Self-Employed" ? form.businessName : null,
                businessType: form.employmentType === "Self-Employed" ? form.businessType : null,
                annualIncome: form.employmentType === "Self-Employed" ? Number(form.annualIncome) : null,

                // ADDRESS
                addressLine1: form.address1,
                addressLine2: form.address2,
                city: form.city,
                state: form.state ? form.state.toUpperCase() : null,
                pincode: form.pincode
              });

              toast.success("Profile saved successfully");

              // ✅ MOVE TO NEXT STEP
              setStep(2);
              

              } catch (err) {
              console.error("Profile API Error:", err);
              toast.error("Profile save failed");
              }

              return;
              }


          // STEP 2 → CREATE LOAN
          if (step === 2) {

          const loanAmount = parseFloat(form.loanAmount);
          const downPayment = parseFloat(form.downPayment);
          const tenure = parseInt(form.tenure, 10);

          // ✅ VALIDATIONS
          if (!form.vehicleType) {
          toast.error("Select loan type");
          return;
          }

          if (!loanAmount || loanAmount <= 0) {
          toast.error("Enter valid loan amount");
          return;
          }

          if (!downPayment || downPayment <= 0) {
          toast.error("Enter valid down payment");
          return;
          }

          if (downPayment >= loanAmount) {
          toast.error("Down payment must be less than loan amount");
          return;
          }

          if (!tenure || tenure < 6) {
          toast.error("Select valid tenure");
          return;
          }

          if (tenure % 6 !== 0) {
          toast.error("Tenure must be multiple of 6");
          return;
          }

          try {
          // ✅ ONLY LOAN DATA
          const payload = {
          userId: getStoredUserId(),
          loanType: form.vehicleType,
          loanAmount: Number(form.loanAmount) || 0,
          downPayment: Number(form.downPayment) || 0,
          tenure: Number(form.tenure) || 0,
          };


          console.log("🔥 LOAN PAYLOAD:", payload);

          const res = await createLoanViaApi(payload);

          console.log("Loan API response:", res);

          const id = res?.loanId || res?.id;

          if (!id) {
            toast.error("Loan ID not found");
            return;
          }

          setLoanId(id);
          toast.success("Loan saved");

          setStep(3);


          } catch (err) {
          console.error("❌ FULL ERROR:", err.response);


          toast.error(
            err.response?.data?.message ||
            err.message ||
            "Loan creation failed"
          );


          }

          return;
          }


          // STEP 3 → SAVE VEHICLE
          if (step === 3) {
            if (!loanId) {
              toast.error("Loan not created yet");
              return;
            }
            if (!form.carMake || !form.carModel) {
              toast.error("Fill vehicle details");
              return;
            }
            if (!form.exShowroomPrice) {
              toast.error("Enter vehicle price");
              return;
            }
            try {
              await API.post("/vehicle/add", {
                loanId: loanId,
                carMake: form.carMake,
                model: form.carModel,
                variant: form.variant,
                dealerName: form.dealerName,
                dealerLocation: form.dealerLocation,
                exShowroomPrice: Number(form.exShowroomPrice),
                onRoadPrice: Number(form.onRoadPrice)
              });

              toast.success("Vehicle saved");
              setStep(4);
            } catch (err) {
              toast.error("Vehicle save failed");
            }

            return;
          }

        }}
        className="bg-teal-600 text-white px-6 py-2 rounded-xl"
      >
        {submitting ? "Saving..." : "Next →"}
      </button>
    ) : (
      <button
        type="submit"
        className="bg-teal-700 text-white px-6 py-3 rounded-xl"
      >
        Submit Application
      </button>
    )}

  </div> */}


{/* =========================================================
    BUTTON SECTION
========================================================= */}

<div className="flex justify-between mt-6">

  {/* ================= PREVIOUS BUTTON ================= */}
{/* 
  {step > 1 && (
    <button
      type="button"
      disabled={submitting}
      onClick={() => setStep(step - 1)}
      className={`
        px-6 py-2 border rounded-xl transition
        ${submitting
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-gray-100"
        }
      `}
    >
      ← Previous
    </button>
  )} */}

{/* ================= PREVIOUS BUTTON ================= */}

{(step > 1 || subStep > 1) && (

  <button
    type="button"
    disabled={submitting}

    onClick={() => {

      /* STEP 1 SUB TABS BACK */
      if (step === 1 && subStep > 1) {

        setSubStep(subStep - 1);
        return;
      }

      /* MAIN STEP BACK */
      if (step > 1) {

        setStep(step - 1);
      }
    }}

    className={`
      px-6 py-2 border rounded-xl transition

      ${submitting
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-gray-100"
      }
    `}
  >
    ← Previous
  </button>
)}


  {/* ================= NEXT BUTTON ================= */}

  {step < 4 ? (

    <button
      type="button"

      /* ✅ BUTTON DISABLE */
      disabled={submitting}

      onClick={async () => {

        /* =================================================
            DOUBLE CLICK PROTECTION
        ================================================= */

        if (submitting) return;

        /* =================================================
            STEP 1
        ================================================= */

        if (step === 1) {

          // SUB STEP SWITCH
          if (subStep < 3) {
            setSubStep(subStep + 1);
            return;
          }

          /* ================= VALIDATIONS ================= */

          if (!form.fullName || !form.mobile) {
            toast.error("Fill required fields");
            return;
          }

          if (!form.employmentType) {
            toast.error("Select employment type");
            return;
          }

          if (form.employmentType === "Salaried" && !form.company) {
            toast.error("Enter company name");
            return;
          }

          if (form.employmentType === "Self-Employed" && !form.businessName) {
            toast.error("Enter business name");
            return;
          }

          if (form.employmentType === "Salaried" && !form.income) {
            toast.error("Enter monthly salary");
            return;
          }

          if (form.employmentType === "Self-Employed" && !form.annualIncome) {
            toast.error("Enter annual income");
            return;
          }

          if (!form.dob) {
            toast.error("Select date of birth");
            return;
          }

          if (!form.pan) {
            toast.error("Enter PAN number");
            return;
          }

          if (!form.aadhaar) {
            toast.error("Enter Aadhaar number");
            return;
          }

          if (form.aadhaar.length !== 12) {
            toast.error("Aadhaar must be 12 digits");
            return;
          }

          if (!panRegex.test(form.pan)) {
            toast.error("Invalid PAN format");
            return;
          }

          try {

            /* ================= START LOADER ================= */

            setSubmitting(true);

            /* ================= API CALL ================= */

            await saveUserProfileApi({

              userId: getStoredUserId(),

              // PERSONAL
              fullName: form.fullName,
              dateOfBirth: form.dob,

              panNumber: form.pan,
              aadhaarNumber: form.aadhaar,

              mobileNumber: form.mobile,
              email: form.email,

              // EMPLOYMENT
              employmentType:
                form.employmentType === "Self-Employed"
                  ? "SELF_EMPLOYED"
                  : "SALARIED",

              // SALARIED
              companyName:
                form.employmentType === "Salaried"
                  ? form.company
                  : null,

              workExperience:
                form.employmentType === "Salaried"
                  ? Number(form.experience)
                  : null,

              monthlySalary:
                form.employmentType === "Salaried"
                  ? Number(form.income)
                  : null,

              // SELF EMPLOYED
              businessName:
                form.employmentType === "Self-Employed"
                  ? form.businessName
                  : null,

              businessType:
                form.employmentType === "Self-Employed"
                  ? form.businessType
                  : null,

              annualIncome:
                form.employmentType === "Self-Employed"
                  ? Number(form.annualIncome)
                  : null,

              // ADDRESS
              addressLine1: form.address1,
              addressLine2: form.address2,

              city: form.city,

              state: form.state
                ? form.state.toUpperCase()
                : null,

              pincode: form.pincode,
            });

            /* ================= SUCCESS ================= */

            toast.success("Profile saved successfully");

            setStep(2);

          } catch (err) {

            console.error(err);

            toast.error(
              err.response?.data?.message ||
              "Profile save failed"
            );

          } finally {

            /* ================= STOP LOADER ================= */

            setSubmitting(false);
          }

          return;
        }

        /* =================================================
            STEP 2 → CREATE LOAN
        ================================================= */

        if (step === 2) {

          const loanAmount = parseFloat(form.loanAmount);
          const downPayment = parseFloat(form.downPayment);
          const tenure = parseInt(form.tenure, 10);

          /* ================= VALIDATIONS ================= */

          if (!form.vehicleType) {
            toast.error("Select loan type");
            return;
          }

          if (!loanAmount || loanAmount <= 0) {
            toast.error("Enter valid loan amount");
            return;
          }

          if (!downPayment || downPayment <= 0) {
            toast.error("Enter valid down payment");
            return;
          }

          if (downPayment >= loanAmount) {
            toast.error("Down payment must be less than loan amount");
            return;
          }

          if (!tenure || tenure < 6) {
            toast.error("Select valid tenure");
            return;
          }

          if (tenure % 6 !== 0) {
            toast.error("Tenure must be multiple of 6");
            return;
          }

          try {

            /* ================= START LOADER ================= */

            setSubmitting(true);

            /* ================= PAYLOAD ================= */

            const payload = {
              userId: getStoredUserId(),

              loanType: form.vehicleType,

              loanAmount: Number(form.loanAmount) || 0,

              downPayment: Number(form.downPayment) || 0,

              tenure: Number(form.tenure) || 0,
            };

            console.log("🔥 LOAN PAYLOAD:", payload);

            /* ================= API CALL ================= */

            const res = await createLoanViaApi(payload);

            console.log("Loan API response:", res);

            const id = res?.loanId || res?.id;

            if (!id) {
              toast.error("Loan ID not found");
              return;
            }

            /* ================= SAVE LOAN ID ================= */

            setLoanId(id);

            toast.success("Loan saved");

            setStep(3);

          } catch (err) {

            console.error(err);

            toast.error(
              err.response?.data?.message ||
              err.message ||
              "Loan creation failed"
            );

          } finally {

            /* ================= STOP LOADER ================= */

            setSubmitting(false);
          }

          return;
        }

        /* =================================================
            STEP 3 → SAVE VEHICLE
        ================================================= */

        if (step === 3) {

          if (!loanId) {
            toast.error("Loan not created yet");
            return;
          }

          if (!form.carMake || !form.carModel) {
            toast.error("Fill vehicle details");
            return;
          }

          if (!form.exShowroomPrice) {
            toast.error("Enter vehicle price");
            return;
          }

          try {

            /* ================= START LOADER ================= */

            setSubmitting(true);

            /* ================= API CALL ================= */

            await API.post("/vehicle/add", {

              loanId: loanId,

              carMake: form.carMake,

              model: form.carModel,

              variant: form.variant,

              dealerName: form.dealerName,

              dealerLocation: form.dealerLocation,

              exShowroomPrice: Number(form.exShowroomPrice),

              onRoadPrice: Number(form.onRoadPrice),
            });

            /* ================= SUCCESS ================= */

            toast.success("Vehicle saved");

            setStep(4);

          } catch (err) {

            console.error(err);

            toast.error(
              err.response?.data?.message ||
              "Vehicle save failed"
            );

          } finally {

            /* ================= STOP LOADER ================= */

            setSubmitting(false);
          }

          return;
        }

      }}

      className={`
        bg-teal-600 text-white px-6 py-2 rounded-xl transition

        ${submitting
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-teal-700"
        }
      `}
    >

      {/* ================= BUTTON TEXT ================= */}

      {submitting ? (

        <span className="flex items-center gap-2">

          {/* SPINNER */}

          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />

            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />

          </svg>

          Saving...

        </span>

      ) : (

        "Next →"

      )}

    </button>

  ) : (

    /* =================================================
        FINAL SUBMIT BUTTON
    ================================================= */

    <button
      type="submit"
      disabled={submitting}
      className={`
        bg-teal-700 text-white px-6 py-3 rounded-xl transition

        ${submitting
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-teal-800"
        }
      `}
    >

      {submitting
        ? "Submitting..."
        : "Submit Application"
      }

    </button>
  )}

</div>


      </form>

    </AdminLayout>
  );
}


/* COMPONENTS */

function Input({ label, name, value, onChange, error, type = "text",placeholder = "", ...rest }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...rest}
        className={`w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-teal-400 ${
          rest.readOnly ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Select({ label, name, value = "", options, onChange, error }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full mt-1 p-2 border rounded-lg"
      >
        <option value="">Select</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function FileInput({ label, name, onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type="file"
        name={name}
        onChange={onChange}
        className="w-full mt-1 p-2 border rounded-lg"
      />
    </div>
  );
}