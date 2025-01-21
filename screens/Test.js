import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { checkdb } from '../database/database'; // Asegúrate de importar correctamente esta función
import { resetDatabase } from '../database/reset_db';

const TestScreen = () => {
  const takeInfoDb = async () => { 
    try {
      await checkdb();
    } catch (error) {
      console.error('Error al consultar la base de datos:', error);
    }
  };

  const resetDb = async () => {
    try {
      await resetDatabase();
    } catch (error) {
      console.error('Error al reiniciar la base de datos:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Check db" onPress={takeInfoDb} />
      <Button title="Reset Db" onPress={resetDb} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
});

export default TestScreen;

