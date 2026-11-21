import React, { useContext, useState, useEffect } from "react";
import { View, ScrollView, Image, StyleSheet, Alert } from "react-native";
import { Text, Button, TextInput, Card, IconButton } from "react-native-paper";
import { collection, addDoc, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { CartContext } from "../context/CartContext";

export default function CartScreen({ navigation }) {
  const { cart, changeQty, removeFromCart, clearCart, totalAmount } = useContext(CartContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);

  // Pre-fill details saved from a previous order
  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "customers", user.uid));
        if (snap.exists()) {
          const d = snap.data();
          setName(d.name || "");
          setPhone(d.phone || "");
          setAddress(d.address || "");
        }
      } catch (e) {
        // no saved details yet, or offline: just leave the form empty
      }
    };
    loadProfile();
  }, []);

  const placeOrder = async () => {
    if (cart.length === 0) return;

    if (!name.trim()) return Alert.alert("Missing info", "Please enter your full name.");
    if (!/^\d{10}$/.test(phone)) return Alert.alert("Invalid phone", "Enter a 10-digit phone number.");
    if (address.trim().length < 10)
      return Alert.alert("Missing info", "Please enter your full delivery address with PIN code.");

    const user = auth.currentUser;
    if (!user) return Alert.alert("Not logged in", "Please log in again.");

    setPlacing(true);
    try {
      // 1. Save customer details for next time
      await setDoc(doc(db, "customers", user.uid), {
        name: name.trim(),
        phone,
        address: address.trim(),
        email: user.email,
      });

      // 2. Save the order
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userEmail: user.email,
        customerName: name.trim(),
        phone,
        address: address.trim(),
        items: cart.map((i) => ({
          id: i.id,
          title: i.title,
          price: i.price,
          size: i.size,
          qty: i.qty,
          image: i.image,
          category: i.category,
        })),
        totalAmount,
        status: "Confirmed",
        createdAt: serverTimestamp(),
      });

      clearCart();
      Alert.alert("Order placed! 🎉", "You can see it in the Orders tab.");
      navigation.navigate("Orders");
    } catch (e) {
      Alert.alert("Could not place order", "Check your internet connection and try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Your bag is empty.</Text>
        <Button mode="outlined" textColor="#111" onPress={() => navigation.navigate("Shop")}>
          Start shopping
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {cart.map((item) => (
        <Card key={`${item.id}-${item.size}`} style={styles.itemCard}>
          <View style={styles.itemRow}>
            <Image source={{ uri: item.image }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={2} style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSub}>Size {item.size} · ₹{item.price}</Text>
              <View style={styles.qtyRow}>
                <IconButton icon="minus" size={18} onPress={() => changeQty(item.id, item.size, -1)} />
                <Text style={styles.qty}>{item.qty}</Text>
                <IconButton icon="plus" size={18} onPress={() => changeQty(item.id, item.size, 1)} />
              </View>
            </View>
            <View style={styles.rightCol}>
              <Text style={styles.lineTotal}>₹{item.price * item.qty}</Text>
              <IconButton icon="delete-outline" size={20} onPress={() => removeFromCart(item.id, item.size)} />
            </View>
          </View>
        </Card>
      ))}

      <View style={styles.checkoutBox}>
        <Text style={styles.total}>Total: ₹{totalAmount}</Text>

        <Text style={styles.formTitle}>Delivery details</Text>
        <TextInput label="Full name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
        <TextInput
          label="Phone number"
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          maxLength={10}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Full address with PIN code"
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <Button
          mode="contained"
          buttonColor="#111"
          onPress={placeOrder}
          loading={placing}
          disabled={placing}
          contentStyle={{ paddingVertical: 6 }}
          style={styles.orderBtn}
        >
          Confirm & place order
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 12 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyText: { fontSize: 16, color: "#777" },
  itemCard: { marginBottom: 10, padding: 10, backgroundColor: "#fff" },
  itemRow: { flexDirection: "row", alignItems: "center" },
  thumb: { width: 70, height: 90, borderRadius: 8, marginRight: 10, backgroundColor: "#eee" },
  itemTitle: { fontWeight: "700", fontSize: 14 },
  itemSub: { color: "#666", marginTop: 2, fontSize: 13 },
  qtyRow: { flexDirection: "row", alignItems: "center" },
  qty: { fontWeight: "700", minWidth: 20, textAlign: "center" },
  rightCol: { alignItems: "flex-end" },
  lineTotal: { fontWeight: "800", fontSize: 15 },
  checkoutBox: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginVertical: 10 },
  total: { fontSize: 20, fontWeight: "900", marginBottom: 12 },
  formTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  input: { marginBottom: 10, backgroundColor: "#fff" },
  orderBtn: { marginTop: 8, borderRadius: 10 },
});