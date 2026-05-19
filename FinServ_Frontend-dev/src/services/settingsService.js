const STORAGE_KEY = "finserv_admin_settings";

const defaults = {
  notifications: {
    email: true,
    sms: false,
    push: true,
    loanUpdates: true,
  },
  security: {
    twoFactor: false,
  },
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        notifications: { ...defaults.notifications },
        security: { ...defaults.security },
      };
    }
    const parsed = JSON.parse(raw);
    return {
      notifications: { ...defaults.notifications, ...parsed.notifications },
      security: { ...defaults.security, ...parsed.security },
    };
  } catch {
    return {
      notifications: { ...defaults.notifications },
      security: { ...defaults.security },
    };
  }
}

function save(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export async function getSettings() {
  return load();
}

export async function updateSettings(partial) {
  const current = load();
  const next = {
    notifications: {
      ...current.notifications,
      ...(partial.notifications || {}),
    },
    security: {
      ...current.security,
      ...(partial.security || {}),
    },
  };
  save(next);
  return next;
}
