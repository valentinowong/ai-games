import { router } from "expo-router";
import { Button, StyleSheet, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
        <Button title="Play Snake" onPress={() => router.push("snake")} />
        <View style={styles.separator} />
        <Button title="Play Pong" onPress={() => router.push("pong")} />
        <View style={styles.separator} />
        <Button title="Play Fast Math" onPress={() => router.push("math")} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  separator: {
    marginVertical: 15,
    height: 1,
    width: '80%',
  }
});