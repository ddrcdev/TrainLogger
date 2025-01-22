import React, { useState, useEffect, useFocusEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, FlatList, StyleSheet, Alert, TouchableOpacity, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function EntrenoActivoScreen({ route }) {
  const navigation = useNavigation();
  const ejerciciosEntreno = route?.params?.ejerciciosEntreno || [];
  const [ejerciciosState, setEjerciciosState] = useState(ejerciciosEntreno);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);

  // Inicializar registros en función de las series
  useEffect(() => {
    const initializedEjercicios = ejerciciosState.map((exercise) => ({
      ...exercise,
      registros: exercise.registros || Array.from({ length: exercise.series }, () => ({ peso: '', repeticiones: '' })),
    }));
    setEjerciciosState(initializedEjercicios);
  }, []);

  const handleChangeSerie = (idEjercicio, index, field, value) => {
    setEjerciciosState((prevState) =>
      prevState.map((exercise) => {
        if (exercise.id_ejercicio === idEjercicio) {
          const updatedRegistros = exercise.registros.map((registro, registroIndex) => {
            if (registroIndex === index) {
              return {
                ...registro,
                [field]: value,
              };
            }
            return registro;
          });

          const isCompleted = updatedRegistros.every(
            (registro) => registro.peso !== '' && registro.repeticiones !== ''
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

  const handleSaveExercise = () => {
    // Función interna para comprobar si todos los ejercicios están completados
    const areAllExercisesCompleted = ejerciciosState.every((exercise) => exercise.completado);

    if (!areAllExercisesCompleted) {
      Alert.alert(
        'Faltan datos',
        'Por favor, asegúrate de completar todos los ejercicios antes de guardar.'
      );
      return;
    }

    // TODO: Llamar a la función de base de datos para guardar los datos
    // Aquí deberías importar y llamar a la función correspondiente de `database/database.js`
    console.log('Guardando datos en la base de datos:', ejerciciosState);

    Alert.alert('Éxito', 'Entrenamiento guardado en la base de datos.');
    navigation.goBack(); // Navegar fuera de la pantalla tras guardar
  };

  const handleSelectExercise = (idEjercicio) => {
    setSelectedExerciseId(idEjercicio);
  };

  const handleBackPress = () => {
    const hasUnsavedData = ejerciciosState.some((exercise) =>
      exercise.registros.some((registro) => registro.peso !== '' || registro.repeticiones !== '')
    );

    if (hasUnsavedData) {
      Alert.alert(
        'Salir sin guardar',
        'Tienes datos sin guardar. ¿Estás seguro de que quieres salir?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
      return true; // Prevenir que la acción por defecto cierre la pantalla
    }

    return false; // Permitir salir si no hay datos sin guardar
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <FlatList
          data={ejerciciosState}
          keyExtractor={(item) => item.id_ejercicio.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectExercise(item.id_ejercicio)}>
              <View style={styles.exerciseItem}>
                <Text style={styles.exerciseName}>
                  {item.nombre_ejercicio} ({item.series}x{item.repeticiones})
                </Text>
                <Text style={styles.statusIcon}>
                  {item.completado ? '✅' : '❌'}
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
              Ejercicio:{' '}
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
                  return <Text>Ejercicio no encontrado o no seleccionado.</Text>;
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
                        handleChangeSerie(selectedExercise.id_ejercicio, index, 'repeticiones', value)
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Peso"
                      keyboardType="numeric"
                      value={registro.peso}
                      onChangeText={(value) =>
                        handleChangeSerie(selectedExercise.id_ejercicio, index, 'peso', value)
                      }
                    />
                  </View>
                ));
              })()}
            </ScrollView>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <Button title="Guardar Entreno" onPress={handleSaveExercise} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  topContainer: {
    flexShrink: 0,
    flexGrow: 0,
    flexBasis: 'auto',
    marginBottom: 1,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusIcon: {
    fontSize: 20,
  },
  exerciseDetail: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  serieContainer: {
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  seriesScroll: {
    flex: 1,
    marginBottom: 60,
  },
});
