import React from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const index = () => {
  return (
    <SafeAreaView edges={["top"]}>
      <Text>My favorite</Text>
    </SafeAreaView>
  )
}

export default index