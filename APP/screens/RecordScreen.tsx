import React, { useState } from "react";
import { Text, View } from "react-native";
import { cards } from "../data";
import { Avatar, EmptyState, InfoLine, Input, Metric, PatientPicker, PrimaryButton, Screen, Section } from "../components/UI";
import { styles } from "../styles";
import { Patient, ResponseRecord } from "../types";

export function RecordScreen({ patient, patients, responses, selectedPatientId, onSelectPatient }: {
  patient: Patient;
  patients: Patient[];
  responses: ResponseRecord[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
}) {
  const [note, setNote] = useState("");
  const patientResponses = responses.filter((response) => response.patientId === patient.id);

  return (
    <Screen title="Prontuário mínimo" eyebrow="Resumo clínico essencial">
      <PatientPicker patients={patients} selectedPatientId={selectedPatientId} onSelectPatient={onSelectPatient} />

      <Section title="Identificação">
        <View style={styles.profileHeader}>
          <Avatar name={patient.name} size={64} />
          <View style={styles.profileText}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.bodyText}>{patient.age} anos · {patient.phone}</Text>
            <Text style={styles.bodyText}>{patient.email}</Text>
          </View>
        </View>
        <View style={styles.metricsGrid}>
          <Metric label="Risco" value={patient.risk} tone={patient.risk === "alto" ? "rose" : patient.risk === "moderado" ? "amber" : "mint"} />
          <Metric label="Respostas" value={String(patientResponses.length)} tone="lilac" />
          <Metric label="Vínculo" value="ativo" tone="mint" />
        </View>
      </Section>

      <Section title="Hipótese e objetivo">
        <InfoLine label="Demanda" value={patient.diagnosis} />
        <InfoLine label="Objetivo" value={patient.goal} />
      </Section>

      <Section title="Evolução da sessão">
        <Input
          label="Nota clínica"
          value={note}
          onChangeText={setNote}
          placeholder="Registre observações, intervenções e plano de continuidade."
          multiline
        />
        <PrimaryButton label="Salvar evolução" onPress={() => setNote("")} />
      </Section>

      <Section title="Respostas do jogo">
        {patientResponses.length === 0 ? (
          <EmptyState text="Nenhuma resposta registrada para este paciente ainda." />
        ) : (
          patientResponses.map((response) => {
            const card = cards.find((item) => item.id === response.cardId);
            return (
              <View key={response.id} style={styles.responseItem}>
                <Text style={styles.responseTitle}>{card?.title}</Text>
                <Text style={styles.bodyText}>{response.answer}</Text>
                {response.note ? <Text style={styles.noteText}>Nota: {response.note}</Text> : null}
              </View>
            );
          })
        )}
      </Section>
    </Screen>
  );
}
