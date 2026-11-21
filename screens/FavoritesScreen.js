import React, { useContext } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { FavoritesContext } from "../context/FavoritesContext";
import { ProductsContext } from "../context/ProductsContext";
import ProductCard from "../components/ProductCard";

export default function FavoritesScreen({ navigation }) {
  const { favoriteIds } = useContext(FavoritesContext);
  const { products } = useContext(ProductsContext);

  // newest favorite first
  const items = [...favoriteIds]
    .reverse()
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="heart-outline" size={56} color="#bbb" />
        <Text style={styles.emptyText}>No favorites yet.</Text>
        <Text style={styles.emptySub}>Tap the heart on any product to save it here.</Text>
        <Button mode="outlined" textColor="#111" onPress={() => navigation.navigate("Shop")}>
          Browse products
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={() =>
              navigation.navigate("Shop", {
                screen: "ProductDetail",
                params: { product: item },
              })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  list: { padding: 8 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 8 },
  emptyText: { fontSize: 18, fontWeight: "700", color: "#111" },
  emptySub: { color: "#777", marginBottom: 12, textAlign: "center" },
});