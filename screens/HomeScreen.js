import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

function HomeScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // Aquí puedes manejar lo que quieras antes de que la pantalla sea removida
      // Por ejemplo, mostrar una alerta de confirmación:
      e.preventDefault();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Button
        title="Registrar Entreno"
        onPress={() => navigation.navigate("Registro")}
      />
      <Button
        title="Entrenos"
        onPress={() => navigation.navigate("Entrenos")}
      />
      <Button
        title="Ejercicios"
        onPress={() => navigation.navigate("Ejercicios")}
      />
      <Button title="Test" onPress={() => navigation.navigate("Test")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    gap: 20,
  },
});
export default HomeScreen;
