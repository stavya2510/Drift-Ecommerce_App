import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { CartProvider } from "./context/CartContext";
import CustomHeader from "./components/CustomHeader";
import HomeScreen from "./screens/HomeScreen";
import ProductDetailScreen from "./screens/ProductDetailScreen";
import CartScreen from "./screens/CartScreen";
import OrdersScreen from "./screens/OrdersScreen";
import ProfileScreen from "./screens/ProfileScreen";

import FavoritesScreen from "./screens/FavoritesScreen";
import FilterModal from "./components/FilterModal";
import { FavoritesProvider } from "./context/FavoritesContext";
import { FilterProvider } from "./context/FilterContext";

import { ActivityIndicator } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import SplashScreen from "./screens/SplashScreen";
import AuthScreen from "./screens/AuthScreen";

import { CATEGORIES } from "./constants";
import { ProductsProvider } from "./context/ProductsContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const TopTab = createMaterialTopTabNavigator();

function CategoryTopTabs() {
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader showSearch={true} />
      <FilterModal />
      <TopTab.Navigator
        screenOptions={{
          tabBarScrollEnabled: true,
          tabBarIndicatorStyle: { backgroundColor: "#111", height: 3 },
          tabBarLabelStyle: { fontWeight: "700", fontSize: 12 },
          tabBarItemStyle: { width: 115 },
        }}
      >
        {CATEGORIES.map((cat) => (
          <TopTab.Screen key={cat} name={cat} component={HomeScreen} />
        ))}
      </TopTab.Navigator>
    </View>
  );
}

function ShopStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CategoryTabs" component={CategoryTopTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Product Details" }} />
    </Stack.Navigator>
  );
}

function MainBottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#888",
        tabBarIcon: ({ color, size }) => {
          let icon = "storefront-outline";
          if (route.name === "Favorites") icon = "heart-outline";
          if (route.name === "Cart") icon = "bag-handle-outline";
          if (route.name === "Orders") icon = "receipt-outline";
          if (route.name === "Profile") icon = "person-outline";
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Shop" component={ShopStack} />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ headerShown: true, header: () => <CustomHeader showSearch={false} /> }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ headerShown: true, header: () => <CustomHeader showSearch={false} /> }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ headerShown: true, header: () => <CustomHeader showSearch={false} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: true, header: () => <CustomHeader showSearch={false} /> }}
      />
    </Tab.Navigator>
  );
}

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerLogo}>DRIFT</Text>
        <Text style={styles.drawerSub}>Categories & Menu</Text>
      </View>

      {CATEGORIES.map((cat) => (
        <DrawerItem
          key={cat}
          label={cat}
          onPress={() => {
            props.navigation.navigate("MainTabs", {
              screen: "Shop",
              params: { screen: "CategoryTabs", params: { screen: cat } },
            });
            props.navigation.closeDrawer();
          }}
        />
      ))}

            <DrawerItem
        label="Favorites"
        icon={({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />}
        onPress={() => {
          props.navigation.navigate("MainTabs", { screen: "Favorites" });
          props.navigation.closeDrawer();
        }}
      />

      <DrawerItem
        label="My Orders"
        icon={({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />}
        onPress={() => {
          props.navigation.navigate("MainTabs", { screen: "Orders" });
          props.navigation.closeDrawer();
        }}
      />
            <DrawerItem
        label="Profile"
        icon={({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />}
        onPress={() => {
          props.navigation.navigate("MainTabs", { screen: "Profile" });
          props.navigation.closeDrawer();
        }}
      />
    </DrawerContentScrollView>
  );
}

function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="MainTabs" component={MainBottomTabs} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!authReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <CartProvider>
  <ProductsProvider>
    {user ? (
     <FavoritesProvider userId={user.uid}>
  <FilterProvider>
    <NavigationContainer>
      <AppDrawer />
    </NavigationContainer>
  </FilterProvider>
</FavoritesProvider>
    ) : (
      <AuthScreen />
    )}
  </ProductsProvider>
</CartProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  drawerHeader: { padding: 20, backgroundColor: "#111", marginBottom: 10 },
  drawerLogo: { color: "#fff", fontSize: 26, fontWeight: "900", letterSpacing: 4 },
  drawerSub: { color: "#bbb", fontSize: 12, marginTop: 4 },
});