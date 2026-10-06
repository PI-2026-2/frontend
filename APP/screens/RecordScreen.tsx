import React, { useState } from "react";
import { Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { EmptyState, Input, PrimaryButton, Screen } from "../components/UI";
import { cards } from "../data";
import { styles } from "../styles";
import { ClinicalNote, Patient, ResponseRecord } from "../types";
import { getPatientDisplayId } from "../utils";

function RecordField({ label, value, wide }: { label: string; value: string; wide: boolean }) {
  return (
    <View style={[styles.recordField, wide ? styles.recordFieldWide : null]}>
      <Text style={styles.recordFieldLabel}>{label}</Text>
      <Text style={styles.recordFieldValue}>{value}</Text>
    </View>
  );
}

export function RecordScreen({ patient, responses, notes, onBack, onSaveNote }: {
  patient: Patient;
  responses: ResponseRecord[];
  notes: ClinicalNote[];
  onBack: () => void;
  onSaveNote: (text: string) => void;
}) {
  const [note, setNote] = useState("");
  const { width } = useWindowDimensions();
  const wide = width >= 720;
  const patientResponses = responses.filter((response) => response.patientId === patient.id);
  const patientNotes = notes.filter((item) => item.patientId === patient.id);

  function saveNote() {
    if (!note.trim()) return;
    onSaveNote(note.trim());
    setNote("");
  }

  return (
    <Screen
      title="Ficha do paciente"
      eyebrow="Prontuário mínimo"
      constrained
      leading={
        <TouchableOpacity accessibilityRole="button" style={styles.recordBackButton} onPress={onBack}>
          <Text style={styles.recordBackArrow}>‹</Text>
          <Text style={styles.recordBackText}>Pacientes</Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.recordPage}>
        <View style={styles.recordSummary}>
          <Text style={styles.recordSummaryName}>{patient.name}</Text>
          <View style={styles.recordSummaryFacts}>
            <View style={styles.recordSummaryFact}>
              <Text style={styles.recordSummaryLabel}>ID</Text>
              <Text style={styles.recordSummaryValue}>#{getPatientDisplayId(patient.id)}</Text>
            </View>
            <View style={styles.recordSummaryFact}>
              <Text style={styles.recordSummaryLabel}>Idade</Text>
              <Text style={styles.recordSummaryValue}>{patient.age} anos</Text>
            </View>
            <View style={styles.recordSummaryFact}>
              <Text style={styles.recordSummaryLabel}>Risco</Text>
              <Text style={styles.recordSummaryValue}>{patient.risk}</Text>
            </View>
            <View style={styles.recordSummaryFact}>
              <Text style={styles.recordSummaryLabel}>Respostas</Text>
              <Text style={styles.recordSummaryValue}>{patientResponses.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.recordSection}>
          <Text style={styles.recordSectionTitle}>Identificação e contato</Text>
          <View style={styles.recordFields}>
            <RecordField label="Nome" value={patient.name} wide={wide} />
            <RecordField label="Telefone" value={patient.phone} wide={wide} />
            <RecordField label="E-mail" value={patient.email} wide={wide} />
          </View>
        </View>

        <View style={styles.recordSection}>
          <Text style={styles.recordSectionTitle}>Acompanhamento</Text>
          <View style={styles.recordFields}>
            <RecordField label="Demanda" value={patient.diagnosis} wide={wide} />
            <RecordField label="Objetivo" value={patient.goal} wide={wide} />
          </View>
        </View>

        <View style={styles.recordSection}>
          <Text style={styles.recordSectionTitle}>Evolução da sessão</Text>
          <Input
            label="Nota clínica"
            value={note}
            onChangeText={setNote}
            placeholder="Registre observações, intervenções e plano de continuidade."
            multiline
          />
          <PrimaryButton label="Salvar evolução" onPress={saveNote} disabled={!note.trim()} />
          {patientNotes.map((item) => (
            <View key={item.id} style={styles.recordHistoryItem}>
              <Text style={styles.recordHistoryDate}>
                {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.createdAt))}
              </Text>
              <Text style={styles.recordHistoryText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.recordSection}>
          <Text style={styles.recordSectionTitle}>Respostas do jogo</Text>
          {patientResponses.length === 0 ? (
            <EmptyState text="Nenhuma resposta registrada para este paciente ainda." />
          ) : (
            patientResponses.map((response) => {
              const card = cards.find((item) => item.id === response.cardId);
              return (
                <View key={response.id} style={styles.recordHistoryItem}>
                  <Text style={styles.recordHistoryDate}>{card?.title ?? "Carta"}</Text>
                  <Text style={styles.recordHistoryText}>{response.answer}</Text>
                  {response.note ? <Text style={styles.recordHistoryNote}>Nota: {response.note}</Text> : null}
                </View>
              );
            })
          )}
        </View>
      </View>
    </Screen>
  );
}
