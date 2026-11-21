import React, { createContext, useState } from "react";
import { PRICE_BANDS } from "../constants";

export const FilterContext = createContext();

export const EMPTY_FILTERS = {
  price: null, // index of PRICE_BANDS, or null
  colors: [],
  brands: [],
  sizes: [],
  offersOnly: false,
};

export const applyFilters = (products, f) =>
  products.filter((p) => {
    if (f.price !== null) {
      const band = PRICE_BANDS[f.price];
      if (p.price < band.min || p.price >= band.max) return false;
    }
    if (f.colors.length && !p.colors.some((c) => f.colors.includes(c))) return false;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.sizes.length && !p.sizes.some((s) => f.sizes.includes(s))) return false;
    if (f.offersOnly && !(p.discount > 0)) return false;
    return true;
  });

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [visible, setVisible] = useState(false);

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const activeCount =
    (filters.price !== null ? 1 : 0) +
    filters.colors.length +
    filters.brands.length +
    filters.sizes.length +
    (filters.offersOnly ? 1 : 0);

  return (
    <FilterContext.Provider
      value={{ filters, setFilters, clearFilters, activeCount, visible, setVisible }}
    >
      {children}
    </FilterContext.Provider>
  );
};