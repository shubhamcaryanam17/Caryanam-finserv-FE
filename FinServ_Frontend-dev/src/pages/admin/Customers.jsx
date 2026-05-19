import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";

import {
  getCustomerDashboardUsers,
  updateUser,
  deleteUser,
} from "../../services/customerService";

export default function Customers() {
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openMenuId, setOpenMenuId] = useState(null);

  // ✅ NEW STATES (MODALS)
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({
    fullName: "",
    email: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const userData = await getCustomerDashboardUsers();
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ SEARCH
  useEffect(() => {
    const filtered = users.filter((user) =>
      `${user.fullName} ${user.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    setFilteredUsers(filtered);
  }, [search, users]);

  // ✅ OPEN EDIT MODAL
  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditData({
      fullName: user.fullName,
      email: user.email,
    });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleUpdate = async () => {
    try {
      await updateUser(selectedUser.id, editData);
      setShowEditModal(false);
      fetchData();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Update failed");
    }
  };

  // ✅ OPEN DELETE MODAL
  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      fetchData();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Customers
        </h1>
        <p className="text-gray-500 mt-1">
          View and manage customer details.
        </p>

        {/* SEARCH */}
        <div className="flex justify-between items-center mt-6">
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <p className="text-gray-500 mt-6">Loading customers…</p>
        ) : null}

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredUsers.map((user) => {
            const stats = {
              totalLoans: user.totalLoans,
              activeLoans: user.activeLoans,
              totalValue: user.totalLoanAmount,
            };

            return (
              <div
                key={user.id}
                className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition relative"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-900 text-white w-10 h-10 flex items-center justify-center rounded-full font-semibold">
                      {user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {user.fullName}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* 3 DOT MENU */}
                  <div className="relative">
                    <span
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === user.id ? null : user.id
                        )
                      }
                      className="cursor-pointer px-2"
                    >
                      •••
                    </span>

                    {openMenuId === user.id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow z-10">
                        <button
                          onClick={() => handleEdit(user)}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() => handleDelete(user)}
                          className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p>📧 {user.email}</p>
                  <p>
                    📞{" "}
                    {user.mobileNumber
                      ? `+91 ${user.mobileNumber}`
                      : "—"}
                  </p>
                </div>

                <div className="border-t mt-4 pt-3 flex justify-between text-sm">
                  <div className="text-center">
                    <p className="font-semibold">
                      {stats.totalLoans}
                    </p>
                    <p className="text-xs text-gray-400">
                      Total Loans
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="font-semibold text-green-600">
                      {stats.activeLoans}
                    </p>
                    <p className="text-xs text-gray-400">
                      Active
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="font-semibold">
                      ₹{stats.totalValue}
                    </p>
                    <p className="text-xs text-gray-400">
                      Total Value
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* EMPTY */}
        {filteredUsers.length === 0 && (
          <p className="text-center text-gray-400 mt-6">
            No customers found
          </p>
        )}
      </div>

      {/* ✅ EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Edit Customer
            </h2>

            <input
              type="text"
              value={editData.fullName}
              onChange={(e) =>
                setEditData({ ...editData, fullName: e.target.value })
              }
              className="w-full border p-2 rounded mb-3"
            />

            <input
              type="email"
              value={editData.email}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
              className="w-full border p-2 rounded mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 shadow-lg text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-3">
              Delete Customer
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete <br />
              <span className="font-semibold">
                {selectedUser?.fullName}
              </span>?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}