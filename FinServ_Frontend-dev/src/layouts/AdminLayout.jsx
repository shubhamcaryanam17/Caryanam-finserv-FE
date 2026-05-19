// src/layouts/AdminLayout.jsx

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col bg-gray-100">
        
        {/* Navbar/Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  );
}