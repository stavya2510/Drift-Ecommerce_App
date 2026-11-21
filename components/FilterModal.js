import React, { useContext } from "react";
import { Modal, View, ScrollView, TouchableOpacity, Pressable, StyleSheet } from "react-native";
import { Text, Button, Switch } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FilterContext, applyFilters } from "../context/FilterContext";
import { ProductsContext } from "../context/ProductsContext";
import { COLORS, PRICE_BANDS } from "../constants";

const SIZE_ORDER = ["S", "M", "L", "XL", "UK 7", "UK 8", "UK 9", "UK 10"];

function Option({ label, selected, onPress, dot }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.option, selected && styles.optionOn]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: dot }]} />}
      <Text style={[styles.optionText, selected && styles.optionTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.wrap}>{children}</View>
    </View>
  );
}

export default function FilterModal() {
  const insets = useSafeAreaInsets();
  const { filters, setFilters, clearFilters, visible, setVisible } = useContext(FilterContext);
  const { products } = useContext(ProductsContext);

  const close = () => setVisible(false);

  // Only offer options that exist in the loaded products
  const colors = Object.keys(COLORS).filter((c) => products.some((p) => p.colors.includes(c)));
  const brands = [...new Set(products.map((p) => p.brand))].sort();
  const sizes = SIZE_ORDER.filter((s) => products.some((p) => p.sizes.includes(s)));

  const toggle = (key, value) =>
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));

  const resultCount = applyFilters(products, filters).length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={{ flex: 1 }} onPress={close} />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filters</Text>
            <TouchableOpacity onPress={close}>
              <Ionicons name="close" size={26} color="#111" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Section title="Price">
              {PRICE_BANDS.map((band, i) => (
                <Option
                  key={band.label}
                  label={band.label}
                  selected={filters.price === i}
                  onPress={() =>
                    setFilters((prev) => ({ ...prev, price: prev.price === i ? null : i }))
                  }
                />
              ))}
            </Section>

            <Section title="Color">
              {colors.map((c) => (
                <Option
                  key={c}
                  label={c.charAt(0).toUpperCase() + c.slice(1)}
                  dot={COLORS[c]}
                  selected={filters.colors.includes(c)}
                  onPress={() => toggle("colors", c)}
                />
              ))}
            </Section>

            <Section title="Brand">
              {brands.map((b) => (
                <Option
                  key={b}
                  label={b}
                  selected={filters.brands.includes(b)}
                  onPress={() => toggle("brands", b)}
                />
              ))}
            </Section>

            <Section title="Size">
              {sizes.map((s) => (
                <Option
                  key={s}
                  label={s}
                  selected={filters.sizes.includes(s)}
                  onPress={() => toggle("sizes", s)}
                />
              ))}
            </Section>

            <View style={[styles.section, styles.offerRow]}>
              <Text style={styles.sectionTitle}>Only products on offer</Text>
              <Switch
                value={filters.offersOnly}
                onValueChange={(v) => setFilters((prev) => ({ ...prev, offersOnly: v }))}
                color="#111"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button mode="outlined" textColor="#111" onPress={clearFilters} style={styles.footerBtn}>
              Clear all
            </Button>
            <Button mode="contained" buttonColor="#111" onPress={close} style={styles.footerBtn}>
              Show {resultCount} results
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: "#111" },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 8 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  optionOn: { backgroundColor: "#111", borderColor: "#111" },
  optionText: { fontSize: 13, color: "#111" },
  optionTextOn: { color: "#fff" },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 6, borderWidth: 1, borderColor: "#ccc" },
  offerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  footer: { flexDirection: "row", gap: 10, marginTop: 12 },
  footerBtn: { flex: 1, borderRadius: 10 },
});