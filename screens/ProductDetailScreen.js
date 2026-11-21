import React, { useState, useContext } from "react";
import { View, Image, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Text, Button, TextInput, SegmentedButtons } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { CartContext } from "../context/CartContext";
import { FavoritesContext } from "../context/FavoritesContext";
import { DELIVERY_ZONES } from "../constants";

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useContext(CartContext);
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);

  const sizes = product.sizes?.length ? product.sizes : ["One Size"];
  const [size, setSize] = useState(sizes.includes("M") ? "M" : sizes[0]);
  const [pincode, setPincode] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null); // { ok: true/false, message }

  const fav = isFavorite(product.id);

  const checkDelivery = async () => {
    if (!/^\d{6}$/.test(pincode)) {
      setResult({ ok: false, message: "Enter a valid 6-digit PIN code." });
      return;
    }

    setChecking(true);
    setResult(null);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Server error " + res.status);
      const data = await res.json();

      const entry = data?.[0];
      if (entry?.Status !== "Success" || !entry.PostOffice?.length) {
        setResult({ ok: false, message: "PIN code not found. Please check and try again." });
        return;
      }

      const { District, State } = entry.PostOffice[0];
      const days = DELIVERY_ZONES[State.toLowerCase()];

      if (days) {
        setResult({
          ok: true,
          message: `Delivery available to ${District}, ${State} in ${days} days.`,
        });
      } else {
        setResult({
          ok: false,
          message: `Sorry, ${State} is outside our delivery range right now.`,
        });
      }
    } catch (e) {
      setResult({
        ok: false,
        message: "Could not check delivery right now. Please try again in a moment.",
      });
    } finally {
      clearTimeout(timer);
      setChecking(false);
    }
  };

  const handleAddToBag = () => {
    addToCart(product, size);
    Alert.alert("Added to bag", `${product.title} (${size})`, [
      { text: "Keep shopping", style: "cancel" },
      { text: "View bag", onPress: () => navigation.navigate("Cart") },
    ]);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View>
        <Image source={{ uri: product.image }} style={styles.image} />
        <TouchableOpacity style={styles.heart} onPress={() => toggleFavorite(product.id)}>
          <Ionicons
            name={fav ? "heart" : "heart-outline"}
            size={26}
            color={fav ? "#e53935" : "#111"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        <Text style={styles.category}>
          {(product.brand || "Drift").toUpperCase()} · {product.category.toUpperCase()}
        </Text>
        <Text style={styles.title}>{product.title}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price}</Text>
          {product.discount > 0 && (
            <>
              <Text style={styles.mrp}>₹{product.mrp}</Text>
              <Text style={styles.off}>{product.discount}% OFF</Text>
            </>
          )}
        </View>

        <Text style={styles.desc}>{product.description}</Text>

        {sizes.length > 1 && (
          <>
            <Text style={styles.label}>Select size</Text>
            <SegmentedButtons
              value={size}
              onValueChange={setSize}
              buttons={sizes.map((s) => ({ value: s, label: s }))}
            />
          </>
        )}

        <Text style={styles.label}>Check delivery (PIN code)</Text>
        <View style={styles.pinRow}>
          <TextInput
            placeholder="e.g. 400001"
            value={pincode}
            onChangeText={(t) => {
              setPincode(t.replace(/[^0-9]/g, ""));
              setResult(null);
            }}
            keyboardType="number-pad"
            maxLength={6}
            mode="outlined"
            style={styles.pinInput}
          />
          <Button
            mode="contained"
            buttonColor="#333"
            onPress={checkDelivery}
            loading={checking}
            disabled={checking}
            style={styles.checkBtn}
          >
            Check
          </Button>
        </View>

        {result && (
          <Text style={[styles.result, { color: result.ok ? "#2e7d32" : "#d32f2f" }]}>
            {result.message}
          </Text>
        )}

        <Button
          mode="contained"
          buttonColor="#111"
          onPress={handleAddToBag}
          style={styles.addBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Add to bag
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 360, backgroundColor: "#eee" },
  heart: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 22,
    padding: 8,
  },
  details: { padding: 20 },
  category: { fontSize: 12, color: "#777", fontWeight: "700", letterSpacing: 1.5 },
  title: { fontSize: 22, fontWeight: "800", marginTop: 4, color: "#111" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 8 },
  price: { fontSize: 20, fontWeight: "800", color: "#2e7d32" },
  mrp: { fontSize: 15, color: "#999", textDecorationLine: "line-through" },
  off: { fontSize: 13, fontWeight: "800", color: "#d32f2f" },
  desc: { fontSize: 14, color: "#555", lineHeight: 20, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  pinRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pinInput: { flex: 1, height: 46, backgroundColor: "#fff" },
  checkBtn: { justifyContent: "center" },
  result: { marginTop: 8, fontWeight: "600" },
  addBtn: { marginTop: 24, borderRadius: 10 },
});