import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Avatar, EmptyState, Screen } from "../components/UI";
import { styles } from "../styles";
import { Patient } from "../types";
import { getPatientDisplayId, matchesPatientSearch } from "../utils";

export function PatientsScreen({ patients, onOpenPatient }: {
  patients: Patient[];
  onOpenPatient: (patientId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const { width } = useWindowDimensions();
  const wide = width >= 720;
  const visiblePatients = patients.filter((patient) => matchesPatientSearch(patient, query));

  return (
    <Screen title="Pacientes" eyebrow="Acompanhamento" constrained>
      <View style={styles.patientDirectory}>
        <View style={styles.patientDirectoryToolbar}>
          <TextInput
            accessibilityLabel="Buscar pacientes por nome, ID ou telefone"
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por nome, ID ou telefone"
            placeholderTextColor="#9AA6A3"
            style={styles.patientSearchInput}
          />
        </View>

        <View style={styles.patientDirectoryHeading}>
          <Text style={styles.patientDirectoryTitle}>Lista de pacientes</Text>
          <Text style={styles.patientDirectoryCount}>{visiblePatients.length}</Text>
        </View>

        <View style={styles.patientDirectoryList}>
          {wide ? (
            <View style={styles.patientDirectoryColumns}>
              <Text style={[styles.patientColumnLabel, styles.patientIdentityColumn]}>Nome / telefone</Text>
              <Text style={[styles.patientColumnLabel, styles.patientDiagnosisColumn]}>Demanda</Text>
              <Text style={[styles.patientColumnLabel, styles.patientIdColumn]}>ID</Text>
            </View>
          ) : null}

          {visiblePatients.length === 0 ? (
            <View style={styles.patientDirectoryEmpty}>
              <EmptyState text="Nenhum paciente encontrado." />
            </View>
          ) : (
            visiblePatients.map((patient, index) => (
              <TouchableOpacity
                key={patient.id}
                accessibilityRole="button"
                accessibilityLabel={`Abrir ficha de ${patient.name}`}
                style={[styles.patientDirectoryRow, index % 2 === 1 ? styles.patientDirectoryRowAlternate : null]}
                onPress={() => onOpenPatient(patient.id)}
              >
                <View style={styles.patientIdentityColumn}>
                  <Avatar name={patient.name} size={40} />
                  <View style={styles.patientDirectoryIdentityText}>
                    <Text style={styles.patientDirectoryName} numberOfLines={2}>{patient.name}</Text>
                    <Text style={styles.patientDirectoryPhone}>{patient.phone}</Text>
                    {!wide ? <Text style={styles.patientDirectoryDiagnosis} numberOfLines={1}>{patient.diagnosis}</Text> : null}
                  </View>
                </View>
                {wide ? (
                  <Text style={[styles.patientDirectoryDiagnosis, styles.patientDiagnosisColumn]} numberOfLines={2}>
                    {patient.diagnosis}
                  </Text>
                ) : null}
                <View style={styles.patientIdColumn}>
                  <Text style={styles.patientDirectoryId}>#{getPatientDisplayId(patient.id)}</Text>
                  <Text style={styles.patientDirectoryChevron}>›</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    </Screen>
  );
}
