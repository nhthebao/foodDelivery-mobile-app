import { Tabs } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name='index'/>
        <Tabs.Screen name='checkout'/>
        <Tabs.Screen name='favorites'/>
        <Tabs.Screen name='profileScreen'/>
    </Tabs>
  )
}

export default _layout