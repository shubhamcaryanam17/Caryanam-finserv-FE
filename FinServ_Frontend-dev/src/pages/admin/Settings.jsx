import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getSettings, updateSettings } from "../../services/settingsService";

const NOTIFICATION_KEYS = [
  { key: "email", title: "Email Notifications", desc: "Email alerts for important events" },
  { key: "sms", title: "SMS Notifications", desc: "Text messages for critical updates" },
  { key: "push", title: "Push Notifications", desc: "Browser push (stored locally)" },
  { key: "loanUpdates", title: "Loan Status Updates", desc: "When loan status changes" },
];

export default function Settings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const toggleNotification = async (key) => {
    if (!settings) return;
    const nextVal = !settings.notifications[key];
    const next = await updateSettings({
      notifications: { [key]: nextVal },
    });
    setSettings(next);
  };

  if (!settings) {
    return (
      <AdminLayout>
        <p className="p-6 text-gray-500">Loading settings…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-gray-500">
            Preferences are saved in this browser (localStorage).
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold">Notification Preferences</h2>

          {NOTIFICATION_KEYS.map(({ key, title, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between border-b pb-3 last:border-none"
            >
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>

              <button
                type="button"
                onClick={() => toggleNotification(key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.notifications[key] ? "bg-teal-500" : "bg-gray-300"
                }`}
                aria-pressed={settings.notifications[key]}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    settings.notifications[key] ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold">Security</h2>

          {[
            { title: "Two-Factor Authentication", btn: "Enable" },
            { title: "Change Password", btn: "Update" },
            { title: "Active Sessions", btn: "View All" },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b pb-3 last:border-none"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">
                  Manage your account security
                </p>
              </div>

              <button
                type="button"
                className="px-4 py-1.5 border rounded-md text-sm hover:bg-gray-100"
                onClick={() =>
                  alert("This action is not connected to the backend yet.")
                }
              >
                {item.btn}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-500">
          <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>

          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="font-medium">Logout from all devices</p>
              <p className="text-sm text-gray-500">
                Sign out from all active sessions
              </p>
            </div>

            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              onClick={() =>
                alert("Use the header logout control to end this session.")
              }
            >
              Logout All
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
