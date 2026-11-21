import React, { useContext, useState } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { FavoritesContext } from "../context/FavoritesContext";

export default function ProductCard({ item, onPress }) {
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const [imgFailed, setImgFailed] = useState(false);
  const fav = isFavorite(item.id);

  return (
    <TouchableOpacity style={styles.cardWrapper} onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View>
          {imgFailed ? (
            <View style={[styles.image, styles.placeholder]}>
              <Ionicons name="image-outline" size={40} color="#bbb" />
            </View>
          ) : (
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              onError={() => setImgFailed(true)}
            />
          )}

          <TouchableOpacity
            style={styles.heart}
            onPress={() => toggleFavorite(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={fav ? "heart" : "heart-outline"}
              size={20}
              color={fav ? "#e53935" : "#111"}
            />
          </TouchableOpacity>

          {item.discount > 0 && (
            <View style={styles.offer}>
              <Text style={styles.offerText}>{item.discount}% OFF</Text>
            </View>
          )}
        </View>

        <Card.Content style={styles.content}>
          <Text numberOfLines={1} style={styles.brand}>{item.brand}</Text>
          <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item.price}</Text>
            {item.discount > 0 && <Text style={styles.mrp}>₹{item.mrp}</Text>}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardWrapper: { flex: 0.5, padding: 6 },
  card: { backgroundColor: "#fff", borderRadius: 12, overflow: "hidden" },
  image: { width: "100%", height: 170, backgroundColor: "#eee" },
  placeholder: { justifyContent: "center", alignItems: "center" },
  heart: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 6,
  },
  offer: {
    position: "absolute",
    left: 8,
    bottom: 8,
    backgroundColor: "#d32f2f",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  offerText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  content: { padding: 10 },
  brand: { fontSize: 11, color: "#888", fontWeight: "700", letterSpacing: 0.5 },
  title: { fontWeight: "700", fontSize: 14, color: "#111", marginTop: 2 },
  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 6 },
  price: { fontWeight: "800", fontSize: 15, color: "#2e7d32" },
  mrp: { fontSize: 12, color: "#999", textDecorationLine: "line-through" },
});