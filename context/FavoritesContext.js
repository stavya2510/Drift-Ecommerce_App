import React, { createContext, useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ userId, children }) => {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const loaded = useRef(false);
  const key = `drift_favorites_${userId}`;

  // Load this account's favorites
  useEffect(() => {
    loaded.current = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        setFavoriteIds(raw ? JSON.parse(raw) : []);
      } catch (e) {
        setFavoriteIds([]);
      }
      loaded.current = true;
    })();
  }, [key]);

  // Save whenever they change
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(key, JSON.stringify(favoriteIds)).catch(() => {});
  }, [favoriteIds, key]);

  const toggleFavorite = (id) =>
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const isFavorite = (id) => favoriteIds.includes(id);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};