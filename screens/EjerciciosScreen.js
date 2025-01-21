import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, Alert } from 'react-native';
import { addEjercicio, getEjercicios } from '../database/database';

const EjerciciosScreen = () => {
  const [ejercicios, setEjercicios] = useState([]);
  const [nuevoEjercicio, setNuevoEjercicio] = useState({ nombre: '', grupo: '' });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  useEffect(() => {
    // Cargar los ejercicios al iniciar la pantalla
    const loadEjercicios = async () => {
      const fetchedEjercicios = await getEjercicios();
      setEjercicios(fetchedEjercicios);
    };
    loadEjercicios();
  }, []);

  const handleAddEjercicio = async () => {

    const { nombre, grupo } = nuevoEjercicio;
    
    // Validar los campos antes de agregar
    if (!nombre || !grupo) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    // Agregar el nuevo ejercicio
    await addEjercicio(nombre, grupo);
    // Mostrar mensaje de éxito
    setMensajeExito(`Ejercicio ${nombre} agregado con éxito.`);
    // Limpiar el formulario y volver a cargar los ejercicios
    setNuevoEjercicio({ nombre: '', grupo: '' });
    setMostrarFormulario(false);
    const fetchedEjercicios = await getEjercicios();
    setEjercicios(fetchedEjercicios);
  };

  return (
    <View style={styles.container}>
      {!mostrarFormulario && (
      <Button title="Nuevo ejercicio" onPress={() => setMostrarFormulario(!mostrarFormulario)} />
      )}
      {/* Mostrar el formulario solo si está activado */}
      {mostrarFormulario && (
        <View style={styles.formContainer}>
           <Button title="Guardar ejercicio" onPress={handleAddEjercicio} />
          <TextInput
            style={styles.input}
            placeholder="Nombre del ejercicio"
            value={nuevoEjercicio.nombre}
            onChangeText={(text) => setNuevoEjercicio({ ...nuevoEjercicio, nombre: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Grupo muscular"
            value={nuevoEjercicio.grupo}
            onChangeText={(text) => setNuevoEjercicio({ ...nuevoEjercicio, grupo: text })}
          />
         
        </View>
      )}

      {/* Mostrar mensaje de éxito al agregar un ejercicio */}
      {mensajeExito && <Text style={styles.successMessage}>{mensajeExito}</Text>}

      {/* Mostrar la lista de ejercicios */}
      <FlatList
        data={ejercicios}
        keyExtractor={(item) => item.id_ejercicio.toString()}
        renderItem={({ item }) => (
          <View style={styles.ejercicioItem}>
            <Text>{item.nombre_ejercicio} ({item.grupo})</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  formContainer: {
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 0,
    paddingLeft: 10,
    marginTop: 10,
  },
  successMessage: {
    color: 'green',
    marginVertical: 10,
  },
  ejercicioItem: {
    paddingVertical: 10,
  },
});

export default EjerciciosScreen;
