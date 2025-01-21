import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { getEjercicios, addEntreno } from '../../database/database';

const AddEntrenoScreen = () => {
  const [ejercicios, setEjercicios] = useState([]); // Lista de ejercicios disponibles
  const [selectedEjercicio, setSelectedEjercicio] = useState(null); // Ejercicio seleccionado
  const [series, setSeries] = useState(''); // Series del ejercicio
  const [repeticiones, setRepeticiones] = useState(''); // Repeticiones del ejercicio
  const [entrenoNombre, setEntrenoNombre] = useState(''); // Nombre del entreno
  const [entrenoEjercicios, setEntrenoEjercicios] = useState([]); // Ejercicios del entreno actual
  const [isNombreFixed, setIsNombreFixed] = useState(false); // Estado para controlar si el nombre del entreno es editable

  useEffect(() => {
    // Cargar los ejercicios desde la base de datos al montar la pantalla
    const fetchEjercicios = async () => {
      const data = await getEjercicios();
      setEjercicios(data);
    };
    fetchEjercicios();
  }, []);

  const handleAddEjercicio = () => {
    if (!selectedEjercicio || !series || !repeticiones) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    if (!entrenoNombre.trim()) {
      Alert.alert('Error', 'Por favor introduce un nombre para el entreno.');
      return;
    }

    if (!isNombreFixed) {
      setIsNombreFixed(true); // Bloquear el campo de nombre del entreno una vez se agrega un ejercicio
    }

    // Agregar el ejercicio al entreno actual
    const newEjercicio = {
      nombre_entreno: entrenoNombre,
      id_ejercicio: selectedEjercicio.id_ejercicio,
      nombre_ejercicio: selectedEjercicio.nombre_ejercicio,
      series: parseInt(series),
      repeticiones: parseInt(repeticiones),
    };

    setEntrenoEjercicios([...entrenoEjercicios, newEjercicio]);

    // Limpiar los campos de entrada
    setSelectedEjercicio(null);
    setSeries('');
    setRepeticiones('');
  };

  const handleSaveEntreno = async () => {
    if (entrenoEjercicios.length === 0) {
      Alert.alert('Error', 'No hay ejercicios en el entreno para guardar.');
      return;
    }

    try {
      // Guardar el entreno en la base de datos
      await addEntreno(entrenoEjercicios);
      Alert.alert('Éxito', 'Entreno guardado correctamente.');

      // Resetear el estado
      setEntrenoNombre('');
      setEntrenoEjercicios([]);
      setIsNombreFixed(false);
    } catch (error) {
      console.error('Error al guardar el entreno:', error);
      Alert.alert('Error', 'Hubo un problema al guardar el entreno.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Entreno</Text>

      {/* Campo para el nombre del entreno */}
      <TextInput
        style={[styles.input, isNombreFixed && styles.disabledInput]}
        placeholder="Nombre del entreno"
        value={entrenoNombre}
        onChangeText={setEntrenoNombre}
        editable={!isNombreFixed} // Deshabilitar si ya se fijó el nombre
      />

      {/* Selección de ejercicios */}
      <Text style={styles.label}>Seleccionar ejercicio:</Text>
      <FlatList
        data={ejercicios}
        keyExtractor={(item) => item.id_ejercicio.toString()}
        renderItem={({ item }) => (
          <Text
            style={[
              styles.ejercicio,
              item.id_ejercicio === selectedEjercicio?.id_ejercicio &&
                styles.selected,
            ]}
            onPress={() => setSelectedEjercicio(item)}
          >
            {item.nombre_ejercicio} ({item.grupo})
          </Text>
        )}
      />

      {/* Campos para series y repeticiones */}
      <TextInput
        style={styles.input}
        placeholder="Series"
        keyboardType="numeric"
        value={series}
        onChangeText={setSeries}
      />
      <TextInput
        style={styles.input}
        placeholder="Repeticiones"
        keyboardType="numeric"
        value={repeticiones}
        onChangeText={setRepeticiones}
      />

      <Button title="Agregar ejercicio al entreno" onPress={handleAddEjercicio} />

      {/* Tabla de ejercicios en el entreno */}
      <Text style={styles.label}>Ejercicios en este entreno:</Text>
      <FlatList
        data={entrenoEjercicios}
        keyExtractor={(item, index) => index}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>
              {item.nombre_ejercicio}: {item.series}x{item.repeticiones} 
            </Text>
          </View>
        )}
      />

      <Button title="Guardar entreno" onPress={handleSaveEntreno} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  disabledInput: {
    backgroundColor: '#e0e0e0',
  },
  ejercicio: {
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
  },
  selected: {
    backgroundColor: '#d3f9d8',
  },
  row: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default AddEntrenoScreen;
