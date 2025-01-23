import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import {Picker} from '@react-native-picker/picker'
import { getEntrenos, getRegistrosByNombre, getEntrenosData, getEjercicios } from '../../database/database'; // Asumiendo que estas funciones ya existen en tu base de datos
import {useNavigation} from '@react-navigation/native';

export default function RegistrarEntrenoScreen({}) {

  const navigation = useNavigation();
  const [entrenos, setEntrenos] = useState([]); // Lista de entrenos disponibles
  const [selectedEntreno, setSelectedEntreno] = useState(null); // Entreno seleccionado
  const [registros, setRegistros] = useState([]);
  const [ejerciciosEntreno, setEjerciciosEntreno] = useState([]);

  useEffect(() => {
    // Cargar los entrenos desde la base de datos al montar la pantalla
    const fetchEntrenos = async () => {
      const data = await getEntrenos(); // Obtener entrenos únicos de la base de datos
      setEntrenos(data);
    };
    fetchEntrenos();
  }, []);

  useEffect(() => {
    // Cargar los registros del entreno seleccionado
    const fetchRegistros = async () => {
      if (selectedEntreno) {
        const registrosData = await getRegistrosByNombre(selectedEntreno);
        const ejercicios = await getEjercicios(); 
        console.log("Ejerc",ejercicios)

        // Añadir el nombre_ejercicio a cada registro iterando en ejercicios
        const registrosUpdated = registrosData.map((registro) => {
          // Buscar el ejercicio correspondiente en el array de ejercicios
          const ejercicioEncontrado = ejercicios.find(ejercicio => ejercicio.id_ejercicio === registro.id_ejercicio);
          
          // Si encontramos el ejercicio, obtenemos su nombre, si no, asignamos 'Desconocido'
          const nombreEjercicio = ejercicioEncontrado ? ejercicioEncontrado.nombre_ejercicio : 'Desconocido';

          return { ...registro, nombre_ejercicio: nombreEjercicio };
        });

        setRegistros(registrosUpdated);
      }
    };
    fetchRegistros();
  }, [selectedEntreno]);

  const formatFecha = (fechaCompleta) => {
    const fechaObj = new Date(fechaCompleta);
  
    // Obtener partes de la fecha
    const dia = fechaObj.toISOString().split('T')[0]; // Parte de la fecha (YYYY-MM-DD)
    const hora = fechaObj.toTimeString().split(' ')[0]; // Parte de la hora (HH:mm:ss)
  
    return { dia, hora };
  };

  const handleStartNewEntreno = async () => {
    try { 
      if (selectedEntreno) {
        const ejerciciosEntreno = await getEntrenosData(selectedEntreno); // Obtener los datos de los entrenos
        
        if (ejerciciosEntreno && ejerciciosEntreno.length > 0) {
          setEjerciciosEntreno(ejerciciosEntreno);
          navigation.navigate('EntrenoActivo', {ejerciciosEntreno})
        } else {
          console.log('No se han encontrado ejercicios para este entreno.');
        }
      }
    } catch (error) {
      setLoading(false); // Ocultar indicador de carga en caso de error
      console.error('Error al obtener los datos del entreno:', error);
    }
  };



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Nuevo Entreno</Text>

      {/* Desplegable de entrenos */}
      <Picker
        selectedValue={selectedEntreno}
        onValueChange={(itemValue) => setSelectedEntreno(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Selecciona un entreno" value={null} />
        {entrenos.map((entreno) => (
          <Picker.Item key={entreno.nombre_entreno} label={entreno.nombre_entreno} value={entreno.nombre_entreno} />
        ))}
      </Picker>

      {/* Botón para crear un nuevo entreno */}
      <Button
        title="Empezar nuevo entreno"
        onPress={handleStartNewEntreno}
      />

      {/* Tabla de registros */}
      <Text style={styles.label}>Registros del entreno:</Text>
      <FlatList
        data={registros}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>
              {formatFecha(item.fecha).dia} ({formatFecha(item.fecha).hora})
            </Text>
            <Text>
              {item.nombre_ejercicio}: {item.peso} kg // {item.repeticiones} reps 
            </Text>
          </View>
        )}
      />
    </View>
  );
}

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
  picker: {
    height: 50,
    marginBottom: 16,
  },
  row: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

