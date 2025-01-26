import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const TimerScreen = () => {
  const navigation = useNavigation();

  // Estado para manejar el tiempo, la entrada y el cronómetro
  const [time, setTime] = useState("02:00");
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Nuevo estado para pausar el cronómetro
  const [timerId, setTimerId] = useState(null);
  const [initialTime, setInitialTime] = useState("00:00"); // Guardamos el tiempo inicial

  // Parsear el tiempo en formato mm:ss
  useEffect(() => {
    if (time.length === 5 && time.indexOf(":") === 2) {
      const [minutes, seconds] = time.split(":").map(Number);
      setSeconds(minutes * 60 + seconds);
      setInitialTime(time); // Guardar el tiempo inicial al cambiar
    }
  }, [time]);

  // Formato de tiempo para mostrar
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  // Iniciar cuenta atrás
  const startTimer = () => {
    if (seconds > 0) {
      const id = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds <= 1) {
            clearInterval(id);
            navigation.goBack(); // Volver a la pantalla anterior al terminar
          }
          return prevSeconds - 1;
        });
      }, 1000);
      setTimerId(id);
      setIsRunning(true);
      setIsPaused(false); // El cronómetro no está pausado al iniciar
    }
  };

  // Pausar o continuar el cronómetro
  const toggleTimer = () => {
    if (isRunning && !isPaused) {
      // Pausar cronómetro
      clearInterval(timerId);
      setIsPaused(true);
    } else if (isRunning && isPaused) {
      // Continuar cronómetro
      startTimer();
    }
  };

  // Reiniciar el cronómetro
  const resetTimer = () => {
    clearInterval(timerId);
    setIsRunning(false);
    setIsPaused(false); // Al reiniciar el cronómetro, también se resetea el estado de pausa
    setTime(initialTime); // Reiniciar con el valor inicial
    setSeconds(minutesToSeconds(initialTime)); // Reiniciar con el valor inicial
  };

  // Convertir el formato mm:ss a segundos
  const minutesToSeconds = (time) => {
    const [minutes, seconds] = time.split(":").map(Number);
    return minutes * 60 + seconds;
  };

  // Asegurarse de que no se pueda borrar el tiempo
  const handleChangeText = (input) => {
    // Si el usuario intenta borrar, no dejar que lo haga
    if (input === "") {
      setTime("00:00");
    } else {
      setTime(input);
    }
  };

  return (
    <View style={styles.container}>
      {!isRunning ? (
        <>
          <View style={styles.container}>
            {/* Input para el tiempo en formato mm:ss */}
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={handleChangeText}
              placeholder="mm:ss"
              keyboardType="numeric"
            />
            <Button title="Iniciar Cronómetro" onPress={startTimer} />
          </View>
        </>
      ) : (
        <>
          {/* Mostrar tiempo restante */}
          <Text style={styles.input}>{formatTime(seconds)}</Text>
          <View style={styles.buttonContainer}>
            {/* Mostrar el botón Pausar/Continuar */}
            {!isPaused && isRunning && (
              <Button
                title="Pausar" // Cambiar el texto del botón
                onPress={toggleTimer}
                color="#FF6347" // Cambiar el color del botón
              />
            )}
            {isPaused && isRunning && (
              <Button
                title="Continuar" // Cambiar el texto del botón
                onPress={toggleTimer}
                color="#4CAF50" // Cambiar el color del botón
              />
            )}

            {/* Los botones Reiniciar y Salir siempre están disponibles cuando el cronómetro está en marcha */}
            <Button title="Reiniciar" onPress={resetTimer} />
            <Button title="Salir" onPress={() => navigation.goBack()} />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  input: {
    fontSize: 35,
    textAlign: "center",
    marginBottom: 20,
    width: 150,
    height: 60,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    fontWeight: "bold",
  },
  timerText: {
    fontSize: 35,
    fontWeight: "bold",
    marginBottom: 20,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
  },

  buttonContainer: {
    flexDirection: "row", // Coloca los botones en columna
    justifyContent: "space-around", // Espacia los botones
    alignItems: "center", // Centra los botones horizontalmente
    marginTop: 20, // Opcional: añade espacio encima
    width: "100%", // Opcional: asegura que los botones no se corten si hay muchos
  },
  // Mantener los mismos estilos para los botones
  button: {
    backgroundColor: "#2196F3", // Color de fondo para los botones
    borderRadius: 12, // Bordes redondeados
    paddingVertical: 12, // Aumentar el padding vertical
    paddingHorizontal: 30, // Aumentar el padding horizontal
    fontSize: 18, // Cambiar tamaño de fuente
    width: "80%", // Opcional: ancho del botón
    marginTop: 10, // Separación entre botones
  },
});

export default TimerScreen;
