import { Alert } from 'react-native';
import { openDatabase, setupDatabase, addEjercicio, addEntreno, getEjercicios, getEntrenosData } from '../database/database';

export const resetDatabase = async () => {
  const db = await openDatabase();

  try {
    // Eliminar todas las tablas existentes
    await db.execAsync(`
      DROP TABLE IF EXISTS entrenos;
      DROP TABLE IF EXISTS registros;
      DROP TABLE IF EXISTS ejercicios;
    `);

    console.log('Base de datos eliminada.');

    // Reconfigurar la base de datos
    await setupDatabase();
    console.log('Base de datos reconfigurada.');

    // Insertar 10 registros en la tabla ejercicios
    const ejercicios = [
      { nombre: 'Press de Banca', grupo: 'Pecho' },
      { nombre: 'Sentadillas', grupo: 'Piernas' },
      { nombre: 'Peso Muerto', grupo: 'Espalda' },
      { nombre: 'Dominadas', grupo: 'Espalda' },
      { nombre: 'Fondos', grupo: 'Tríceps' },
      { nombre: 'Curl de Bíceps', grupo: 'Bíceps' },
      { nombre: 'Press Militar', grupo: 'Hombros' },
      { nombre: 'Gemelos', grupo: 'Piernas' },
      { nombre: 'Abdominales', grupo: 'Core' },
      { nombre: 'Remo con Mancuerna', grupo: 'Espalda' },
    ];

    // Insertamos los ejercicios en la base de datos
    for (const ejercicio of ejercicios) {
      await addEjercicio(ejercicio.nombre, ejercicio.grupo);
    }

    console.log('10 ejercicios agregados.');

    // Crear entrenos aleatorios después de agregar los ejercicios
    const allEjercicios = await getEjercicios(); // Obtener todos los ejercicios de la base de datos

    // Función para generar entrenos aleatorios
    const generarEntrenoAleatorio = async () => {
      const randomEjercicios = [];
      const numEjercicios = 4; // Generamos 3 ejercicios por entreno

      // Seleccionamos ejercicios aleatorios
      while (randomEjercicios.length < numEjercicios) {
        const randomIndex = Math.floor(Math.random() * allEjercicios.length);
        const ejercicioSeleccionado = allEjercicios[randomIndex];
        if (!randomEjercicios.includes(ejercicioSeleccionado)) {
          randomEjercicios.push(ejercicioSeleccionado);
        }
      }

      const nombre_entreno = `Entreno Aleatorio ${Math.floor(Math.random(1) * 1000)}`;
      const entreno = [];

      // Asignamos series y repeticiones aleatorias
      for (const ejercicio of randomEjercicios) {
        entreno.push({
          nombre_entreno: nombre_entreno,
          id_ejercicio: ejercicio.id_ejercicio,
          nombre_ejercicio: ejercicio.nombre_ejercicio,
          series: Math.floor(Math.random() * 4) + 3, // Entre 3 y 6 series
          repeticiones: Math.floor(Math.random() * 8) + 6, // Entre 6 y 12 repeticiones
        });
      }

      // Agregar el entreno a la base de datos
      await addEntreno(entreno);

      // Obtener el id del entreno agregado
      const entrenos = await getEntrenosData(nombre_entreno); // Obtener el ultimo entreno_id
      console.log(entrenos)
      const id_entreno = entrenos[0].id_entreno;

      console.log(id_entreno)

      // Agregar registros aleatorios a la tabla "registros"
      for (const ejercicio of entreno) {
        const fecha = new Date().toISOString(); // Fecha actual en formato ISO
        const repeticiones = ejercicio.repeticiones;
        const peso = Math.floor(Math.random() * 50) + 20; // Peso aleatorio entre 20 y 70 kg

        // Insertar un registro en la tabla "registros"
        await db.runAsync(`
          INSERT INTO registros (id_entreno, id_ejercicio, fecha, repeticiones, peso)
          VALUES (?, ?, ?, ?, ?);
        `, [id_entreno, ejercicio.id_ejercicio, fecha, repeticiones, peso]);
      }
    };

    // Crear 3 entrenos aleatorios y agregar registros
    await generarEntrenoAleatorio();
    await generarEntrenoAleatorio();
    await generarEntrenoAleatorio();

    Alert.alert('Base de datos reiniciada, 10 ejercicios agregados, 3 entrenos aleatorios creados y registros añadidos.');

  } catch (error) {
    console.error('Error al reiniciar la base de datos:', error);
    Alert.alert('Error al reiniciar la base de datos.', error.message);
  }
};
