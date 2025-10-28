import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

const _layout = () => {
  return (
    <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ff6a00",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderTopColor: "#eee",
          height: 76,
          paddingBottom: 6,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}>
        <Tabs.Screen name='index' options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}/>
        <Tabs.Screen name='checkout' options={{
          title: "Checkout",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}/>
        <Tabs.Screen name='favorites' options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}/>
        <Tabs.Screen name='profileScreen' options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}/>
    </Tabs>
  )
}

export default _layout