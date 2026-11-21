export const CATEGORIES = [
  "All", "Hoodies", "Jackets", "T-Shirts", "Shirts", "Bottoms",
  "Caps", "Shoes", "Watches", "Perfumes", "Sunglasses",
];

export const COLORS = {
  black: "#111111",
  white: "#ffffff",
  grey: "#9e9e9e",
  blue: "#1e63d6",
  red: "#d32f2f",
  green: "#2e7d32",
  brown: "#795548",
  beige: "#d7c4a3",
  pink: "#ec7fa9",
  yellow: "#f2c94c",
  orange: "#f2994a",
  purple: "#8e44ad",
  gold: "#d4af37",
  silver: "#c0c0c0",
};

export const PRICE_BANDS = [
  { label: "Under ₹1,000", min: 0, max: 1000 },
  { label: "₹1,000 – ₹2,500", min: 1000, max: 2500 },
  { label: "₹2,500 – ₹5,000", min: 2500, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: Infinity },
];

// States we deliver to, with estimated delivery time
export const DELIVERY_ZONES = {
  maharashtra: "2–3",
  goa: "3–4",
  gujarat: "3–5",
  karnataka: "3–5",
  "madhya pradesh": "4–5",
  telangana: "4–5",
};