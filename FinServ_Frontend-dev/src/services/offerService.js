// 🔹 STORAGE KEYS
const OFFER_KEY = "offers_data";

// 🔹 DEFAULT DATA
const defaultOffers = [
  {
    id: 1,
    applicationId: 2,
    amount: 300000,
    interest: "9%",
    tenure: "60 months",
    status: "DRAFT",
  },
];

// 🔹 LOAD
let offers =
  JSON.parse(localStorage.getItem(OFFER_KEY)) || defaultOffers;

// 🔹 SAVE
const saveOffers = () => {
  localStorage.setItem(OFFER_KEY, JSON.stringify(offers));
};

// delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ==============================
// ✅ GET OFFERS
// ==============================
export const getOffers = async () => {
  await delay(200);
  return [...offers];
};

// ==============================
// ✅ UPDATE OFFER STATUS
// ==============================
export const updateOfferStatus = async (id, status) => {
  await delay(200);

  offers = offers.map((o) =>
    o.id === id ? { ...o, status } : o
  );

  saveOffers();
  return true;
};