import React, { useContext } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { Text, Button } from "react-native-paper";
import { ProductsContext } from "../context/ProductsContext";
import { CartContext } from "../context/CartContext";
import { FilterContext, applyFilters } from "../context/FilterContext";
import ProductCard from "../components/ProductCard";

export default function HomeScreen({ navigation, route }) {
  const { products, loading, error, reload } = useContext(ProductsContext);
  const { searchQuery } = useContext(CartContext);
  const { filters, activeCount, clearFilters } = useContext(FilterContext);

  const category = route.name; // All, Hoodies, Watches...
  const query = searchQuery.trim().toLowerCase();

  const filtered = applyFilters(products, filters).filter(
    (p) =>
      (category === "All" || p.category === category) &&
      p.title.toLowerCase().includes(query)
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" buttonColor="#111" onPress={reload}>
          Try again
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={reload}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.empty}>No products found.</Text>
            {activeCount > 0 && (
              <Button mode="outlined" textColor="#111" onPress={clearFilters}>
                Clear filters
              </Button>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={() => navigation.navigate("ProductDetail", { product: item })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorText: { marginBottom: 12, color: "#555", textAlign: "center" },
  emptyBox: { alignItems: "center", marginTop: 40, gap: 12 },
  empty: { color: "#777" },
  list: { padding: 8 },
});