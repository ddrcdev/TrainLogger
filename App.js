import React, { useEffect } from 'react';
import {createStaticNavigation} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import RegistrarEntrenoScreen from './screens/Registros/HomeEntrenoScreen';
import EntrenoActivoScreen from './screens/Registros/EntrenoActivoScreen';
import EntrenosScreen from './screens/Entrenos/EntrenosScreen';
import AddEntrenoScreen from './screens/Entrenos/AddEntrenoScreen';
import EjerciciosScreen from './screens/EjerciciosScreen';
import TestScreen from './screens/Test';
import { setupDatabase } from './database/database';
// Añadir una clave para cada screen asociada a 
// un objeto importado desde la carpeta ./screens/

const RootStack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    Entrenos: EntrenosScreen,
    AñadirEntreno: AddEntrenoScreen,
    Ejercicios: EjerciciosScreen,
    Registro: RegistrarEntrenoScreen,
    EntrenoActivo: EntrenoActivoScreen,
    Test: TestScreen
  },
});

// Crea el objeto para navegación, estático
const Navigation = createStaticNavigation(RootStack);
console.log("Debuggin")
export default function App() {
  useEffect(() => {
    // Llamamos a setupDatabase cuando la app se inicializa
    setupDatabase();
  }, []);
  return <Navigation />;
}