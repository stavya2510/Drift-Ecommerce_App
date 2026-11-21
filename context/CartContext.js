import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const addToCart = (product, size = "M") => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id && i.size === size);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id && i.size === size ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, size, qty: 1 }];
    });
  };

  const removeFromCart = (id, size) =>
    setCart((prev) => prev.filter((i) => !(i.id === id && i.size === size)));

    const changeQty = (id, size, delta) =>
    setCart((prev) =>
      prev
        .map((i) => (i.id === id && i.size === size ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );

  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, changeQty, clearCart, totalAmount, searchQuery, setSearchQuery }}
    >
      {children}
    </CartContext.Provider>
  );
};