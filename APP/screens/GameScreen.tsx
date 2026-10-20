import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { findCards, pickDailyCards } from "../catalog";
import { EmptyState, Input, PatientPicker, PrimaryButton, Screen, SecondaryButton, Section, SegmentButton } from "../components/UI";
import { cards, classifications, decks, themes } from "../data";
import { styles } from "../styles";
import { Actor, CardClassification, GameMode, Patient, Program, ResponseRecord, TherapyCard } from "../types";
import { getProgramDayIndex } from "../utils";
import { RandomScreen } from "./RandomScreen";

type CatalogView = "themes" | "decks" | "cards" | "random";

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
  const [view, setView] = useState<CatalogView>("themes");
  const [themeId, setThemeId] = useState<string | null>(themes[0]?.id ?? null);
  const [deckId, setDeckId] = useState<string | null>(decks[0]?.id ?? null);
  const [classification, setClassification] = useState<CardClassification | null>(null);
  const [query, setQuery] = useState("");
  const [deckQuery, setDeckQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(30);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [patientAnswer, setPatientAnswer] = useState("");
  const [sessionNote, setSessionNote] = useState("");
  const [feedback, setFeedback] = useState("");

  const selectedCards = selectedCardIds.map((id) => cards.find((card) => card.id === id)).filter((card): card is TherapyCard => Boolean(card));
  const patientProgram = programs.find((program) => program.patientId === patient.id);
  const dayIndex = patientProgram ? getProgramDayIndex(patientProgram.startedAt) : 0;
  const cardOfDay = patientProgram ? cards.find((card) => card.id === patientProgram.cardIds[dayIndex]) : undefined;
  const alreadyAnsweredToday = responses.some(
    (response) => response.patientId === patient.id && response.cardId === cardOfDay?.id
  );
  const matchingDecks = decks.filter((deck) =>
    (!themeId || deck.themeId === themeId) && deck.name.toLowerCase().includes(deckQuery.trim().toLowerCase())
  );
  const filteredDecks = decks.filter((deck) => !themeId || deck.themeId === themeId);
  const matchingCards = useMemo(
    () => findCards(cards, decks, themes, { query, themeId, deckId, classification }),
    [query, themeId, deckId, classification]
  );
  const visibleCards = matchingCards.slice(0, visibleCount);

  function selectCard(card: TherapyCard) {
    setFeedback("");
    setThemeId(decks.find((deck) => deck.id === card.deckId)?.themeId ?? null);
    setDeckId(card.deckId);
    if (selectedCardIds.includes(card.id)) {
      setSelectedCardIds(selectedCardIds.filter((id) => id !== card.id));
      return;
    }
    if (mode === "session") {
      setSelectedCardIds([card.id]);
      return;
    }
    const sameDeck = selectedCardIds.filter((id) => cards.find((item) => item.id === id)?.deckId === card.deckId);
    const limit = 7;
    if (sameDeck.length >= limit) {
      setFeedback(`Limite de ${limit} carta${limit > 1 ? "s" : ""}. Remova uma antes de escolher outra.`);
      return;
    }
    if (sameDeck.some((id) => cards.find((item) => item.id === id)?.theme === card.theme)) {
      setFeedback("Escolha cartas de assuntos distintos para o jogo de 7 dias.");
      return;
    }
    setSelectedCardIds([...sameDeck, card.id]);
  }

  function randomSeven() {
    const drawn = pickDailyCards(cards.filter((card) => card.deckId === deckId));
    if (drawn.length < 7) {
      setFeedback("Este baralho precisa de 7 cartas de assuntos distintos.");
      return;
    }
    setSelectedCardIds(drawn.map((card) => card.id));
    setFeedback("7 cartas sorteadas deste baralho.");
  }

  function configureDailyProgram() {
    if (selectedCards.length !== 7 || new Set(selectedCards.map((card) => card.deckId)).size !== 1 ||
      new Set(selectedCards.map((card) => card.theme)).size !== 7) return;
    onAddProgram({
      id: `g${Date.now()}`,
      patientId: patient.id,
      cardIds: selectedCardIds,
      startedAt: new Date().toISOString()
    });
    setFeedback(`Jogo de 7 dias configurado para ${patient.name}.`);
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
    setFeedback("Resposta da sessão salva.");
  }

  if (actor !== "patient" && view === "random") {
    return (
      <RandomScreen
        patientName={patient.name}
        initialThemeId={themeId ?? themes[0].id}
        initialDeckId={deckId ?? decks.find((deck) => deck.themeId === themeId)?.id ?? decks[0].id}
        initialClassification={classification}
        onBack={() => setView("cards")}
        onUseCard={(card) => {
          setQuery("");
          setClassification(null);
          selectCard(card);
          setView("cards");
        }}
      />
    );
  }

  return (
    <Screen title="Jogo de cartas" eyebrow={actor === "patient" ? "Sua atividade" : "Paciente · tema · baralho · carta"} constrained>
      {actor !== "patient" ? (
        <>
          <PatientPicker
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={(patientId) => {
              if (patientId !== selectedPatientId) {
                setSelectedCardIds([]);
                setSessionNote("");
                setFeedback("");
              }
              onSelectPatient(patientId);
            }}
          />

          <View style={styles.catalogSection}>
            <Text style={styles.sectionTitle}>Modo de jogo</Text>
            <View style={styles.segmentRow}>
              <SegmentButton active={mode === "daily"} label="7 dias" onPress={() => { setMode("daily"); setSelectedCardIds([]); setFeedback(""); }} />
              <SegmentButton active={mode === "session"} label="Sessão" onPress={() => { setMode("session"); setSelectedCardIds([]); setFeedback(""); }} />
            </View>
          </View>

          <View style={styles.catalogToolbar}>
            <View style={styles.segmentRow}>
              <SegmentButton active={view === "themes"} label="Tema" onPress={() => setView("themes")} />
              <SegmentButton active={view === "decks"} label="Baralho" onPress={() => setView("decks")} />
              <SegmentButton active={view === "cards"} label="Cartas" onPress={() => setView("cards")} />
            </View>
            <TouchableOpacity accessibilityRole="button" style={styles.randomButton} onPress={() => setView("random")}>
              <Text style={styles.randomButtonText}>⤨  Aleatório</Text>
            </TouchableOpacity>
          </View>

          {view === "themes" ? (
            <View style={styles.catalogSection}>
              <Text style={styles.sectionTitle}>Temas</Text>
              {themes.map((theme) => (
                <TouchableOpacity key={theme.id} accessibilityRole="button" style={styles.catalogRow} onPress={() => {
                  setThemeId(theme.id);
                  setDeckId(null);
                  setDeckQuery("");
                  setView("decks");
                }}>
                  <View style={styles.catalogRowContent}>
                    <Text style={styles.deckTitle}>{theme.name}</Text>
                    <Text style={styles.bodyText}>{theme.description}</Text>
                    <Text style={styles.catalogCount}>{decks.filter((deck) => deck.themeId === theme.id).length} baralho(s)</Text>
                  </View>
                  <Text style={styles.catalogChevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {view === "decks" ? (
            <View style={styles.catalogSection}>
              <Text style={styles.sectionTitle}>Baralhos</Text>
              <TextInput accessibilityLabel="Buscar baralhos" placeholder="Buscar baralho" placeholderTextColor="#9AA6A3" value={deckQuery} onChangeText={setDeckQuery} style={styles.patientSearchInput} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catalogFilters}>
                {[null, ...themes].map((theme) => (
                  <TouchableOpacity key={theme?.id ?? "all"} style={[styles.filterChip, themeId === (theme?.id ?? null) && styles.filterChipActive]} onPress={() => { setThemeId(theme?.id ?? null); setDeckId(null); }}>
                    <Text style={[styles.filterChipText, themeId === (theme?.id ?? null) && styles.filterChipTextActive]}>{theme?.name ?? "Todos os temas"}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {matchingDecks.length === 0 ? <EmptyState text="Nenhum baralho encontrado." /> : matchingDecks.map((deck) => (
                <TouchableOpacity key={deck.id} accessibilityRole="button" style={styles.catalogRow} onPress={() => {
                  setThemeId(deck.themeId);
                  setDeckId(deck.id);
                  setQuery("");
                  setVisibleCount(30);
                  setView("cards");
                }}>
                  <View style={styles.catalogRowContent}>
                    <Text style={styles.deckTitle}>{deck.name}</Text>
                    <Text style={styles.bodyText}>{themes.find((theme) => theme.id === deck.themeId)?.name} · {deck.description}</Text>
                    <Text style={styles.catalogCount}>{cards.filter((card) => card.deckId === deck.id).length} carta(s)</Text>
                  </View>
                  <Text style={styles.catalogChevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {view === "cards" ? (
            <>
              <View style={styles.catalogSection}>
                <Text style={styles.sectionTitle}>Cartas</Text>
                <TextInput accessibilityLabel="Buscar cartas" placeholder="Buscar título, texto, tema ou baralho" placeholderTextColor="#9AA6A3" value={query} onChangeText={(value) => { setQuery(value); setVisibleCount(30); }} style={styles.patientSearchInput} />
                <Text style={styles.inputLabel}>Tema</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catalogFilters}>
                  {[null, ...themes].map((theme) => (
                    <TouchableOpacity key={theme?.id ?? "all"} style={[styles.filterChip, themeId === (theme?.id ?? null) && styles.filterChipActive]} onPress={() => { setThemeId(theme?.id ?? null); setDeckId(null); setVisibleCount(30); }}>
                      <Text style={[styles.filterChipText, themeId === (theme?.id ?? null) && styles.filterChipTextActive]}>{theme?.name ?? "Todos"}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={styles.inputLabel}>Baralho</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catalogFilters}>
                  {[null, ...filteredDecks].map((deck) => (
                    <TouchableOpacity key={deck?.id ?? "all"} style={[styles.filterChip, deckId === (deck?.id ?? null) && styles.filterChipActive]} onPress={() => { setDeckId(deck?.id ?? null); setVisibleCount(30); }}>
                      <Text style={[styles.filterChipText, deckId === (deck?.id ?? null) && styles.filterChipTextActive]}>{deck?.name ?? "Todos"}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={styles.inputLabel}>Classificação</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catalogFilters}>
                  {([null, ...classifications] as (CardClassification | null)[]).map((item) => (
                    <TouchableOpacity key={item ?? "all"} style={[styles.filterChip, classification === item && styles.filterChipActive]} onPress={() => { setClassification(item); setVisibleCount(30); }}>
                      <Text style={[styles.filterChipText, classification === item && styles.filterChipTextActive]}>{item ?? "Todas"}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={styles.catalogCount}>{matchingCards.length} carta(s) encontrada(s)</Text>
              </View>

              <View style={styles.cardGrid}>
                {visibleCards.length === 0 ? <EmptyState text="Nenhuma carta encontrada para esses filtros." /> : visibleCards.map((card) => {
                  const deck = decks.find((item) => item.id === card.deckId);
                  const theme = themes.find((item) => item.id === deck?.themeId);
                  const selected = selectedCardIds.includes(card.id);
                  return (
                    <TouchableOpacity key={card.id} accessibilityRole="button" accessibilityLabel={`${selected ? "Remover" : "Selecionar"} ${card.title}`} style={[styles.playCard, selected && styles.playCardSelected]} onPress={() => selectCard(card)}>
                      <Text style={styles.cardOrigin}>{theme?.name} · {deck?.name} · {card.classification}</Text>
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      <Text style={styles.cardPrompt}>{card.prompt}</Text>
                      <Text style={styles.catalogCount}>{selected ? "Selecionada" : card.theme}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {matchingCards.length > visibleCount ? <SecondaryButton label="Carregar mais cartas" onPress={() => setVisibleCount((count) => count + 30)} /> : null}

              <View style={styles.catalogSection}>
                <Text style={styles.sectionTitle}>{mode === "daily" ? "Jogo de 7 dias" : "Carta da sessão"}</Text>
                <Text style={styles.helperText}>{selectedCardIds.length}/{mode === "daily" ? 7 : 1} carta(s) selecionada(s) {selectedCards[0] ? `· ${decks.find((deck) => deck.id === selectedCards[0].deckId)?.name}` : ""}</Text>
                {feedback ? <Text style={styles.helperText}>{feedback}</Text> : null}
                {mode === "daily" ? (
                  <>
                    <SecondaryButton label="Sortear 7 deste baralho" onPress={randomSeven} disabled={!deckId} />
                    <PrimaryButton label="Configurar jogo de 7 dias" onPress={configureDailyProgram} disabled={selectedCardIds.length !== 7} />
                  </>
                ) : (
                  <>
                    <Input label="Resposta anotada em sessão" value={sessionNote} onChangeText={setSessionNote} placeholder="Registre o que o paciente respondeu durante a sessão." multiline />
                    <PrimaryButton label="Salvar resposta da sessão" onPress={saveSessionResponse} disabled={selectedCardIds.length !== 1 || !sessionNote.trim()} />
                  </>
                )}
              </View>
            </>
          ) : null}

          <Section title="Notificações">
            {notifications.length === 0 ? <EmptyState text="As respostas do paciente aparecerão aqui." /> : notifications.map((notification, index) => (
              <View key={`${notification}-${index}`} style={styles.notification}>
                <Text style={styles.notificationDot}>!</Text>
                <Text style={styles.bodyText}>{notification}</Text>
              </View>
            ))}
          </Section>
        </>
      ) : (
        <Section title="Carta do dia">
          {cardOfDay ? (
            <>
              <View style={styles.cardOfDay}>
                <Text style={styles.cardOfDayMeta}>{decks.find((deck) => deck.id === cardOfDay.deckId)?.name} · {cardOfDay.classification}</Text>
                <Text style={styles.bigCardTitle}>{cardOfDay.title}</Text>
                <Text style={styles.bigCardPrompt}>{cardOfDay.prompt}</Text>
              </View>
              <Input label="Sua resposta" value={patientAnswer} onChangeText={setPatientAnswer} placeholder="Escreva como isso aparece para você hoje." multiline />
              <PrimaryButton label={alreadyAnsweredToday ? "Enviar nova resposta" : "Enviar resposta"} onPress={submitPatientAnswer} disabled={!patientAnswer.trim()} />
            </>
          ) : <EmptyState text="Seu terapeuta ainda não configurou um jogo de 7 dias." />}
        </Section>
      )}
    </Screen>
  );
}
