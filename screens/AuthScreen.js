import React, { useState } from "react";
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

const friendlyError = (code) => {
  switch (code) {
    case "auth/invalid-email":
      return "That email address is not valid.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Wrong email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try logging in.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/network-request-failed":
      return "No internet connection.";
    default:
      return "Something went wrong. Please try again.";
  }
};

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing info", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (error) {
      Alert.alert("Authentication failed", friendlyError(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.header}>DRIFT</Text>
      <Text style={styles.sub}>
        {isLogin ? "Welcome back, drip awaits." : "Create your Drift account"}
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleAuth}
        loading={loading}
        disabled={loading}
        buttonColor="#111"
        style={styles.btn}
      >
        {isLogin ? "Login" : "Register"}
      </Button>

      <Button onPress={() => setIsLogin(!isLogin)} textColor="#111">
        {isLogin ? "New to Drift? Create account" : "Already have an account? Login"}
      </Button>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  header: { fontSize: 36, fontWeight: "900", textAlign: "center", letterSpacing: 4 },
  sub: { textAlign: "center", color: "#666", marginBottom: 24, marginTop: 6 },
  input: { marginBottom: 14, backgroundColor: "#fff" },
  btn: { marginTop: 8, paddingVertical: 6, borderRadius: 8 },
});