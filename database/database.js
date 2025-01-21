import * as SQLite from 'expo-sqlite';

// Abre la base de datos de manera asíncrona (esto retornará una promesa)
export const openDatabase = async () => {
  const db = await SQLite.openDatabaseAsync('entrenosdb');
  return db;
};

// Configura la base de datos (crear tablas y insertar datos iniciales)
export const setupDatabase = async () => {
  const db = await openDatabase();

  // Ejecuta las sentencias SQL necesarias para crear las tablas
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS ejercicios (
      id_ejercicio INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_ejercicio TEXT,
      grupo TEXT
    );

    CREATE TABLE IF NOT EXISTS entrenos (
      id_entreno INTEGER NOT NULL,             -- ID como INTEGER, no AUTOINCREMENT
      nombre_entreno TEXT NOT NULL,                    -- Columna para el nombre del entreno
      id_ejercicio INTEGER,                    -- Referencia al ejercicio
      nombre_ejercicio TEXT,                   -- Columna para el nombre del ejercicio
      series INTEGER,                          -- Series asociadas al ejercicio
      repeticiones INTEGER,                    -- Repeticiones asociadas al ejercicio
      FOREIGN KEY (id_ejercicio) REFERENCES ejercicios(id_ejercicio) -- Relación con ejercicios
    );

    CREATE TABLE IF NOT EXISTS registros (
      id_registro INTEGER PRIMARY KEY AUTOINCREMENT,
      id_entreno INTEGER,
      id_ejercicio INTEGER,
      fecha TIMESTAMP,
      repeticiones INTEGER,
      peso INTEGER,
      FOREIGN KEY (id_entreno) REFERENCES entrenos(id_entreno),
      FOREIGN KEY (id_ejercicio) REFERENCES ejercicios(id_ejercicio)
    );
  `);

  console.log('Base de datos configurada correctamente');
};

export const checkdb = async () => {
  const db = await openDatabase();

  try {
    console.log('En checkdb... ')
    // Consulta para obtener las tablas en la base de datos
    const result = await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table';");
    
    // Imprimir las tablas en la consola
    if (result.length > 0) {
      console.log('Tablas en la base de datos:');
      console.log(result);
    } else {
      console.log('No hay tablas en la base de datos.');
    }
  } catch (error) {
    console.error('Error al consultar tablas:', error);
  }

  // Mensaje de confirmación
  console.log('Comprobación de tablas completada.');
};

// Función para agregar un ejercicio
export const addEjercicio = async (nombre, grupo) => {
  const db = await openDatabase();

  await db.execAsync(`
    INSERT INTO ejercicios (nombre_ejercicio, grupo)
    VALUES ('${nombre}', '${grupo}');
  `);

  console.log(`Ejercicio ${nombre} agregado.`);
};

// Función para obtener todos los ejercicios
export const getEjercicios = async () => {
  const db = await openDatabase();

  try {
    const result = await db.getAllAsync('SELECT * FROM ejercicios');
    if (result && Array.isArray(result)) {
      return result;
    } else {
      console.error('Error: La consulta no devolvió resultados válidos');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    return []; // Si hay un error, devolvemos un array vacío
  }
};

export const addEntreno = async (ejercicios) => {
  const db = await openDatabase();
  try {
    // Obtener el ID del último entreno y sumar 1
    const result = await db.getFirstAsync(`
      SELECT IFNULL(MAX(id_entreno), 0) + 1 AS newEntrenoId
      FROM entrenos;
    `);
    const newEntrenoId = result.newEntrenoId;
    const nombre_entreno = ejercicios[0].nombre_entreno
    // Insertar los ejercicios asociados al nuevo entreno
    for (const ejercicio of ejercicios) {
      await db.runAsync(
        `
        INSERT INTO entrenos (id_entreno, nombre_entreno, id_ejercicio, nombre_ejercicio, series, repeticiones)
        VALUES (?,?, ?, ?, ?, ?);
        `,
        [newEntrenoId, nombre_entreno, ejercicio.id_ejercicio, ejercicio.nombre_ejercicio, ejercicio.series, ejercicio.repeticiones]
      );
    }

    console.log(`Entreno '${nombre_entreno}' con ID ${newEntrenoId} agregado con ${ejercicios.length} ejercicios.`);
  } catch (error) {
    console.error('Error al agregar el entreno:', error);
    throw error;
  }
};

// Función para obtener todos los entrenos
export const getEntrenos = async () => {
  const db = await openDatabase();

  try {
    const entrenosUnicos = await db.getAllAsync('SELECT DISTINCT nombre_entreno FROM entrenos');
    if (entrenosUnicos && Array.isArray(entrenosUnicos)) {
      return entrenosUnicos;
    } else {
      console.error('Error: La consulta no devolvió resultados válidos');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    return []; // Si hay un error, devolvemos un array vacío

  }
};

export const getEntrenosData = async (entreno) => {
  const db = await openDatabase();

  try {
    // Consulta usando un parámetro para evitar inyecciones SQL
    const entrenos = await db.getAllAsync(
      'SELECT * FROM entrenos WHERE nombre_entreno = ?',
      [entreno]
    );

    // Validamos que los resultados sean válidos
    if (entrenos && Array.isArray(entrenos)) {
      return entrenos;
    } else {
      console.error('Error: La consulta no devolvió resultados válidos');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    return []; // Si hay un error, devolvemos un array vacío
  }
};


// Función para obtener los registros de un entreno por su nombre_entreno
export const getEntrenosByNombre = async (nombre_entreno) => {
  const db = await openDatabase();
  try {
    const result = await db.getAllAsync(`
      SELECT *
      FROM entrenos
      WHERE nombre_entreno = ?
    `, [nombre_entreno]);

    return result;
  } catch (error) {
    console.error('Error al obtener los entrenos:', error);
    throw error;
  }
};

// Función para obtener el id_entreno por el nombre del entreno
export const getEntrenoIdByNombre = async (nombre_entreno) => {
  const db = await openDatabase();
  try {
    // Buscar el id_entreno por el nombre del entreno
    const result = await db.getAsync(`
      SELECT id_entreno
      FROM entrenos
      WHERE nombre = ?
    `, [nombre_entreno]);

    // Verificar si se encontró el entreno
    if (result) {
      return result.id_entreno;
    } else {
      throw new Error('Entreno no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener el id_entreno por nombre:', error);
    throw error;
  }
};

export const getRegistrosByNombre = async (nombre_entreno) => {
  const db = await openDatabase();  
  try {
    // Obtener el id_entreno a partir del nombre del entreno
    const result = await db.getFirstAsync(`
      SELECT id_entreno
      FROM entrenos
      WHERE nombre_entreno = ?
    `, [nombre_entreno]);

    // Verificar si encontramos el id_entreno
    if (!result) {
      console.error('Entreno no encontrado');
      throw new Error('Entreno no encontrado');
    }

    const id_entreno = result.id_entreno;

    // Ahora que tenemos el id_entreno, obtener los registros correspondientes
    const registros = await db.getAllAsync(`
      SELECT *
      FROM registros
      WHERE id_entreno = ?
    `, [id_entreno]);

    return registros;
    
  } catch (error) {
    console.error('Error al obtener los registros:', error);
    throw error;
  }
};






