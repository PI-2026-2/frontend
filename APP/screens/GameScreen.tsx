import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { EmptyState, Input, PatientPicker, PrimaryButton, Screen, SecondaryButton, Section, SegmentButton } from "../components/UI";
import { cards, decks } from "../data";
import { styles } from "../styles";
import { Actor, GameMode, Patient, Program, ResponseRecord, TherapyCard } from "../types";
import { getProgramDayIndex } from "../utils";

export function GameScreen({
  actor,
  notifications,
  patient,
  patients,
  programs,
  responses,
  selectedPatientId,
  onAddProgram,
  onAddResponse,
  onSelectPatient
}: {
  actor: Actor;
  notifications: string[];
  patient: Patient;
  patients: Patient[];
  programs: Program[];
  responses: ResponseRecord[];
  selectedPatientId: string;
  onAddProgram: (program: Program) => void;
  onAddResponse: (response: ResponseRecord) => void;
  onSelectPatient: (patientId: string) => void;
}) {
  const [mode, setMode] = useState<GameMode>("daily");
  const [deckId, setDeckId] = useState(decks[0].id);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [patientAnswer, setPatientAnswer] = useState("");
  const [sessionNote, setSessionNote] = useState("");
  const deckCards = cards.filter((card) => card.deckId === deckId);
  const patientProgram = programs.find((program) => program.patientId === patient.id);
  const dayIndex = patientProgram ? getProgramDayIndex(patientProgram.startedAt) : 0;
  const cardOfDay = patientProgram ? cards.find((card) => card.id === patientProgram.cardIds[dayIndex]) : undefined;
  const selectedCards = selectedCardIds.map((id) => cards.find((card) => card.id === id)).filter(Boolean) as TherapyCard[];

  function toggleCard(cardId: string) {
    setSelectedCardIds((current) => {
      if (current.includes(cardId)) return current.filter((id) => id !== cardId);
      const limit = mode === "daily" ? 7 : 1;
      return [...current.slice(-(limit - 1)), cardId];
    });
  }

  function randomSeven() {
    setMode("daily");
    setSelectedCardIds(deckCards.slice(0, 7).map((card) => card.id));
  }

  function configureDailyProgram() {
    if (selectedCardIds.length !== 7) return;
    onAddProgram({
      id: `g${Date.now()}`,
      patientId: patient.id,
      cardIds: selectedCardIds,
      startedAt: new Date().toISOString()
    });
  }

  function submitPatientAnswer() {
    if (!cardOfDay || !patientAnswer.trim()) return;
    onAddResponse({
      id: `r${Date.now()}`,
      patientId: patient.id,
      cardId: cardOfDay.id,
      mode: "daily",
      answer: patientAnswer.trim(),
      createdAt: new Date().toISOString()
    });
    setPatientAnswer("");
  }

  function saveSessionResponse() {
    const card = selectedCards[0];
    if (!card || !sessionNote.trim()) return;
    onAddResponse({
      id: `r${Date.now()}`,
      patientId: patient.id,
      cardId: card.id,
      mode: "session",
      answer: sessionNote.trim(),
      note: "Registrado pelo terapeuta durante a sessão.",
      createdAt: new Date().toISOString()
    });
    setSessionNote("");
  }

  const alreadyAnsweredToday = responses.some(
    (response) => response.patientId === patient.id && response.cardId === cardOfDay?.id
  );

  return (
    <Screen title="Jogo de cartas" eyebrow="Paciente primeiro, cartas depois">
      {actor === "therapist" ? (
        <PatientPicker
          patients={patients}
          selectedPatientId={selectedPatientId}
          onSelectPatient={(patientId) => {
            if (patientId !== selectedPatientId) {
              setSelectedCardIds([]);
              setSessionNote("");
            }
            onSelectPatient(patientId);
          }}
        />
      ) : null}

      {actor === "therapist" ? (
        <>
          <Section title="Modo de jogo">
            <View style={styles.segmentRow}>
              <SegmentButton active={mode === "daily"} label="7 dias" onPress={() => { setMode("daily"); setSelectedCardIds([]); }} />
              <SegmentButton active={mode === "session"} label="Sessão" onPress={() => { setMode("session"); setSelectedCardIds([]); }} />
            </View>
          </Section>

          <Section title="Escolher baralho">
            {decks.map((deck) => (
              <TouchableOpacity
                key={deck.id}
                style={[styles.deckRow, deck.id === deckId ? styles.deckRowActive : null]}
                onPress={() => { setDeckId(deck.id); setSelectedCardIds([]); }}
              >
                <View>
                  <Text style={styles.deckTitle}>{deck.name}</Text>
                  <Text style={styles.bodyText}>{deck.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Section>

          <Section title={mode === "daily" ? "Selecionar 7 cartas" : "Selecionar carta da sessão"}>
            {mode === "daily" ? <SecondaryButton label="Selecionar 7 automaticamente" onPress={randomSeven} /> : null}
            <View style={styles.cardGrid}>
              {deckCards.map((card) => {
                const selected = selectedCardIds.includes(card.id);
                return (
                  <TouchableOpacity
                    key={card.id}
                    style={[styles.playCard, selected ? styles.playCardSelected : null]}
                    onPress={() => toggleCard(card.id)}
                  >
                    <Text style={styles.cardTheme}>{card.theme}</Text>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardPrompt}>{card.prompt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.helperText}>
              {mode === "daily" ? `${selectedCardIds.length}/7 cartas selecionadas` : `${selectedCardIds.length}/1 carta selecionada`}
            </Text>
            {mode === "daily" ? (
              <PrimaryButton label="Configurar jogo de 7 dias" onPress={configureDailyProgram} disabled={selectedCardIds.length !== 7} />
            ) : (
              <>
                <Input
                  label="Resposta anotada em sessão"
                  value={sessionNote}
                  onChangeText={setSessionNote}
                  placeholder="Registre o que o paciente respondeu durante a sessão."
                  multiline
                />
                <PrimaryButton label="Salvar resposta da sessão" onPress={saveSessionResponse} disabled={selectedCardIds.length !== 1} />
              </>
            )}
          </Section>

          <Section title="Notificações">
            {notifications.length === 0 ? (
              <EmptyState text="As respostas do paciente aparecerão aqui." />
            ) : (
              notifications.map((notification, index) => (
                <View key={`${notification}-${index}`} style={styles.notification}>
                  <Text style={styles.notificationDot}>!</Text>
                  <Text style={styles.bodyText}>{notification}</Text>
                </View>
              ))
            )}
          </Section>
        </>
      ) : (
        <Section title="Carta do dia">
          {cardOfDay ? (
            <>
              <View style={styles.cardOfDay}>
                <Text style={styles.cardTheme}>{cardOfDay.theme}</Text>
                <Text style={styles.bigCardTitle}>{cardOfDay.title}</Text>
                <Text style={styles.bigCardPrompt}>{cardOfDay.prompt}</Text>
              </View>
              <Input
                label="Sua resposta"
                value={patientAnswer}
                onChangeText={setPatientAnswer}
                placeholder="Escreva como isso aparece para você hoje."
                multiline
              />
              <PrimaryButton
                label={alreadyAnsweredToday ? "Enviar nova resposta" : "Enviar resposta"}
                onPress={submitPatientAnswer}
              />
            </>
          ) : (
            <EmptyState text="Seu terapeuta ainda não configurou um jogo de 7 dias." />
          )}
        </Section>
      )}
    </Screen>
  );
}
