import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Ionicons name="flash" size={64} color="#fff" />
      <Text style={styles.logo}>DRIFT</Text>
      <Text style={styles.tagline}>GEN-Z STREETWEAR & ESSENTIALS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", justifyContent: "center", alignItems: "center" },
  logo: { fontSize: 42, fontWeight: "900", color: "#fff", letterSpacing: 6, marginTop: 12 },
  tagline: { fontSize: 12, color: "#aaa", letterSpacing: 2, marginTop: 8 },
});