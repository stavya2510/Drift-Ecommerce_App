import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Text, Button, TextInput, Card, Avatar, ActivityIndicator } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";

function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={value ? styles.value : styles.empty}>{value || "Not added yet"}</Text>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const email = auth.currentUser?.email;

  const [profile, setProfile] = useState({ name: "", phone: "", address: "" });
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reload every time the Profile tab is opened
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const user = auth.currentUser;
        if (!user) return;
        setLoading(true);
        try {
          const snap = await getDoc(doc(db, "customers", user.uid));
          if (active) {
            const d = snap.exists() ? snap.data() : {};
            setProfile({ name: d.name || "", phone: d.phone || "", address: d.address || "" });
          }
        } catch (e) {
          // offline or no data yet: show empty profile
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const startEdit = () => {
    setForm(profile);
    setEditing(true);
  };

  const save = async () => {
    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      return Alert.alert("Invalid phone", "Enter a 10-digit phone number.");
    }
    setSaving(true);
    try {
      const clean = {
        name: form.name.trim(),
        phone: form.phone,
        address: form.address.trim(),
      };
      await setDoc(doc(db, "customers", auth.currentUser.uid), { ...clean, email }, { merge: true });
      setProfile(clean);
      setEditing(false);
    } catch (e) {
      Alert.alert("Could not save", "Check your internet connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => signOut(auth) },
    ]);
  };

  const initial = (profile.name || email || "?").charAt(0).toUpperCase();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#111" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <View style={styles.top}>
          <Avatar.Text size={80} label={initial} style={styles.avatar} color="#fff" />
          <Text style={styles.name}>{profile.name || "Your profile"}</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            {editing ? (
              <>
                <TextInput
                  label="Full name"
                  value={form.name}
                  onChangeText={(t) => setForm({ ...form, name: t })}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Phone number"
                  value={form.phone}
                  onChangeText={(t) => setForm({ ...form, phone: t.replace(/[^0-9]/g, "") })}
                  keyboardType="number-pad"
                  maxLength={10}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Address"
                  value={form.address}
                  onChangeText={(t) => setForm({ ...form, address: t })}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />
                <Text style={styles.hint}>Email: {email} (cannot be changed)</Text>

                <View style={styles.btnRow}>
                  <Button mode="outlined" textColor="#111" onPress={() => setEditing(false)} style={styles.btn}>
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    buttonColor="#111"
                    onPress={save}
                    loading={saving}
                    disabled={saving}
                    style={styles.btn}
                  >
                    Save
                  </Button>
                </View>
              </>
            ) : (
              <>
                <InfoRow label="Name" value={profile.name} />
                <InfoRow label="Phone number" value={profile.phone} />
                <InfoRow label="Email" value={email} />
                <InfoRow label="Address" value={profile.address} />

                <Button mode="contained" buttonColor="#111" onPress={startEdit} style={styles.editBtn}>
                  Edit profile
                </Button>
              </>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          icon="receipt"
          textColor="#111"
          onPress={() => navigation.navigate("Orders")}
          style={styles.ordersBtn}
          contentStyle={{ paddingVertical: 4 }}
        >
          My Orders
        </Button>
      </View>

      {/* Logout stays at the bottom of the screen */}
      <View style={styles.bottom}>
        <Button
          mode="outlined"
          icon="logout"
          textColor="#d32f2f"
          onPress={handleLogout}
          style={styles.logoutBtn}
          contentStyle={{ paddingVertical: 4 }}
        >
          Log out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContent: { flexGrow: 1, justifyContent: "space-between" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  top: { alignItems: "center", paddingVertical: 24 },
  avatar: { backgroundColor: "#111" },
  name: { fontSize: 20, fontWeight: "800", marginTop: 10, color: "#111" },
  card: { marginHorizontal: 14, marginBottom: 14, backgroundColor: "#fff" },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderColor: "#f0f0f0" },
  label: { fontSize: 12, color: "#888", fontWeight: "700", letterSpacing: 0.5, marginBottom: 2 },
  value: { fontSize: 15, color: "#111" },
  empty: { fontSize: 15, color: "#bbb", fontStyle: "italic" },
  input: { marginBottom: 10, backgroundColor: "#fff" },
  hint: { color: "#888", fontSize: 12, marginBottom: 12 },
  btnRow: { flexDirection: "row", gap: 10 },
  btn: { flex: 1 },
  editBtn: { marginTop: 16, borderRadius: 10 },
  ordersBtn: { marginHorizontal: 14, borderRadius: 10, backgroundColor: "#fff" },
  bottom: { padding: 14, paddingBottom: 24 },
  logoutBtn: { borderRadius: 10, borderColor: "#d32f2f" },
});