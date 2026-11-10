import React, { useEffect, useMemo, useState } from "react";
import { AppState, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { findCards, pickDailyCards } from "../catalog";
import { EmptyState, Input, PatientPicker, PrimaryButton, Screen, SecondaryButton, Section, SegmentButton } from "../components/UI";
import { classifications } from "../data";
import { styles } from "../styles";
import { Actor, CardClassification, Deck, GameMode, Patient, Program, ResponseRecord, SessionGame, Theme, TherapyCard } from "../types";
import { getProgramDayIndex } from "../utils";
import { RandomScreen } from "./RandomScreen";

type CatalogView = "themes" | "decks" | "cards" | "random";

export function GameScreen({
  actor,
  notifications,
  patient,
  patients,
  programs,
  sessionGames,
  responses,
  selectedPatientId,
  cards,
  decks,
  themes,
  onAddProgram,
  onAddSessionGame,
  onAddResponse,
  onSelectPatient
}: {
  actor: Actor;
  notifications: string[];
  patient: Patient;
  patients: Patient[];
  programs: Program[];
  sessionGames: SessionGame[];
  responses: ResponseRecord[];
  selectedPatientId: string;
  cards: TherapyCard[];
  decks: Deck[];
  themes: Theme[];
  onAddProgram: (program: Program) => Promise<void>;
  onAddSessionGame: (game: SessionGame) => void;
  onAddResponse: (response: ResponseRecord) => Promise<void>;
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
  const [sessionDraftOpen, setSessionDraftOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [patientAnswer, setPatientAnswer] = useState("");
  const [sessionAnswer, setSessionAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const filterClassifications = [...new Set<CardClassification>([...classifications, ...cards.map((card) => card.classification)])];

  useEffect(() => {
    const refresh = () => setNow(new Date());
    const interval = setInterval(refresh, 30_000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  const selectedCards = selectedCardIds.map((id) => cards.find((card) => card.id === id)).filter((card): card is TherapyCard => Boolean(card));
  const activeSessionGame = sessionGames.find((game) => game.patientId === patient.id);
  const showSessionGame = mode === "session" && !sessionDraftOpen && Boolean(activeSessionGame);
  const editingCard = cards.find((card) => card.id === editingCardId);
  const editingResponse = responses.find((response) =>
    response.patientId === patient.id && response.mode === "session" &&
    response.sessionGameId === activeSessionGame?.id && response.cardId === editingCardId
  );
  const patientProgram = programs.find((program) => program.patientId === patient.id);
  const dayIndex = patientProgram ? getProgramDayIndex(patientProgram.startedAt, now) : null;
  const cardOfDay = patientProgram && dayIndex !== null
    ? cards.find((card) => card.id === patientProgram.cardIds[dayIndex])
    : undefined;
  const alreadyAnsweredToday = responses.some(
    (response) => response.patientId === patient.id && response.mode === "daily" &&
      response.cardId === cardOfDay?.id && (response.programId === patientProgram?.id ||
        (response.programId === undefined && patientProgram !== undefined &&
          new Date(response.createdAt).getTime() >= new Date(patientProgram.startedAt).getTime()))
  );
  useEffect(() => {
    setPatientAnswer("");
  }, [patientProgram?.id, dayIndex]);
  const matchingDecks = decks.filter((deck) =>
    (!themeId || deck.themeId === themeId) && deck.name.toLowerCase().includes(deckQuery.trim().toLowerCase())
  );
  const filteredDecks = decks.filter((deck) => !themeId || deck.themeId === themeId);
  const matchingCards = useMemo(
    () => findCards(cards, decks, themes, { query, themeId, deckId, classification }),
    [cards, decks, themes, query, themeId, deckId, classification]
  );
  const visibleCards = matchingCards.slice(0, visibleCount);

  function selectCard(card: TherapyCard) {
    setFeedback("");
    if (mode === "session") {
      setSelectedCardIds((current) => current.includes(card.id)
        ? current.filter((id) => id !== card.id)
        : [...current, card.id]
      );
      return;
    }
    setThemeId(decks.find((deck) => deck.id === card.deckId)?.themeId ?? null);
    setDeckId(card.deckId);
    if (selectedCardIds.includes(card.id)) {
      setSelectedCardIds(selectedCardIds.filter((id) => id !== card.id));
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

  async function configureDailyProgram() {
    if (selectedCards.length !== 7 || new Set(selectedCards.map((card) => card.deckId)).size !== 1 ||
      new Set(selectedCards.map((card) => card.theme)).size !== 7 || saving) return;
    setSaving(true);
    try {
      await onAddProgram({
        id: `g${Date.now()}`,
        patientId: patient.id,
        cardIds: selectedCardIds,
        startedAt: new Date().toISOString()
      });
      setFeedback(`Jogo de 7 dias configurado para ${patient.name}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Erro ao configurar o jogo.");
    } finally { setSaving(false); }
  }

  function startSessionGame() {
    if (selectedCardIds.length === 0) return;
    onAddSessionGame({
      id: `s${Date.now()}-${Math.random().toString(36).slice(2)}`,
      patientId: patient.id,
      cardIds: [...selectedCardIds],
      startedAt: new Date().toISOString()
    });
    setSelectedCardIds([]);
    setSessionDraftOpen(false);
    setView("cards");
    setFeedback("");
  }

  function openSessionAnswer(cardId: string) {
    setEditingCardId(cardId);
    setSessionAnswer("");
    setFeedback("");
  }

  async function submitPatientAnswer() {
    if (!patientProgram || !cardOfDay || alreadyAnsweredToday || !patientAnswer.trim() || saving) return;
    setSaving(true);
    setFeedback("");
    try {
      await onAddResponse({
        id: `r${Date.now()}`,
        patientId: patient.id,
        cardId: cardOfDay.id,
        mode: "daily",
        programId: patientProgram.id,
        programDay: dayIndex! + 1,
        answer: patientAnswer.trim(),
        createdAt: new Date().toISOString()
      });
      setPatientAnswer("");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Erro ao enviar a resposta.");
    } finally { setSaving(false); }
  }

  async function saveSessionAnswer() {
    if (!activeSessionGame || !editingCard || !sessionAnswer.trim() || editingResponse || saving) return;
    setSaving(true);
    setFeedback("");
    try {
      await onAddResponse({
        id: `r${Date.now()}-${Math.random().toString(36).slice(2)}`,
        patientId: patient.id,
        cardId: editingCard.id,
        mode: "session",
        sessionGameId: activeSessionGame.id,
        answer: sessionAnswer.trim(),
        note: "Resposta anotada pelo terapeuta durante a sessão.",
        createdAt: new Date().toISOString()
      });
      setEditingCardId(null);
      setSessionAnswer("");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Erro ao salvar a resposta.");
    } finally { setSaving(false); }
  }

  if (actor !== "patient" && view === "random") {
    return (
      <RandomScreen
        patientName={patient.name}
        cards={cards}
        decks={decks}
        themes={themes}
        initialThemeId={themeId ?? themes[0]?.id ?? ""}
        initialDeckId={deckId ?? decks.find((deck) => deck.themeId === themeId)?.id ?? decks[0]?.id ?? ""}
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
                setSessionDraftOpen(false);
                setEditingCardId(null);
                setFeedback("");
              }
              onSelectPatient(patientId);
            }}
          />

          <View style={styles.catalogSection}>
            <Text style={styles.sectionTitle}>Modo de jogo</Text>
            <View style={styles.segmentRow}>
              <SegmentButton active={mode === "daily"} label="7 dias" onPress={() => { if (mode !== "daily") setSelectedCardIds([]); setMode("daily"); setSessionDraftOpen(false); setFeedback(""); }} />
              <SegmentButton active={mode === "session"} label="Sessão" onPress={() => { if (mode !== "session") setSelectedCardIds([]); setMode("session"); setSessionDraftOpen(false); setFeedback(""); }} />
            </View>
          </View>

          {showSessionGame && activeSessionGame ? (
            <Section title="Perguntas da sessão">
              <Text style={styles.helperText}>{activeSessionGame.cardIds.length} pergunta(s) escolhida(s). Anote as respostas do paciente em cada carta.</Text>
              {activeSessionGame.cardIds.map((cardId, index) => {
                const card = cards.find((item) => item.id === cardId);
                const answer = responses.find((response) =>
                  response.patientId === patient.id && response.mode === "session" &&
                  response.sessionGameId === activeSessionGame.id && response.cardId === cardId
                );
                if (!card) return null;
                return (
                  <View key={cardId} style={styles.playCard}>
                    <Text style={styles.cardOrigin}>Pergunta {index + 1} de {activeSessionGame.cardIds.length}</Text>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardPrompt}>{card.prompt}</Text>
                    {answer ? <Text style={styles.helperText}>Resposta anotada: {answer.answer}</Text> : null}
                    {!answer ? <SecondaryButton label="Anotar resposta" onPress={() => openSessionAnswer(cardId)} /> : null}
                  </View>
                );
              })}
              <SecondaryButton label="Escolher perguntas para nova sessão" onPress={() => { setSelectedCardIds([]); setSessionDraftOpen(true); setView("cards"); }} />
            </Section>
          ) : (
          <>
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
                  {([null, ...filterClassifications] as (CardClassification | null)[]).map((item) => (
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

            </>
          ) : null}

          <View style={styles.catalogSection}>
            <Text style={styles.sectionTitle}>{mode === "daily" ? "Jogo de 7 dias" : "Seleção da sessão"}</Text>
            <Text style={styles.helperText}>{selectedCardIds.length}{mode === "daily" ? "/7" : ""} pergunta(s) selecionada(s){mode === "daily" && selectedCards[0] ? ` · ${decks.find((deck) => deck.id === selectedCards[0].deckId)?.name}` : ""}</Text>
            {feedback ? <Text style={styles.helperText}>{feedback}</Text> : null}
            {mode === "daily" ? (
              <>
                <SecondaryButton label="Sortear 7 deste baralho" onPress={randomSeven} disabled={!deckId} />
                <PrimaryButton label={saving ? "Salvando..." : "Configurar jogo de 7 dias"} onPress={configureDailyProgram} disabled={selectedCardIds.length !== 7 || saving} />
              </>
            ) : (
              <>
                <Text style={styles.helperText}>Escolha quantas perguntas precisar e finalize para anotar as respostas nesta tela.</Text>
                {selectedCards.map((card, index) => <Text key={card.id} style={styles.bodyText}>{index + 1}. {card.title}</Text>)}
                <PrimaryButton label="Finalizar escolha das perguntas" onPress={startSessionGame} disabled={selectedCardIds.length === 0} />
              </>
            )}
          </View>
          </>
          )}

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
        <>
          <Section title="Jogo de 7 dias">
            {feedback ? <Text style={styles.errorText}>{feedback}</Text> : null}
            {cardOfDay ? (
              <>
                <Text style={styles.helperText}>Dia {dayIndex! + 1} de 7 · Uma carta por dia</Text>
                <View style={styles.cardOfDay}>
                  <Text style={styles.cardOfDayMeta}>{decks.find((deck) => deck.id === cardOfDay.deckId)?.name} · {cardOfDay.classification}</Text>
                  <Text style={styles.bigCardTitle}>{cardOfDay.title}</Text>
                  <Text style={styles.bigCardPrompt}>{cardOfDay.prompt}</Text>
                </View>
                {alreadyAnsweredToday ? (
                  <EmptyState text={dayIndex === 6 ? "Resposta enviada. Você concluiu o jogo de 7 dias." : "Resposta de hoje enviada. A próxima carta aparecerá amanhã."} />
                ) : (
                  <>
                    <Input label="Sua resposta" value={patientAnswer} onChangeText={setPatientAnswer} placeholder="Escreva como isso aparece para você hoje." multiline />
                    <PrimaryButton label={saving ? "Enviando..." : "Enviar resposta"} onPress={submitPatientAnswer} disabled={!patientAnswer.trim() || saving} />
                  </>
                )}
              </>
            ) : (
              <EmptyState text={patientProgram ? "O jogo de 7 dias terminou. Peça ao terapeuta um novo plano." : "Seu terapeuta ainda não configurou um jogo de 7 dias."} />
            )}
          </Section>
        </>
      )}
      {actor !== "patient" ? (
        <Modal visible={editingCardId !== null} transparent animationType="fade" onRequestClose={() => setEditingCardId(null)}>
          <View style={styles.answerModalOverlay}>
            <View style={styles.answerModalContent}>
              <Text style={styles.sectionTitle}>Anotar resposta do paciente</Text>
              <Text style={styles.cardTitle}>{editingCard?.title}</Text>
              <Text style={styles.cardPrompt}>{editingCard?.prompt}</Text>
              <Input label="Resposta" value={sessionAnswer} onChangeText={setSessionAnswer} placeholder="Anote o que o paciente respondeu." multiline />
              {feedback ? <Text style={styles.errorText}>{feedback}</Text> : null}
              <PrimaryButton label={saving ? "Salvando..." : "Salvar resposta"} onPress={saveSessionAnswer} disabled={!sessionAnswer.trim() || saving} />
              <SecondaryButton label="Cancelar" onPress={() => setEditingCardId(null)} disabled={saving} />
            </View>
          </View>
        </Modal>
      ) : null}
    </Screen>
  );
}
