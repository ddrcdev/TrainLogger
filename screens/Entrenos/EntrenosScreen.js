import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { getEntrenos, getEntrenosByNombre } from '../../database/database';
import { useNavigation } from '@react-navigation/native';

const EntrenosScreen = () => {
  const [entrenos, setEntrenos] = useState([]); // Lista de entrenos
  const [selectedEntreno, setSelectedEntreno] = useState(null); // Entreno seleccionado
  const [registros, setRegistros] = useState([]); // Registros del entreno seleccionado
  const [showDetail, setShowDetail] = useState(false); // Control de la ventana de detalle
  const navigation = useNavigation();

  // Cargar entrenos al montar la pantalla
  useEffect(() => {
    const fetchEntrenos = async () => {
      const data = await getEntrenos();
      setEntrenos(data);
    };
    fetchEntrenos();
  }, []);

  // Manejo de selección de entreno
  const handleSelectEntreno = async (entreno) => {
    try {
      const registros = await getEntrenosByNombre(entreno.nombre_entreno);
      setSelectedEntreno(entreno);
      setRegistros(registros);
      setShowDetail(true);
    } catch (error) {
      console.error('Error al obtener los registros del entreno:', error);
      Alert.alert('Error', 'No se pudo cargar los registros del entreno.');
    }
  };

  // Cerrar ventana de detalle
  const closeDetail = () => {
    setShowDetail(false);
    setSelectedEntreno(null);
    setRegistros([]);
  };

  return (
    <View style={styles.container}>
      <Button
        title="Crear Nuevo Entreno"
        onPress={() => navigation.navigate('AñadirEntreno')}
      />

      <Text style={styles.title}>Lista de Entrenos</Text>
      <FlatList
        data={entrenos}
        keyExtractor={(item) => item.nombre_entreno}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.entrenoItem}
            onPress={() => handleSelectEntreno(item)}
          >
            <Text style={styles.entrenoName}>{item.nombre_entreno}</Text>
          </TouchableOpacity>
        )}
      />

      {showDetail && selectedEntreno && (
        <View style={styles.detailContainer}>
          <Text style={styles.detailTitle}>
            Detalles del Entreno: {selectedEntreno.nombre_entreno}
          </Text>
          <FlatList
            data={registros}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.registro}>
                {item.nombre_ejercicio} | {item.series}x
                {item.repeticiones}
              </Text>
            )}
          />
          <Button title="Cerrar" onPress={closeDetail} />
        </View>
      )}
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
    marginVertical: 16,
  },
  entrenoItem: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  entrenoName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    padding: 16,
    elevation: 5,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  registro: {
    fontSize: 16,
    paddingVertical: 4,
  },
});

export default EntrenosScreen;
