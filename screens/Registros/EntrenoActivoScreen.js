import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function EntrenoActivoScreen({ route }) {
  const navigation = useNavigation();
  const ejerciciosEntreno = route?.params?.ejerciciosEntreno || [];
  const [ejerciciosState, setEjerciciosState] = useState(ejerciciosEntreno);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    if (selectedExercise?.series && typeof selectedExercise.series === 'number') {
      // Si `series` es un número, crear un array con ese número de objetos
      const seriesArray = Array.from({ length: selectedExercise.series }, () => ({
        repeticiones: '',
        peso: '',
      }));
      setSelectedExercise((prevState) => ({
        ...prevState,
        series: seriesArray,
        completado: false, // Inicialmente no completado
      }));
    }
  }, [selectedExercise]);

  const handleChangeSerie = (idEjercicio, index, field, value) => {
    if (!Array.isArray(selectedExercise.series)) return;

    const updatedSeries = selectedExercise.series.map((serie, serieIndex) => {
      if (serieIndex === index) {
        return {
          ...serie,
          [field]: value,
        };
      }
      return serie;
    });

    const isCompleted = updatedSeries.every(
      (serie) => serie.peso !== '' && serie.repeticiones !== ''
    );

    // Actualizar `selectedExercise` y sincronizar con `ejerciciosState`
    const updatedExercise = {
      ...selectedExercise,
      series: updatedSeries,
      completado: isCompleted,
    };

    setSelectedExercise(updatedExercise);

    // Guardar los cambios en el array `ejerciciosState`
    setEjerciciosState((prevState) =>
      prevState.map((exercise) =>
        exercise.id_ejercicio === idEjercicio ? updatedExercise : exercise
      )
    );
  };

  const handleSaveExercise = () => {
    if (!selectedExercise?.completado) {
      Alert.alert(
        'Espera suh primo',
        'Por favor, completa todos los campos antes de continuar.'
      );
      return;
    }
    Alert.alert('Guardado', 'Ejercicio guardado con éxito.');
  };

  const handleSelectExercise = (exercise) => {
    // Guardar cambios del ejercicio anterior
    if (selectedExercise) {
      setEjerciciosState((prevState) =>
        prevState.map((ex) =>
          ex.id_ejercicio === selectedExercise.id_ejercicio
            ? selectedExercise
            : ex
        )
      );
    }
    // Seleccionar el nuevo ejercicio
    setSelectedExercise(exercise.series ? exercise : { ...exercise, series: [] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <FlatList
          data={ejerciciosState}
          keyExtractor={(item) => item.id_ejercicio.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectExercise(item)}>
              <View style={styles.exerciseItem}>
                <Text style={styles.exerciseName}>{item.nombre_ejercicio}</Text>
                <Text style={styles.statusIcon}>
                  {item.completado ? '✅' : '❌'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={styles.bottomContainer}>
        {selectedExercise && (
          <View style={styles.exerciseDetail}>
            <Text style={styles.detailTitle}>
              Ejercicio: {selectedExercise?.nombre_ejercicio || 'No seleccionado'}
            </Text>

            <ScrollView style={styles.seriesScroll}>
              {Array.isArray(selectedExercise.series) &&
                selectedExercise.series.map((serie, index) => (
                  <View key={index} style={styles.serieContainer}>
                    <Text>Serie {index + 1}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Repeticiones"
                      keyboardType="numeric"
                      value={serie.repeticiones}
                      onChangeText={(value) =>
                        handleChangeSerie(
                          selectedExercise.id_ejercicio,
                          index,
                          'repeticiones',
                          value
                        )
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Peso"
                      keyboardType="numeric"
                      value={serie.peso}
                      onChangeText={(value) =>
                        handleChangeSerie(
                          selectedExercise.id_ejercicio,
                          index,
                          'peso',
                          value
                        )
                      }
                    />
                  </View>
                ))}
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
