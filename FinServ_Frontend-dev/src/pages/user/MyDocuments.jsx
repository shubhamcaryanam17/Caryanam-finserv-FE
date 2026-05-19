// src/pages/user/MyDocuments.jsx

import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";

// ✅ UPDATED SERVICE NAME
import {
  getUserDocuments,
  saveUserDocument,
} from "../../services/userDocumentService";

export default function MyDocuments() {
  const [documents, setDocuments] = useState({
    aadhaar: null,
    pan: null,
    salary: null,
    bank: null,
    address: null,
    quotation: null,
    photo: null,
  });

  // ✅ LOAD SAVED DATA
  useEffect(() => {
    const fetchDocs = async () => {
      const data = await getUserDocuments();

      setDocuments({
        aadhaar: data.aadhaar || null,
        pan: data.pan || null,
        salary: data.salary || null,
        bank: data.bank || null,
        address: data.address || null,
        quotation: data.quotation || null,
        photo: data.photo || null,
      });
    };

    fetchDocs();
  }, []);

  // ✅ UPLOAD + SAVE
  const handleUpload = async (e) => {
    const { name, files } = e.target;

    if (!files[0]) return;

    const updated = await saveUserDocument(name, files[0]);

    setDocuments({
      ...documents,
      [name]: updated[name],
    });
  };

  return (
    <AdminLayout>

      <h2 className="text-xl font-semibold mb-4">
        My Documents
      </h2>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">

        <DocumentRow label="Aadhaar Card" name="aadhaar" file={documents.aadhaar} onChange={handleUpload} />
        <DocumentRow label="PAN Card" name="pan" file={documents.pan} onChange={handleUpload} />
        <DocumentRow label="Salary Slips (3 months)" name="salary" file={documents.salary} onChange={handleUpload} />
        <DocumentRow label="Bank Statement" name="bank" file={documents.bank} onChange={handleUpload} />
        <DocumentRow label="Address Proof" name="address" file={documents.address} onChange={handleUpload} />
        <DocumentRow label="Car Quotation" name="quotation" file={documents.quotation} onChange={handleUpload} />
        <DocumentRow label="Photograph" name="photo" file={documents.photo} onChange={handleUpload} />

      </div>

    </AdminLayout>
  );
}


/* 🔹 COMPONENT */

function DocumentRow({ label, name, file, onChange }) {
  return (
    <div className="flex items-center justify-between border-b pb-3">

      <div>
        <p className="font-medium">{label}</p>
        <p className={`text-sm ${file ? "text-green-500" : "text-red-500"}`}>
          {file ? "Uploaded ✅" : "Not Uploaded ❌"}
        </p>
      </div>

      <div className="flex items-center gap-3">

        {file && (
          <span className="text-sm text-gray-500 truncate max-w-[120px]">
            {file.name}
          </span>
        )}

        <label className="bg-teal-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-teal-600">
          Upload
          <input
            type="file"
            name={name}
            onChange={onChange}
            className="hidden"
          />
        </label>

      </div>

    </div>
  );
}