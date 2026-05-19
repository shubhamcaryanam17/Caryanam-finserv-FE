import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";

import {
  getBanks,
  addBank,
  updateBank,
  deleteBank,
} from "../../services/bankService";

export default function Banks() {
  const [bankExecutives, setBankExecutives] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedBank, setSelectedBank] = useState(null);

  // 🔥 UPDATED FORM (FULL DATA)
  const [formData, setFormData] = useState({
    name: "",
    roi: "",
    processing: "",
    ltv: "",
    tenure: "",
    features: "",
  });

  // ✅ FETCH
  const fetchBanks = async () => {
    const data = await getBanks();
    setBankExecutives(data);
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  // ✅ ADD
  const handleAdd = async () => {
    if (!formData.name.trim()) return;

    try {
      await addBank({
        ...formData,
        features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
      });

      setShowAddModal(false);
      resetForm();
      fetchBanks();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e.message || "Could not add bank");
    }
  };

  // ✅ EDIT
  const handleEdit = (bank) => {
    setSelectedBank(bank);
    setFormData({
      name: bank.name,
      roi: bank.roi || "",
      processing: bank.processing || "",
      ltv: bank.ltv || "",
      tenure: bank.tenure || "",
      features: bank.features?.join(", ") || "",
    });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleUpdate = async () => {
    try {
      await updateBank(selectedBank.id, {
        ...formData,
        features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
      });

      setShowEditModal(false);
      resetForm();
      fetchBanks();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e.message || "Could not update ROI");
    }
  };

  // ✅ DELETE
  const handleDelete = (bank) => {
    setSelectedBank(bank);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    try {
      await deleteBank(selectedBank.id);
      fetchBanks();
    } catch (e) {
      alert(e?.message || "Could not delete bank");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      roi: "",
      processing: "",
      ltv: "",
      tenure: "",
      features: "",
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Partner Banks
            </h1>
            <p className="text-gray-500 mt-1">
              Manage banking partnerships and rates
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm"
          >
            + Add Bank Partner
          </button>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {bankExecutives.map((bank) => (
            <div key={bank.id} className="bg-white p-5 rounded-2xl shadow relative">

              {/* MENU */}
              <div className="absolute top-3 right-3">
                <span
                  onClick={() =>
                    setOpenMenuId(openMenuId === bank.id ? null : bank.id)
                  }
                  className="cursor-pointer"
                >
                  •••
                </span>

                {openMenuId === bank.id && (
                  <div className="absolute right-0 mt-2 bg-white border rounded shadow w-28">
                    <button onClick={() => handleEdit(bank)} className="block w-full px-3 py-2 hover:bg-gray-100">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(bank)} className="block w-full px-3 py-2 text-red-600 hover:bg-gray-100">
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* HEADER */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  🏦
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{bank.name}</h3>
                  <p className="text-sm text-green-600">● Active Partner</p>
                </div>
              </div>

              {/* INFO */}
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">ROI Range</p>
                  <p className="font-medium">{bank.roi}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Processing</p>
                  <p className="font-medium">{bank.processing}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Max LTV</p>
                  <p className="font-medium">{bank.ltv}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Max Tenure</p>
                  <p className="font-medium">{bank.tenure}</p>
                </div>
              </div>

              {/* FEATURES */}
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Key Features</p>
                <div className="flex flex-wrap gap-2">
                  {bank.features?.map((f, i) => (
                    <span key={i} className="bg-teal-100 text-teal-600 px-2 py-1 rounded-full text-xs">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-between items-center mt-4 border-t pt-3">
                <p className="text-sm text-gray-500">
                  Cases this month{" "}
                  <span className="font-semibold text-teal-600">
                    {bank.casesThisMonth ?? 0}
                  </span>
                </p>

                <button className="text-sm border px-3 py-1 rounded-lg hover:bg-gray-100">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <Modal
          title="Add Bank"
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <Modal
          title="Edit Bank"
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdate}
        />
      )}

      {/* DELETE */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-80 text-center">
            <h2 className="text-red-600 font-semibold mb-3">
              Delete Bank
            </h2>

            <p className="mb-4">
              Delete <b>{selectedBank?.name}</b>?
            </p>

            <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded">
              Delete
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// 🔥 REUSABLE MODAL
function Modal({ title, formData, setFormData, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="font-semibold mb-4">{title}</h2>

        {["name", "roi", "processing", "ltv", "tenure"].map((field) => (
          <input
            key={field}
            placeholder={field.toUpperCase()}
            value={formData[field]}
            onChange={(e) =>
              setFormData({ ...formData, [field]: e.target.value })
            }
            className="w-full border p-2 rounded mb-2"
          />
        ))}

        <input
          placeholder="Features (comma separated)"
          value={formData.features}
          onChange={(e) =>
            setFormData({ ...formData, features: e.target.value })
          }
          className="w-full border p-2 rounded mb-4"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button onClick={onSubmit} className="bg-blue-900 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}