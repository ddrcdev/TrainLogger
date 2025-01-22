import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, Alert } from 'react-native';
import { addEjercicio, getEjercicios } from '../database/database';
import {Picker} from '@react-native-picker/picker';


const EjerciciosScreen = () => {
  const [ejercicios, setEjercicios] = useState([]);
  const [ejerciciosFiltrados, setEjerciciosFiltrados] = useState([]);
  const [nuevoEjercicio, setNuevoEjercicio] = useState({ nombre: '', grupo: '' });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('');  // Inicializar en vacío para mostrar "Todos"
  const [grupos, setGrupos] = useState([]);

  useEffect(() => {
    // Cargar los ejercicios y los grupos al iniciar la pantalla
    const loadEjercicios = async () => {
      const fetchedEjercicios = await getEjercicios();
      setEjercicios(fetchedEjercicios);

      // Obtener los grupos únicos de los ejercicios
      const gruposUnicos = [...new Set(fetchedEjercicios.map((ejercicio) => ejercicio.grupo))];
      setGrupos(gruposUnicos);
    };
    loadEjercicios();
  }, []);

  useEffect(() => {
    // Filtrar los ejercicios según el grupo seleccionado
    const filteredEjercicios = grupoSeleccionado && grupoSeleccionado !== 'all'
      ? ejercicios.filter((ejercicio) => ejercicio.grupo === grupoSeleccionado)
      : ejercicios;  // Si no hay grupo seleccionado o es "Todos", no se aplica ningún filtro
    
    setEjerciciosFiltrados(filteredEjercicios); // Actualizar la lista filtrada
  }, [grupoSeleccionado, ejercicios]);  // Recalcular cuando cambian `grupoSeleccionado` o `ejercicios`

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
      {/* Botón para mostrar el formulario */}
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

      {/* Filtro por grupo */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por grupo:</Text>
        <Picker
          selectedValue={grupoSeleccionado}
          onValueChange={(itemValue) => setGrupoSeleccionado(itemValue)}
          style={styles.picker}
        >
        <Picker.Item label="Todos" value="all" />
          {grupos.map((grupo, index) => (
            <Picker.Item key={index} label={grupo} value={grupo} />
          ))}
        </Picker>
      </View>

      {/* Lista de ejercicios filtrados */}
      <FlatList
        data={ejerciciosFiltrados}
        keyExtractor={(item) => item.id_ejercicio.toString()}
        renderItem={({ item }) => (
          <View style={styles.ejercicioItem}>
            <Text style={styles.ejercicioText}>
              {item.nombre_ejercicio} ({item.grupo})
            </Text>
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
    marginBottom: 10,
    paddingLeft: 10,
    marginTop: 10,
  },
  successMessage: {
    color: 'green',
    marginVertical: 10,
  },
  filterContainer: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    height: 53,
    color: 'black',  // Asegúrate de que el texto sea visible
  },
  ejercicioItem: {
    paddingVertical: 10,
  },
  ejercicioText: {
    fontSize: 16,
  },
});

export default EjerciciosScreen;
