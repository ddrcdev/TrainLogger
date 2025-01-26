import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { addRegistros } from "../../database/database";

export default function EntrenoActivoScreen({ route }) {
  const navigation = useNavigation();
  const ejerciciosEntreno = route?.params?.ejerciciosEntreno || [];
  const [ejerciciosState, setEjerciciosState] = useState(ejerciciosEntreno);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);

  // Inicializar registros en función de las series
  useEffect(() => {
    const initializedEjercicios = ejerciciosState.map((exercise) => ({
      ...exercise,
      registros:
        exercise.registros ||
        Array.from({ length: exercise.series }, () => ({
          peso: "",
          repeticiones: "",
        })),
    }));
    setEjerciciosState(initializedEjercicios);
  }, []);

  const handleChangeSerie = (idEjercicio, index, field, value) => {
    setEjerciciosState((prevState) =>
      prevState.map((exercise) => {
        if (exercise.id_ejercicio === idEjercicio) {
          const updatedRegistros = exercise.registros.map(
            (registro, registroIndex) => {
              if (registroIndex === index) {
                return {
                  ...registro,
                  [field]: value,
                };
              }
              return registro;
            }
          );

          const isCompleted = updatedRegistros.every(
            (registro) => registro.peso !== "" && registro.repeticiones !== ""
          );

          return {
            ...exercise,
            registros: updatedRegistros,
            completado: isCompleted,
          };
        }
        return exercise;
      })
    );
  };

  const handleSelectExercise = (idEjercicio) => {
    setSelectedExerciseId(idEjercicio);
  };

  const handleSaveExercise = async () => {
    // Función interna para comprobar si todos los ejercicios están completados
    const areAllExercisesCompleted = ejerciciosState.every(
      (exercise) => exercise.completado
    );
    console.log(ejerciciosState);
    if (!areAllExercisesCompleted) {
      Alert.alert(
        "Faltan datos",
        "Por favor, asegúrate de completar todos los ejercicios antes de guardar."
      );
      return;
    }

    // Llamar a la función de base de datos para guardar los datos
    await addRegistros(ejerciciosState);
    console.log("Guardando datos en la base de datos:", ejerciciosState[0]);

    // Mostrar el mensaje de éxito y retrasar la navegación
    Alert.alert("Éxito", "Entrenamiento guardado en la base de datos.", [
      {
        text: "OK",
        onPress: () => {
          navigation.navigate("Registro", {
            initialSelectedEntreno: ejerciciosState[0]?.nombre_entreno,
          }); // Navegar tras cerrar el Alert
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <FlatList
          data={ejerciciosState}
          keyExtractor={(item) => item.id_ejercicio.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelectExercise(item.id_ejercicio)}
            >
              <View style={styles.exerciseItem}>
                <Text style={styles.exerciseName}>
                  {item.nombre_ejercicio} ({item.series}x{item.repeticiones})
                </Text>
                <Text style={styles.statusIcon}>
                  {item.completado ? "✅" : "❌"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={styles.bottomContainer}>
        {selectedExerciseId && (
          <View style={styles.exerciseDetail}>
            <Text style={styles.detailTitle}>
              Ejercicio:{" "}
              {
                ejerciciosState.find(
                  (exercise) => exercise.id_ejercicio === selectedExerciseId
                )?.nombre_ejercicio
              }
            </Text>

            <ScrollView style={styles.seriesScroll}>
              {(() => {
                const selectedExercise = ejerciciosState.find(
                  (exercise) => exercise.id_ejercicio === selectedExerciseId
                );

                if (!selectedExercise) {
                  return (
                    <Text>Ejercicio no encontrado o no seleccionado.</Text>
                  );
                }

                return selectedExercise.registros.map((registro, index) => (
                  <View key={index} style={styles.serieContainer}>
                    <Text>Serie {index + 1}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Repeticiones"
                      keyboardType="numeric"
                      value={registro.repeticiones}
                      onChangeText={(value) =>
                        handleChangeSerie(
                          selectedExercise.id_ejercicio,
                          index,
                          "repeticiones",
                          value
                        )
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Peso"
                      keyboardType="numeric"
                      value={registro.peso}
                      onChangeText={(value) =>
                        handleChangeSerie(
                          selectedExercise.id_ejercicio,
                          index,
                          "peso",
                          value
                        )
                      }
                    />
                  </View>
                ));
              })()}
            </ScrollView>
          </View>
        )}
      </View>
              <View style={styles.buttonContainer}>
          <Button
            title="Ir al temporizador"
            onPress={() => navigation.navigate("Timer")}
          />
          <Button title="Guardar Entreno" onPress={handleSaveExercise} />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  topContainer: {
    flexShrink: 0,
    flexGrow: 0,
    flexBasis: "auto",
    marginBottom: 1,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 1,
    marginBottom: 80,
    margin: 10
  },
  exerciseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusIcon: {
    fontSize: 20,
  },
  exerciseDetail: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  serieContainer: {
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: "column", // Cambia a 'column' si deseas que los botones estén en una columna
    justifyContent: "space-between", // Espaciado entre botones
    alignItems: "center", // Alineación centrada de los botones
    paddingVertical: 5, // Añadir algo de padding horizontal para no pegar los botones a los bordes
    height: 100,
    borderTopWidth: 3,  // Aquí defines el grosor del borde superior
    borderTopColor: "grey",  // Aquí defines el color del borde superior, puedes cambiarlo por el color que prefieras
    borderTopStyle: "solid",  // Establece el estilo del borde, puede ser 'solid', 'dashed', 'dotted', etc.
  },
  seriesScroll: {
    flex: 1,
    marginBottom: 60,
  },
});
