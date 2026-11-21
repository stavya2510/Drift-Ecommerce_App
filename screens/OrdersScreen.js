import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { Card, Text, Button, Divider } from "react-native-paper";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // newest first (sorted here, so no Firestore index is needed)
        fetched.sort(
          (a, b) =>
            (b.createdAt?.seconds ?? Number.MAX_SAFE_INTEGER) -
            (a.createdAt?.seconds ?? Number.MAX_SAFE_INTEGER)
        );
        setOrders(fetched);
        setError(null);
      },
      () => setError("Could not load your orders. Check your connection.")
    );

    return unsubscribe;
  }, []);

  const cancelOrder = async (order) => {
    setCancellingId(order.id);
    try {
      await updateDoc(doc(db, "orders", order.id), { status: "Cancelled" });
    } catch (e) {
      Alert.alert("Could not cancel", "Check your internet connection and try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const confirmCancel = (order) => {
    Alert.alert("Cancel order", `Cancel order #${order.id.slice(0, 6).toUpperCase()}?`, [
      { text: "No", style: "cancel" },
      { text: "Yes, cancel", style: "destructive", onPress: () => cancelOrder(order) },
    ]);
  };

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={!error && <Text style={styles.empty}>No orders yet.</Text>}
        renderItem={({ item }) => {
          const cancelled = item.status === "Cancelled";
          return (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.rowBetween}>
                  <Text style={styles.orderId}>#{item.id.slice(0, 6).toUpperCase()}</Text>
                  <Text style={[styles.status, { color: cancelled ? "#d32f2f" : "#2e7d32" }]}>
                    {item.status}
                  </Text>
                </View>
                <Text style={styles.date}>
                  {item.createdAt?.toDate ? item.createdAt.toDate().toDateString() : "Just now"}
                </Text>

                <Divider style={styles.divider} />

                {item.items?.map((i, idx) => (
                  <Text key={idx} style={styles.itemLine}>
                    {i.qty} × {i.title} (Size {i.size}) — ₹{i.price * i.qty}
                  </Text>
                ))}

                <Divider style={styles.divider} />

                <Text style={styles.deliver}>
                  Deliver to: {item.customerName} · {item.phone}
                </Text>
                <Text style={styles.address}>{item.address}</Text>
                <Text style={styles.total}>Total: ₹{item.totalAmount}</Text>

                {item.status === "Confirmed" && (
                  <Button
                    mode="outlined"
                    textColor="#d32f2f"
                    style={styles.cancelBtn}
                    loading={cancellingId === item.id}
                    disabled={cancellingId === item.id}
                    onPress={() => confirmCancel(item)}
                  >
                    Cancel order
                  </Button>
                )}
              </Card.Content>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 14 },
  error: { color: "#d32f2f", marginBottom: 8 },
  empty: { textAlign: "center", marginTop: 40, color: "#777" },
  card: { marginBottom: 12, backgroundColor: "#fff" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  orderId: { fontWeight: "800", fontSize: 15 },
  status: { fontWeight: "700" },
  date: { color: "#777", fontSize: 12, marginTop: 2 },
  divider: { marginVertical: 8 },
  itemLine: { fontSize: 13, marginBottom: 2 },
  deliver: { fontWeight: "600" },
  address: { color: "#555", fontSize: 13, marginTop: 2 },
  total: { fontWeight: "900", fontSize: 16, marginTop: 8 },
  cancelBtn: { marginTop: 12, borderColor: "#d32f2f" },
});