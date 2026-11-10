import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
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

export function RecordScreen({ patient, responses, notes, onBack, onSaveNote, onUpdateNote }: {
  patient: Patient;
  responses: ResponseRecord[];
  notes: ClinicalNote[];
  onBack: () => void;
  onSaveNote: (title: string, text: string) => void;
  onUpdateNote: (noteId: string, title: string, text: string) => void;
}) {
  const [noteTitle, setNoteTitle] = useState("");
  const [note, setNote] = useState("");
  const [noteSearch, setNoteSearch] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingText, setEditingText] = useState("");
  const { width } = useWindowDimensions();
  const wide = width >= 720;
  const patientResponses = responses.filter((response) => response.patientId === patient.id);
  const patientNotes = notes.filter((item) => item.patientId === patient.id);
  const normalize = (value: string) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const searchTerm = normalize(noteSearch.trim());
  const visibleNotes = patientNotes.filter((item) =>
    normalize(`${item.title} ${item.text}`).includes(searchTerm)
  );

  function saveNote() {
    if (!noteTitle.trim() || !note.trim()) return;
    onSaveNote(noteTitle.trim(), note.trim());
    setNoteTitle("");
    setNote("");
  }

  function beginEditing(item: ClinicalNote) {
    setEditingNoteId(item.id);
    setEditingTitle(item.title);
    setEditingText(item.text);
  }

  function saveEdit() {
    if (!editingNoteId || !editingTitle.trim() || !editingText.trim()) return;
    onUpdateNote(editingNoteId, editingTitle.trim(), editingText.trim());
    setEditingNoteId(null);
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
            label="Título da anotação"
            value={noteTitle}
            onChangeText={setNoteTitle}
            placeholder="Ex.: Sessão de acompanhamento"
          />
          <Input
            label="Nota clínica"
            value={note}
            onChangeText={setNote}
            placeholder="Registre observações, intervenções e plano de continuidade."
            multiline
          />
          <PrimaryButton label="Salvar evolução" onPress={saveNote} disabled={!noteTitle.trim() || !note.trim()} />

          <TextInput
            accessibilityLabel="Buscar evolução por título ou conteúdo"
            value={noteSearch}
            onChangeText={setNoteSearch}
            placeholder="Buscar evolução por título ou conteúdo"
            placeholderTextColor="#9AA6A3"
            style={[styles.patientSearchInput, styles.recordSearchInput]}
          />
          {visibleNotes.length === 0 ? (
            <EmptyState text={noteSearch ? "Nenhuma evolução encontrada." : "Nenhuma evolução registrada."} />
          ) : visibleNotes.map((item) => (
            <View key={item.id} style={styles.recordHistoryItem}>
              {editingNoteId === item.id ? (
                <>
                  <Input label="Título da anotação" value={editingTitle} onChangeText={setEditingTitle} placeholder="Título" />
                  <Input label="Nota clínica" value={editingText} onChangeText={setEditingText} placeholder="Conteúdo" multiline />
                  <View style={styles.recordEditActions}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      disabled={!editingTitle.trim() || !editingText.trim()}
                      style={[styles.recordEditSaveButton, !editingTitle.trim() || !editingText.trim() ? styles.buttonDisabled : null]}
                      onPress={saveEdit}
                    >
                      <Text style={styles.recordEditSaveText}>Salvar alteração</Text>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button" style={styles.recordEditCancelButton} onPress={() => setEditingNoteId(null)}>
                      <Text style={styles.recordEditCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.recordNoteHeading}>
                    <Text style={styles.recordNoteTitle}>{item.title}</Text>
                    <TouchableOpacity accessibilityRole="button" onPress={() => beginEditing(item)}>
                      <Text style={styles.recordEditLink}>Editar</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.recordHistoryDate}>
                    {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.updatedAt ?? item.createdAt))}
                    {item.updatedAt ? " · editado" : ""}
                  </Text>
                  <Text style={styles.recordHistoryText}>{item.text}</Text>
                </>
              )}
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
                  <Text style={styles.recordHistoryDate}>
                    {response.mode === "daily" ? `7 dias · Dia ${response.programDay ?? "?"}` : "Sessão"} · {new Date(response.createdAt).toLocaleDateString("pt-BR")}
                    {response.updatedAt ? " · editado" : ""}
                  </Text>
                  <Text style={styles.cardTitle}>{card?.title ?? "Carta"}</Text>
                  {card ? <Text style={styles.cardPrompt}>{card.prompt}</Text> : null}
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
