      <View style={styles.divider}></View> {/* Divider Line */}

      <View style={styles.bottomContainer}>
        {selectedExercise && (
          <View style={styles.exerciseDetail}>
            <Text style={styles.detailTitle}>Ejercicio: {selectedExercise ? selectedExercise.nombre_ejercicio : 'No seleccionado'}</Text>

            <ScrollView style={styles.seriesScroll}>
              {selectedExercise?.series && selectedExercise.series.length > 0 ? (
                selectedExercise.series.map((serie, index) => (
                  <View key={index} style={styles.serieContainer}>
                    <Text>Serie {index + 1}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Repeticiones"
                      keyboardType="numeric"
                      value={serie.repeticiones}
                      onChangeText={(value) =>
                        handleChangeSerie(selectedExercise.id_ejercicio, index, 'repeticiones', value)
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Peso"
                      keyboardType="numeric"
                      value={serie.peso}
                      onChangeText={(value) =>
                        handleChangeSerie(selectedExercise.id_ejercicio, index, 'peso', value)
                      }
                    />
                  </View>
                ))
              ) : (null)}
            </ScrollView>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <Button title="Guardar Entreno" onPress={handleSaveExercise} />
        </View>
      </View>