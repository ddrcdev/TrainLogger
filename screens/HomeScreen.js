import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import {useNavigation} from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Button title="Registrar Entreno" onPress={() => navigation.navigate('Registro')} />
      <Button title="Entrenos" onPress={() => navigation.navigate('Entrenos')} />
      <Button title="Ejercicios" onPress={() => navigation.navigate('Ejercicios')} />
      <Button title="Test" onPress={() => navigation.navigate('Test')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default HomeScreen;