import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Searchbar, Badge } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CartContext } from "../context/CartContext";
import { FilterContext } from "../context/FilterContext";

export default function CustomHeader({ showSearch = true }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { cart, searchQuery, setSearchQuery } = useContext(CartContext);
  const { activeCount, setVisible } = useContext(FilterContext);
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.iconBtn}
        >
          <Ionicons name="menu-outline" size={28} color="#111" />
        </TouchableOpacity>

        <Text style={styles.brand}>DRIFT</Text>

        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={() => navigation.navigate("Favorites")} style={styles.iconBtn}>
            <Ionicons name="heart-outline" size={26} color="#111" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Cart")} style={styles.iconBtn}>
            <Ionicons name="bag-handle-outline" size={26} color="#111" />
            {totalItems > 0 && (
              <Badge size={18} style={styles.badge}>
                {totalItems}
              </Badge>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchWrap}>
          <Searchbar
            placeholder="Search watches, shoes, hoodies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.search}
            inputStyle={{ fontSize: 14, minHeight: 0 }}
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => setVisible(true)}>
            <Ionicons name="options-outline" size={22} color="#fff" />
            {activeCount > 0 && (
              <Badge size={16} style={styles.filterBadge}>
                {activeCount}
              </Badge>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#eee" },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  brand: { fontSize: 22, fontWeight: "900", letterSpacing: 3, color: "#111" },
  rightIcons: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconBtn: { padding: 4 },
  badge: { position: "absolute", top: -2, right: -4, backgroundColor: "#111" },
  searchWrap: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  search: { flex: 1, height: 42, backgroundColor: "#f4f4f5", borderRadius: 10, elevation: 0 },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadge: { position: "absolute", top: -6, right: -6, backgroundColor: "#d32f2f" },
});