import React, { createContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../constants";

export const ProductsContext = createContext();

const MOCKSHOP_URL = "https://mock.shop/api";
const FAKESTORE_URL = "https://fakestoreapi.com/products";
const DUMMYJSON_URL = "https://dummyjson.com/products?limit=0";
const CACHE_KEY = "drift_products_v4";

// Fetch JSON with a 15 second timeout, trying twice
const getJson = async (url, options) => {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      if (!res.ok) throw new Error("Server error " + res.status);
      return await res.json();
    } catch (e) {
      lastError = e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
};

// dollars -> rupees (demo pricing)
const toRupees = (usd, category) =>
  category === "Watches" ? Math.round(usd / 2) + 999 : Math.round(usd * 20) + 299;

// Small stable number from text (used for demo sizes and offers)
const hash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

const COLOR_ALIASES = {
  gray: "grey", navy: "blue", olive: "green", cream: "beige",
  tan: "brown", maroon: "red", charcoal: "grey", khaki: "beige",
};

// Read colors from the product name
const detectColors = (title) => {
  const t = title.toLowerCase();
  const found = new Set();
  Object.keys(COLORS).forEach((c) => {
    if (new RegExp(`\\b${c}\\b`).test(t)) found.add(c);
  });
  Object.entries(COLOR_ALIASES).forEach(([word, c]) => {
    if (new RegExp(`\\b${word}\\b`).test(t)) found.add(c);
  });
  return [...found];
};

const CLOTHING = ["Hoodies", "Jackets", "T-Shirts", "Shirts", "Bottoms"];

// Demo sizes: most sizes are available, one may be missing
const sizesFor = (category, id) => {
  const h = hash(String(id)) % 5;
  if (CLOTHING.includes(category)) {
    const all = ["S", "M", "L", "XL"];
    return h < 4 ? all.filter((_, i) => i !== h) : all;
  }
  if (category === "Shoes") {
    const all = ["UK 7", "UK 8", "UK 9", "UK 10"];
    return h < 4 ? all.filter((_, i) => i !== h) : all;
  }
  return ["One Size"];
};

// Adds brand, colors, sizes and offer to every product
const finalize = (p) => {
  const { apiDiscount, ...rest } = p;
  let discount;
  if (apiDiscount != null) {
    discount = apiDiscount >= 10 ? Math.min(Math.round(apiDiscount), 30) : 0;
  } else {
    discount = [0, 0, 10, 15, 20, 0, 25, 30][hash(String(p.id)) % 8];
  }
  return {
    ...rest,
    brand: p.brand || "Drift",
    colors: detectColors(p.title),
    sizes: sizesFor(p.category, p.id),
    discount,
    mrp: discount ? Math.round(p.price / (1 - discount / 100)) : p.price,
  };
};

// Decide the category from the product name
const getCategory = (title, type = "") => {
  const t = `${title} ${type}`.toLowerCase();
  if (/hood|sweatshirt|crewneck|pullover/.test(t)) return "Hoodies";
  if (/jacket|coat/.test(t)) return "Jackets";
  if (/t-shirt|t shirt|\btee\b|tank/.test(t)) return "T-Shirts";
  if (/shirt/.test(t)) return "Shirts";
  if (/jogger|shorts|pant|trouser/.test(t)) return "Bottoms";
  if (/\bcaps?\b|\bhats?\b|beanie|bucket/.test(t)) return "Caps";
  if (/slides|sneaker|shoe|sandal|boot/.test(t)) return "Shoes";
  return null;
};

// Source 1: mock.shop (Shopify demo store, GraphQL)
const MOCKSHOP_QUERY = `{
  products(first: 50) {
    nodes {
      id
      title
      description
      productType
      featuredImage { url }
      priceRange { minVariantPrice { amount } }
    }
  }
}`;

const loadMockShop = async () => {
  const json = await getJson(MOCKSHOP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: MOCKSHOP_QUERY }),
  });
  const nodes = json?.data?.products?.nodes;
  if (!Array.isArray(nodes)) throw new Error("Unexpected response from mock.shop");

  return nodes
    .map((n) => {
      const category = getCategory(n.title, n.productType);
      return {
        id: `ms-${String(n.id).split("/").pop()}`,
        title: n.title,
        description: n.description,
        price: toRupees(Number(n.priceRange?.minVariantPrice?.amount) || 20, category),
        image: n.featuredImage?.url,
        category,
      };
    })
    .filter((p) => p.category && p.image);
};

// Source 3: FakeStore API (men's jackets and t-shirts)
const loadFakeStore = async () => {
  const data = await getJson(FAKESTORE_URL);
  if (!Array.isArray(data)) throw new Error("Unexpected response from FakeStore");

  return data
    .filter((i) => i.category === "men's clothing" && !/backpack/i.test(i.title))
    .map((i) => {
      const category = getCategory(i.title) || "Shirts";
      return {
        id: `fs-${i.id}`,
        title: i.title.trim(),
        description: i.description,
        price: toRupees(i.price, category),
        image: i.image,
        category,
      };
    });
};

// Source 4: DummyJSON (shirts, shoes, watches, perfumes, sunglasses)
const DUMMY_CATEGORIES = {
  "mens-shirts": "Shirts",
  "mens-shoes": "Shoes",
  "mens-watches": "Watches",
  fragrances: "Perfumes",
  sunglasses: "Sunglasses",
};

const loadDummyJson = async () => {
  const data = await getJson(DUMMYJSON_URL);
  if (!Array.isArray(data?.products)) throw new Error("Unexpected response from DummyJSON");

  return data.products
    .filter((i) => DUMMY_CATEGORIES[i.category])
    .map((i) => {
      const category = DUMMY_CATEGORIES[i.category];
      return {
        id: `dj-${i.id}`,
        title: i.title,
        description: i.description,
        price: toRupees(i.price, category),
        image: i.images?.[0] || i.thumbnail,
        category,
        brand: i.brand,
        apiDiscount: i.discountPercentage,
      };
    })
    .filter((p) => p.image);
};

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // All four run at the same time; the app works if at least one succeeds
            const names = ["mock.shop", "FakeStore", "DummyJSON"];
      const results = await Promise.allSettled([
        loadMockShop(),
        loadFakeStore(),
        loadDummyJson(),
      ]);

      results.forEach((r, i) =>
        console.log(
          names[i] + ":",
          r.status === "fulfilled" ? r.value.length + " products" : String(r.reason)
        )
      );

      const list = results
        .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
        .map(finalize);

      console.log(
        "By category:",
        list.reduce((acc, p) => ({ ...acc, [p.category]: (acc[p.category] || 0) + 1 }), {})
      );

      if (list.length === 0) {
        const firstError = results.find((r) => r.status === "rejected")?.reason;
        throw firstError || new Error("No products returned");
      }

      setProducts(list);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(list)).catch(() => {});
    } catch (e) {
      console.log("Product load failed:", e);

      // Fall back to the last saved list, if there is one
      let cached = null;
      try {
        cached = await AsyncStorage.getItem(CACHE_KEY);
      } catch (_) {}

      if (cached) {
        setProducts(JSON.parse(cached));
      } else {
        const reason =
          e.name === "AbortError" ? "The server took too long to respond." : e.message;
        setError(`Could not load products. ${reason}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ProductsContext.Provider value={{ products, loading, error, reload: load }}>
      {children}
    </ProductsContext.Provider>
  );
};